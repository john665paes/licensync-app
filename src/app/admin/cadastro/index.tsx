import {
  VStack, Image, Text, Box, FormControl,
  Input, Button, Link,
  Center,
  ScrollView
} from "native-base";
import React from "react";
import { Titulo } from "../../../componentes/titulo";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { View } from "react-native";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TEMAS } from "../../../estilos/temas";
import Logo from '../../../assets/imgs/login.png'
import { isValid } from "date-fns";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../config/firebase";
import { addDoc, doc, setDoc } from "firebase/firestore";
import Toast from 'react-native-toast-message';

export default function Cadastro() {

  // ============================================================
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
  // ============================================================
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
          initialValues={{empresa: '', cnpj: '', email: '', telefone1: '',telefone2: '', cep: '', numero: '', complemento: '', endereco: '', cidade: '', bairro: '', uf: ''}}
          validationSchema={Yup.object().shape({
            empresa: Yup.string().required('Campo Empresa obrigatório'),
            cnpj: Yup.string().required('Campo CNPJ obrigatório'),
            email: Yup.string().required('Campo Email obrigatório').email('Email inválido'),
            telefone1: Yup.string().required('Campo Telefone obrigatório'),
            cep: Yup.string().required('Campo CEP obrigatório'),
            numero: Yup.string().required('Campo Número obrigatório'),
            cidade: Yup.string().required('Campo Cidade obrigatório'),
            bairro: Yup.string().required('Campo Bairro obrigatório'),
            uf: Yup.string().required('Campo UF obrigatório')
          })}
          onSubmit={salvarCliente}
        >
          {({handleChange, handleBlur, handleSubmit, values, isSubmitting, isValid, errors, touched}) => (
              <VStack flex={1} padding={5}>

                {<Image size={100} alignSelf={'center'} width={150} marginTop="18" source={Logo} alt="background Login" />}
      
                {/* <Titulo marginTop={"15"} color={TEMAS.colors.verde}>Cadatro de Cliente</Titulo> */}
                <InputTexto label="Empresa:"
                  onBlur={handleBlur('empresa')}
                  onChangeText={handleChange('empresa')}
                  placeholder="Nome" />
                  {touched.empresa && errors.empresa && <Text color={TEMAS.colors.red}>{errors.empresa}</Text>}
      
                <InputTexto label="CNPJ:"
                  onBlur={handleBlur('cnpj')}
                  onChangeText={handleChange('cnpj')}
                  placeholder="CNPJ" />
                  {touched.cnpj && errors.cnpj && <Text color={TEMAS.colors.red}>{errors.cnpj}</Text>}
      
                <InputTexto label="Email:"
                  onBlur={handleBlur('email')}
                  onChangeText={handleChange('email')}
                  placeholder="E-mail" />
                  {touched.email && errors.email && <Text color={TEMAS.colors.red}>{errors.email}</Text>}
      
                <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                  <Box marginRight={2}>
                    <InputTexto
                      onBlur={handleBlur('telefone1')}
                      onChangeText={handleChange('telefone1')}
                      width="180"
                      bgcolor={TEMAS.colors.cinza}
                      label="Telefones:"
                      placeholder="Telefone" />
                      {touched.telefone1 && errors.telefone1 && <Text color={TEMAS.colors.red}>{errors.telefone1}</Text>}
                  </Box>
                  <Box>
                    <InputTexto
                      onBlur={handleBlur('telefone2')}
                      onChangeText={handleChange('telefone2')}
                      width="180"
                      label="   "
                      placeholder="Telefone" />
                      {touched.telefone2 && errors.telefone2 && <Text color={TEMAS.colors.red}>{errors.telefone2}</Text>}
                  </Box>
                </Box>
                
                <InputTexto label="Cidade:"
                  onBlur={handleBlur('cidade')}
                  onChangeText={handleChange('cidade')}
                  placeholder="Cidade" />
                  {touched.cidade && errors.cidade && <Text color={TEMAS.colors.red}>{errors.cidade}</Text>}

                <InputTexto label="Endereço:"
                  onBlur={handleBlur('endereco')}
                  onChangeText={handleChange('endereco')}
                  placeholder="Endereço" />
                  {touched.endereco && errors.endereco && <Text color={TEMAS.colors.red}>{errors.endereco}</Text>}  
      
                <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                  <Box marginRight={2}>
                    <InputTexto
                      width="180"
                      onBlur={handleBlur('cep')}
                      onChangeText={handleChange('cep')}
                      bgcolor={TEMAS.colors.cinza}
                      label="CEP:"
                      placeholder="CEP" />
                      {touched.cep && errors.cep && <Text color={TEMAS.colors.red}>{errors.cep}</Text>}
                  </Box>
                  <Box>
                    <InputTexto
                      onBlur={handleBlur('numero')}
                      onChangeText={handleChange('numero')}
                      width="180"
                      label="Número:"
                      placeholder="Número" />
                      {touched.numero && errors.numero && <Text color={TEMAS.colors.red}>{errors.numero}</Text>}
                  </Box>
                </Box>
                
                <InputTexto label="Complemento:"
                  onBlur={handleBlur('complemento')}
                  onChangeText={handleChange('complemento')}
                  placeholder="Complemento" />
                  { touched.complemento && errors.complemento && <Text color={TEMAS.colors.red}>{errors.complemento}</Text>}

                <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                  <Box marginRight={2}>
                    <InputTexto
                      onBlur={handleBlur('bairro')}
                      onChangeText={handleChange('bairro')}
                      width="180"
                      bgcolor={TEMAS.colors.cinza}
                      label="Bairro:"
                      placeholder="Bairro" />
                      { touched.bairro && errors.bairro && <Text color={TEMAS.colors.red}>{errors.bairro}</Text>}
                  </Box>
                  <Box>
                    <InputTexto
                      onBlur={handleBlur('uf')}
                      onChangeText={handleChange('uf')}
                      width="180"
                      label="UF:"
                      placeholder="UF" />
                      { touched.uf && errors.uf && <Text color={TEMAS.colors.red}>{errors.uf}</Text>}
                  </Box>
                </Box>
                <Botoes onPress={() => handleSubmit()} disabled={isSubmitting} >{isSubmitting ? 'Enviando' : 'Salvar Cadastro'}</Botoes>
                <Botoes onPress={() => router.back()} backgroundColor={TEMAS.colors.cinza}>Cancelar</Botoes>
              </VStack>
          )}</Formik>
      </ScrollView>
    </>
  );
}