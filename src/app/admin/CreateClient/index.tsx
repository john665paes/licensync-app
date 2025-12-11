import React from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, SafeAreaView
} from "react-native";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Toast from 'react-native-toast-message';
import MaskInput, { Masks } from 'react-native-mask-input';
import Homeheader from "../../../componentes/HomeHeader";
import { auth, db } from "../../../config/firebase";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";

// Schema (Mantido)
const CadastroSchema = Yup.object().shape({
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

export default function CreateClient() {

  const salvarCliente = async (dados: any) => {
    await createUserWithEmailAndPassword(auth, dados.email, dados.cnpj)
      .then((userCredential) => {
        const user = userCredential.user;
        setDoc(doc(db, 'usuarios', user.uid), {
          ...dados,
          id: user.uid,
          nivel: 'cliente'
        });
        Toast.show({
          type: 'success',
          text1: 'Cliente Cadastrado'
        });
        router.back()
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível concluir o cadastro'
        });
        console.error(error);
      });

  }

  const DashboardContent = () => (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Formik
        initialValues={{
          empresa: '',
          email: '',
          telefone1: '',
          telefone2: '',
          cnpj: '',
          nomeContato: '',
          endereco: '',
          cep: '',
          numero: '',
          bairro: '',
          uf: '',
          complemento: '',
          observacoes: '',
        }}
        validationSchema={CadastroSchema}
        onSubmit={salvarCliente}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
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
              error={touched.email ? errors.email : ''}
            />
             <View style={styles.row}>
              <View style={[styles.col, { marginRight: 15 }]}>
                <InputLabel
                  label="Telefone"
                placeholder="(00) 00000-0000"
                value={values.telefone1}
                onChangeText={handleChange('telefone1')}
                mask={Masks.BRL_PHONE}
                error={touched.telefone1 ? errors.telefone1 : ''}
                />
              </View>
              <View style={styles.col}>
                <InputLabel
                   label="Telefone(Opcional)"
                placeholder="(00) 00000-0000"
                value={values.telefone2}
                onChangeText={handleChange('telefone2')}
                mask={Masks.BRL_PHONE}
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
              error={touched.cnpj ? errors.cnpj : ''}
            />
            <InputLabel
              label="Nome do Contato"
              placeholder="Nome Completo"
              value={values.nomeContato}
              onChangeText={handleChange('nomeContato')}
              error={touched.nomeContato ? errors.nomeContato : ''}
            />
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
                  label="CEP"
                  placeholder="00000-000"
                  value={values.cep}
                  onChangeText={handleChange('cep')}
                  mask={Masks.BRL_POSTAL_CODE}
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
                  error={touched.uf ? errors.uf : ''}
                />
              </View>
            </View>
            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => router.back()}>
                <Text style={styles.txtCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnNext} onPress={() => handleSubmit()}>
                <Text style={styles.txtNext}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </ScrollView>
  );


  return (
    <SafeAreaView style={{ flex: 3 }}>
      <Homeheader />
      <ScreenContainer
        bottomContent={<DashboardContent />}
      />
    </SafeAreaView>
  );
}

// ------------------------------------------------------------------
// COMPONENTE INTELIGENTE: Sabe ser Input normal ou Input com Máscara
// ------------------------------------------------------------------
const InputLabel = ({ label, error, style, mask, ...props }: any) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>

      {/* Se tiver a prop "mask", usa o MaskInput, senão usa TextInput normal */}
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

// Estilos (Iguais ao anterior)
const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#1F2937' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 2 },
  footerButtons: { flexDirection: 'row', gap: 15, marginTop: 20, marginBottom: 20 },
  btnCancel: { flex: 1, paddingVertical: 14, borderRadius: 25, borderWidth: 1, borderColor: '#9CA3AF', alignItems: 'center' },
  txtCancel: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  btnNext: { flex: 1, paddingVertical: 14, borderRadius: 25, backgroundColor: '#10B981', alignItems: 'center' },
  txtNext: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});