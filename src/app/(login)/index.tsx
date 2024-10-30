import { VStack, Image, Box, Link, Text } from "native-base";
import { useState } from "react";
import Logo from '../../assets/imgs/login.png'
import React from "react";
import { Titulo } from "../../componentes/titulo";
import { Botoes } from "../../componentes/botoes";
import { InputTexto } from "../../componentes/formulario";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router } from "expo-router";

export default function Login() {

  const [resultadoLogin, setResultadoLogin] = useState<null | 'logado' | 'falhou'>(null);


  const handleLogin = async({email, senha}: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email.trim() == 'teste@teste.com' && senha.trim() =='123'){
      setResultadoLogin('logado');
      console.log('logado')
      router.replace('/admin');
    }else {setResultadoLogin('falhou');
    }
  };


  return (
    <VStack flex={1} alignItems="center" justifyContent="center" padding={5}>
      <Image size={100} width={190} marginTop={40} source={Logo} alt="background Login" />

      <Formik

        initialValues={{email: '', senha: ''}}
        validationSchema={Yup.object().shape({
          email: Yup.string().required('Informe o E-mail').email('E-mail não válido'),

          senha: Yup.string().required('Informe sua senha').min(3, 'A senha precisa ter 3 caracteres')
        })}
        onSubmit={handleLogin}>


        {({errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,}) => (
          <>

            <Titulo>
                Faça login em sua conta
            </Titulo>

            <Box >
              <InputTexto
              label="E-mail"
              placeholder="Digite seu e-mail"
              onBlur={handleBlur('email')}
              onChangeText={handleChange('email')}
              />
              {errors.email && touched.email && (
                <Text >{errors.email}</Text>
              )}

              <InputTexto
              label="Senha"
              placeholder="Insira sua senha"
              onBlur={handleBlur('senha')}
              onChangeText={handleChange('senha')}
              secureTextEntry
              />
              {errors.senha && touched.senha &&(
                <Text >{errors.senha}</Text>
              )}
              <Botoes
              onPress={handleSubmit}
              disabled={isSubmitting}>
                Entrar
              </Botoes>

              {resultadoLogin =='logado' && (
              <Text >Logado com sucesso</Text>
              )}
              {resultadoLogin == 'falhou' && (
                <Text >Email ou senha incorreto</Text>
              )}
            </Box>

            <Link href="" mt={6}>Esqueceu sua senha?</Link>
          </>
        )}
      </Formik>
    </VStack>
  );
}