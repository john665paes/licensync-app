import { VStack, Image, Box, Link } from "native-base";
import Logo from '../../assets/imgs/login.png'
import React from "react";
import { Titulo } from "../../componentes/titulo";
import { Botoes } from "../../componentes/botoes";
import { InputTexto } from "../../componentes/formulario";
import { Formik } from 'formik';
import { router } from "expo-router";

export default function Login() {

  // ==========================================
  const onSubmit = ({email, senha}) => {
    console.log('Teste')
    router.replace('/admin')
  }
  // ==========================================
  return (
    <VStack flex={1} alignItems="center" justifyContent="center " padding={5}>
      <Image size={100} width={190} marginTop={40} source={Logo} alt="background Login" />
     
      <Titulo>
          Faça login em sua conta
      </Titulo>

      <Formik  
        initialValues={{email: '', senha: ''}}
        onSubmit={onSubmit}
      >
        {({handleChange, handleSubmit}) => (
          <>
            <Box >
              <InputTexto label="E-mail" placeholder="Digite seu e-mail" onChangeText={handleChange('email')}/>
              <InputTexto label="Senha" placeholder="Insira sua senha" onChangeText={handleChange('senha')}/>

              <Botoes onPress={handleSubmit}>
                Entrar
            </Botoes>
            </Box>
          
            
            <Link href="" mt={6}>Esqueceu sua senha?</Link>
          </>
        )}
      </Formik>
    </VStack>
  );
}