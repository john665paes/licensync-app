import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Image, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from 'react-native-toast-message';
import MaskInput, { Masks } from 'react-native-mask-input';
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

import Homeheader from "../../../componentes/HomeHeader";
import { db, storage } from "../../../config/firebase";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import { UserCog } from "lucide-react-native";

// Schema de Validação
const EditSchema = Yup.object().shape({
  empresa: Yup.string().required('Nome obrigatório'),
  email: Yup.string().email('E-mail Inválido').required('Obrigatório'),
  telefone1: Yup.string().required('Obrigatório'),
  telefone2: Yup.string(),
  cnpj: Yup.string().required('Obrigatório'),
  nomeContato: Yup.string().required('Obrigatório'),
  endereco: Yup.string().required('Obrigatório'),
  cep: Yup.string().required('Obrigatório'),
  numero: Yup.string().required('Obrigatório'),
  bairro: Yup.string().required('Obrigatório'),
  uf: Yup.string().required('Obrigatório'),
  complemento: Yup.string(),
  observacoes: Yup.string(),
});

export default function EditClient() {
  const { id } = useLocalSearchParams(); // Pega o ID do cliente que veio pela rota
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Valores Iniciais do Formulário
  const [initialValues, setInitialValues] = useState({
    empresa: '', email: '', telefone1: '', telefone2: '', cnpj: '',
    nomeContato: '', endereco: '', cep: '', numero: '', bairro: '',
    uf: '', complemento: '', observacoes: '', fotoPerfil: ''
  });

  // --- MENU SUPERIOR ---
  const opcoesMenu = [
    { 
      id: 1, 
      label: 'Inicio', 
      icon: <UserCog size={20} color="#333" />, 
      onPress: () => router.push('admin/')
    },
  ];

  // --- CARREGAR DADOS DO CLIENTE ---
  useEffect(() => {
    const carregarCliente = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'usuarios', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setInitialValues({
            empresa: data.empresa || '',
            email: data.email || '',
            telefone1: data.telefone1 || '',
            telefone2: data.telefone2 || '',
            cnpj: data.cnpj || '',
            nomeContato: data.nomeContato || '',
            endereco: data.endereco || '',
            cep: data.cep || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            uf: data.uf || '',
            complemento: data.complemento || '',
            observacoes: data.observacoes || '',
            fotoPerfil: data.fotoPerfil || ''
          });
          
          if (data.fotoPerfil) {
            setImageUri(data.fotoPerfil);
          }
        } else {
          Alert.alert("Erro", "Cliente não encontrado.");
          if (router.canGoBack()) router.back(); else router.replace('/admin');
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        Alert.alert("Erro", "Falha ao carregar as informações do cliente.");
      } finally {
        setIsFetching(false);
      }
    };

    carregarCliente();
  }, [id]);

  // --- SELECIONAR IMAGEM ---
  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const res = await ImagePicker.requestCameraPermissionsAsync();
    if (!res.granted) return Alert.alert("Ops", "Precisamos da câmera!");
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleEditImage = () => {
    Alert.alert("Foto do Cliente", "Escolha de onde quer pegar a foto:", [
      { text: "Cancelar", style: "cancel" },
      { text: "Galeria", onPress: pickImageFromGallery },
      { text: "Câmera", onPress: takePhoto },
    ]);
  };

  // --- BUSCA DO CEP ---
  const buscarCEP = async (cep: string, setFieldValue: any) => {
    const cepLimpo = cep.replace(/\D/g, ''); 
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFieldValue('endereco', data.logradouro);
          setFieldValue('bairro', data.bairro);
          setFieldValue('uf', data.uf);
        }
      } catch (error) {
        console.log("Erro ao buscar CEP", error);
      }
    }
  };

  // --- SALVAR EDIÇÃO ---
  const atualizarCliente = async (dados: any) => {
    setIsLoading(true);
    try {
      let fotoPerfilUrl = initialValues.fotoPerfil;

      // Se a imagem for diferente da original (o usuário escolheu uma nova da galeria/câmera)
      if (imageUri && imageUri !== initialValues.fotoPerfil) {
        const blob: any = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Falha na requisição de rede"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", imageUri, true);
          xhr.send(null);
        });

        const filename = `perfil_clientes/${id}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        fotoPerfilUrl = await getDownloadURL(storageRef);
      }

      // Atualiza o Firestore
      await updateDoc(doc(db, 'usuarios', id as string), {
        ...dados,
        fotoPerfil: fotoPerfilUrl
      });

      Toast.show({ type: 'success', text1: 'Cliente Atualizado com Sucesso!' });
      setTimeout(() => {if (router.canGoBack()) router.back(); else router.replace('/admin');}, 1000);

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao atualizar cliente' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  const conteudoFormulario = (
    <ScrollView style={{ flex: 1, padding: 10 }} showsVerticalScrollIndicator={false}>
      
      {/* COMPONENTE DA FOTO DE PERFIL */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={handleEditImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <Feather name="camera" size={32} color="#9CA3AF" />
          )}
        </TouchableOpacity>
        <Text style={styles.avatarText}>Alterar Logo/Foto</Text>
      </View>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true} // Isso é fundamental para carregar os dados no Formik
        validationSchema={EditSchema}
        onSubmit={atualizarCliente}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <>
            <InputLabel
              label="Empresa"
              placeholder="Nome da Empresa"
              value={values.empresa}
              onChangeText={handleChange('empresa')}
              error={touched.empresa ? errors.empresa : ''}
            />
            <InputLabel
              label="Email"
              placeholder="email@example.com"
              value={values.email}
              onChangeText={handleChange('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={touched.email ? errors.email : ''}
              // Email geralmente não se altera facilmente por estar atrelado ao Auth, 
              // mas deixei editável conforme seu pedido. Se quiser bloquear, adicione: editable={false}
            />
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 15 }]}>
                <InputLabel
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  value={values.telefone1}
                  onChangeText={handleChange('telefone1')}
                  mask={Masks.BRL_PHONE}
                  keyboardType="numeric"
                  error={touched.telefone1 ? errors.telefone1 : ''}
                />
              </View>
              <View style={styles.col}>
                <InputLabel
                  label="Telefone (Opcional)"
                  placeholder="(00) 00000-0000"
                  value={values.telefone2}
                  onChangeText={handleChange('telefone2')}
                  mask={Masks.BRL_PHONE}
                  keyboardType="numeric"
                  error={touched.telefone2 ? errors.telefone2 : ''}
                />
              </View>
            </View>
            <InputLabel
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={values.cnpj}
              onChangeText={handleChange('cnpj')}
              mask={Masks.BRL_CNPJ}
              keyboardType="numeric"
              error={touched.cnpj ? errors.cnpj : ''}
            />
            <InputLabel
              label="Nome do Contato"
              placeholder="Nome Completo"
              value={values.nomeContato}
              onChangeText={handleChange('nomeContato')}
              error={touched.nomeContato ? errors.nomeContato : ''}
            />
            
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <InputLabel
                  label="CEP"
                  placeholder="00000-000"
                  value={values.cep}
                  onChangeText={(text: string) => {
                    handleChange('cep')(text);
                    buscarCEP(text, setFieldValue); 
                  }}
                  mask={Masks.BRL_POSTAL_CODE}
                  keyboardType="numeric"
                  error={touched.cep ? errors.cep : ''}
                />
              </View>
              <View style={styles.col}>
                <InputLabel
                  label="Número"
                  placeholder="000"
                  value={values.numero}
                  onChangeText={handleChange('numero')}
                  keyboardType="numeric"
                  error={touched.numero ? errors.numero : ''}
                />
              </View>
            </View>
            
            <InputLabel
              label="Endereço"
              placeholder="Rua/Avenida"
              value={values.endereco}
              onChangeText={handleChange('endereco')}
              error={touched.endereco ? errors.endereco : ''}
            />
            
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <InputLabel
                  label="Bairro"
                  placeholder="Bairro"
                  value={values.bairro}
                  onChangeText={handleChange('bairro')}
                  error={touched.bairro ? errors.bairro : ''}
                />
              </View>
              <View style={styles.col}>
                <InputLabel
                  label="UF"
                  placeholder="AL"
                  value={values.uf}
                  onChangeText={handleChange('uf')}
                  maxLength={2}
                  autoCapitalize="characters"
                  error={touched.uf ? errors.uf : ''}
                />
              </View>
            </View>
            
            <InputLabel
              label="Complemento (Opcional)"
              placeholder="Apartamento, bloco, etc."
              value={values.complemento}
              onChangeText={handleChange('complemento')}
              error={touched.complemento ? errors.complemento : ''}
            />
            <InputLabel
              label="Observações (Opcional)"
              placeholder="Observações adicionais"
              value={values.observacoes}
              onChangeText={handleChange('observacoes')}
              error={touched.observacoes ? errors.observacoes : ''}
            />

            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => {
                if (router.canGoBack()) router.back(); else router.replace('/admin'); 
              }} disabled={isLoading}>
                <Text style={styles.txtCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnNext, isLoading && { opacity: 0.7 }]} 
                onPress={() => handleSubmit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.txtNext}>Salvar Edição</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Homeheader 
        title="Editar Cliente"
        onBackPress={() => {if (router.canGoBack()) router.back(); else router.replace('/admin');}}
        menuOptions={opcoesMenu}
      />
      <ScreenContainer bottomContent={conteudoFormulario} /> 
      <Toast />
    </SafeAreaView>
  );
}

// ------------------------------------------------------------------
// COMPONENTE INTELIGENTE: Input normal ou Input com Máscara
// ------------------------------------------------------------------
const InputLabel = ({ label, error, style, mask, ...props }: any) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>

      {mask ? (
        <MaskInput
          mask={mask}
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      ) : (
        <TextInput
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  avatarContainer: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  avatarWrapper: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#10B981',
    overflow: 'hidden'
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { marginTop: 8, color: '#6B7280', fontSize: 14, fontWeight: '500' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#1F2937' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 2 },
  footerButtons: { flexDirection: 'row', gap: 15, marginTop: 20, marginBottom: 40 },
  btnCancel: { flex: 1, paddingVertical: 14, borderRadius: 25, borderWidth: 1, borderColor: '#9CA3AF', alignItems: 'center' },
  txtCancel: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  btnNext: { flex: 1, paddingVertical: 14, borderRadius: 25, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  txtNext: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});