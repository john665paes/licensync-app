import { VStack, Image, Box, Link, Text } from "native-base";
import { useEffect, useState } from "react";
// @ts-ignore
import Logo from '../../assets/imgs/login.png'
import React from "react";
import { Titulo } from "../../componentes/titulo";
import { Botoes } from "../../componentes/botoes";
import { InputTexto } from "../../componentes/formulario";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router } from "expo-router";
import { TEMAS } from '../../estilos/temas'
import { auth, db } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { doc, getDoc } from "firebase/firestore";
import { LogBox } from "react-native";

export default function Login() {

  const [resultadoLogin, setResultadoLogin] = useState<null | 'logado' | 'falhou'>(null);


  const handleLogin = async ({ email, senha }: any) => {
    setResultadoLogin(null);

    signInWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        //SUCESSO    
        const snapshot = await getDoc(doc(db, "usuarios", userCredential.user.uid));
        const dados = snapshot.data();
        if (dados?.nivel == 'admin')
          router.replace('/admin');
        else
          router.replace('/cliente');
      })
      .catch((error) => {
        //FALHOU
        setResultadoLogin('falhou');
        console.log('falhou')
      });
  };

  useEffect(() => {
    LogBox.ignoreLogs(['In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.']);
  }, []);


  return (
    <VStack flex={1} alignItems="center" justifyContent="center" padding={5}>
      <Image size={100} width={190} marginTop={40} source={Logo} alt="background Login" />

      <Formik
        initialValues={{ email: 'cliente@teste.com', senha: '123456' }}
        validationSchema={Yup.object().shape({
          email: Yup.string().required('Informe o E-mail').email('E-mail não válido'),

          senha: Yup.string().required('Informe sua senha').min(3, 'A senha precisa ter 3 caracteres')
        })}
        onSubmit={handleLogin}>

        {({ errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting, }) => (
          <>
            <Titulo>
              Faça login em sua conta
            </Titulo>

            <Box >
              <InputTexto
                width="300"
                label="E-mail"
                placeholder="Digite seu e-mail"
                value="cliente@teste.com"
                onBlur={handleBlur('email')}
                onChangeText={handleChange('email')}
              />
              {errors.email && touched.email && (
                <Text >{errors.email}</Text>
              )}

              <InputTexto
                width="300"
                label="Senha"
                placeholder="Insira sua senha"
                value="123456"
                onBlur={handleBlur('senha')}
                onChangeText={handleChange('senha')}
                secureTextEntry
              />
              {errors.senha && touched.senha && (
                <Text >{errors.senha}</Text>
              )}
              <Botoes
                onPress={handleSubmit}
                disabled={isSubmitting}>
                Entrar
              </Botoes>

              {resultadoLogin == 'falhou' && (
                <Text textAlign={'center'} color={TEMAS.colors.red}>Email ou senha incorreto</Text>
              )}
            </Box>

            <Link href="" mt={6}>Esqueceu sua senha?</Link>
          </>
        )}
      </Formik>
    </VStack>
  );
}