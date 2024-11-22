import React, { useEffect, useState } from "react";
import {
  VStack, Image, Text, Box, ScrollView,
} from "native-base";
import { View } from "react-native";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TEMAS } from "../../../estilos/temas";
// @ts-ignore
import Logo from '../../../assets/imgs/login.png'
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import Toast from 'react-native-toast-message';

// Tipo explícito para os dados do cliente
type ClienteData = {
  empresa: string;
  cnpj: string;
  email: string;
  telefone1: string;
  telefone2: string;
  cep: string;
  numero: string;
  complemento: string;
  endereco: string;
  cidade: string;
  bairro: string;
  uf: string;
};

export default function Editar() {
  const [initialValues, setInitialValues] = useState<ClienteData>({
    empresa: '',
    cnpj: '',
    email: '',
    telefone1: '',
    telefone2: '',
    cep: '',
    numero: '',
    complemento: '',
    endereco: '',
    cidade: '',
    bairro: '',
    uf: '',
  });
  const [loading, setLoading] = useState(true);
  const { id }: { id: string } = useLocalSearchParams(); // Obtendo o ID do usuário

  const clientId = id;

  // Carregar os dados do cliente ao montar o componente
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const docRef = doc(db, 'usuarios', clientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ClienteData>;
          setInitialValues({
            empresa: data.empresa || '',
            cnpj: data.cnpj || '',
            email: data.email || '',
            telefone1: data.telefone1 || '',
            telefone2: data.telefone2 || '',
            cep: data.cep || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            bairro: data.bairro || '',
            uf: data.uf || '',
          });
        } else {
          Toast.show({ type: 'error', text1: 'Cliente não encontrado' });
        }
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Erro ao carregar dados do cliente' });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const salvarCliente = async (dados: ClienteData) => {
    try {
      const docRef = doc(db, 'usuarios', clientId);
      await updateDoc(docRef, dados);
      Toast.show({ type: 'success', text1: 'Dados atualizados com sucesso!' });
      router.back();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao atualizar os dados' });
      console.error(error);
    }
  };

  if (loading) {
    return <Text>Carregando...</Text>; // Ou exiba um spinner
  }

  return (
    <>
      <Box
        alignItems={"center"}
        height="20"
        width="100%"
        flexDir={"row"}
        paddingTop={10}
        backgroundColor={TEMAS.colors.verde}>
        {/* VOLTAR */}
        <View>
          <BotaoVoltar />
        </View>

        {/* TEXTO */}
        <View style={{ flex: 5, }}>
          <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>Cadastro de Clientes</Text>
        </View>

        {/* SAIR */}
        <View>
          <BotaoSair />
        </View>
      </Box>
      <Toast />
      <ScrollView>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={Yup.object().shape({
            empresa: Yup.string().required('Campo "Empresa" obrigatório'),
            cnpj: Yup.string().required('Campo "CNPJ" obrigatório'),
            email: Yup.string().required('Campo "Email" obrigatório').email('Email inválido'),
            telefone1: Yup.string().required('Campo "Telefone" obrigatório'),
            cep: Yup.string().required('Campo "CEP" obrigatório'),
            numero: Yup.string().required('Campo "Número" obrigatório'),
            cidade: Yup.string().required('Campo "Cidade" obrigatório'),
            endereco: Yup.string().required('Campo "Endereço" obrigatório'),
            bairro: Yup.string().required('Campo "Bairro" obrigatório'),
            uf: Yup.string().required('Campo "UF" obrigatório')
          })}
          onSubmit={salvarCliente}
        >
          {({ handleChange, handleBlur, handleSubmit, values, isSubmitting, isValid, errors, touched }) => (
            <VStack flex={1} padding={5}>

              {<Image size={100} alignSelf={'center'} width={150} marginTop="18" source={Logo} alt="background Login" />}

              {/* <Titulo marginTop={"15"} color={TEMAS.colors.verde}>Cadatro de Cliente</Titulo> */}
              <InputTexto label="Empresa:"
                onBlur={handleBlur('empresa')}
                onChangeText={handleChange('empresa')}
                placeholder="Nome"
                value={values.empresa} />
              {touched.empresa && errors.empresa && <Text color={TEMAS.colors.red}>{errors.empresa}</Text>}

              <InputTexto label="CNPJ:"
                onBlur={handleBlur('cnpj')}
                onChangeText={handleChange('cnpj')}
                placeholder="CNPJ"
                value={values.cnpj} />
              {touched.cnpj && errors.cnpj && <Text color={TEMAS.colors.red}>{errors.cnpj}</Text>}

              <InputTexto label="Email:"
                onBlur={handleBlur('email')}
                onChangeText={handleChange('email')}
                placeholder="E-mail"
                value={values.email} />
              {touched.email && errors.email && <Text color={TEMAS.colors.red}>{errors.email}</Text>}

              <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                <Box marginRight={2}>
                  <InputTexto
                    onBlur={handleBlur('telefone1')}
                    onChangeText={handleChange('telefone1')}
                    width="180"
                    bgcolor={TEMAS.colors.cinza}
                    label="Telefones:"
                    placeholder="Telefone"
                    value={values.telefone1} />
                  {touched.telefone1 && errors.telefone1 && <Text color={TEMAS.colors.red}>{errors.telefone1}</Text>}
                </Box>
                <Box>
                  <InputTexto
                    onBlur={handleBlur('telefone2')}
                    onChangeText={handleChange('telefone2')}
                    width="180"
                    label="   "
                    placeholder="Telefone"
                    value={values.telefone2} />
                  {touched.telefone2 && errors.telefone2 && <Text color={TEMAS.colors.red}>{errors.telefone2}</Text>}
                </Box>
              </Box>

              <InputTexto label="Cidade:"
                onBlur={handleBlur('cidade')}
                onChangeText={handleChange('cidade')}
                placeholder="Cidade"
                value={values.cidade} />
              {touched.cidade && errors.cidade && <Text color={TEMAS.colors.red}>{errors.cidade}</Text>}

              <InputTexto label="Endereço:"
                onBlur={handleBlur('endereco')}
                onChangeText={handleChange('endereco')}
                placeholder="Endereço"
                value={values.endereco} />
              {touched.endereco && errors.endereco && <Text color={TEMAS.colors.red}>{errors.endereco}</Text>}

              <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                <Box marginRight={2}>
                  <InputTexto
                    width="180"
                    onBlur={handleBlur('cep')}
                    onChangeText={handleChange('cep')}
                    bgcolor={TEMAS.colors.cinza}
                    label="CEP:"
                    placeholder="CEP"
                    value={values.cep} />
                  {touched.cep && errors.cep && <Text color={TEMAS.colors.red}>{errors.cep}</Text>}
                </Box>
                <Box>
                  <InputTexto
                    onBlur={handleBlur('numero')}
                    onChangeText={handleChange('numero')}
                    width="180"
                    label="Número:"
                    placeholder="Número"
                    value={values.numero} />
                  {touched.numero && errors.numero && <Text color={TEMAS.colors.red}>{errors.numero}</Text>}
                </Box>
              </Box>

              <InputTexto label="Complemento:"
                onBlur={handleBlur('complemento')}
                onChangeText={handleChange('complemento')}
                placeholder="Complemento"
                value={values.complemento} />
              {touched.complemento && errors.complemento && <Text color={TEMAS.colors.red}>{errors.complemento}</Text>}

              <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                <Box marginRight={2}>
                  <InputTexto
                    onBlur={handleBlur('bairro')}
                    onChangeText={handleChange('bairro')}
                    width="180"
                    bgcolor={TEMAS.colors.cinza}
                    label="Bairro:"
                    placeholder="Bairro"
                    value={values.bairro} />
                  {touched.bairro && errors.bairro && <Text color={TEMAS.colors.red}>{errors.bairro}</Text>}
                </Box>
                <Box>
                  <InputTexto
                    onBlur={handleBlur('uf')}
                    onChangeText={handleChange('uf')}
                    width="180"
                    label="UF:"
                    placeholder="UF"
                    value={values.uf} />
                  {touched.uf && errors.uf && <Text color={TEMAS.colors.red}>{errors.uf}</Text>}
                </Box>
              </Box>
              <Botoes onPress={() => handleSubmit()} disabled={isSubmitting} >{isSubmitting ? 'Enviando' : 'Salvar Edição'}</Botoes>
              <Botoes onPress={() => router.back()} backgroundColor={TEMAS.colors.cinza}>Cancelar</Botoes>
            </VStack>
          )}</Formik>
      </ScrollView>
    </>
  )
}
