import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, LogBox, ActivityIndicator } from "react-native";
import Logo from "../../assets/imgs/login.svg";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { TEMAS } from "../../estilos/temas";

export default function Login() {

  const [resultadoLogin, setResultadoLogin] = useState<null | 'logado' | 'falhou'>(null);


  const handleLogin = async ({ email, senha }: any) => {
    setResultadoLogin(null);

    await signInWithEmailAndPassword(auth, email, senha)
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
    <Formik
      initialValues={{ email: '', senha: '' }}
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

        <View style={styles.container} >
          {/* PARTE SUPERIOR BRANCA */}
          <View style={styles.topContainer}>
            <Logo width={200} height={150} />
            <Text style={styles.subtitle}>Gestão de Condicionantes Ambientais</Text>
          </View>

          {/* PARTE INFERIOR CINZA */}
          <View style={styles.bottomContainer}>
            <Text style={styles.title}>Faça seu login</Text>

            <TextInput style={styles.input}
              placeholder="Digite seu email"
              //label = "e-mail"
              onBlur={handleBlur('email')}
              onChangeText={handleChange('email')} />


            <TextInput style={styles.input}
              placeholder="Insira sua senha"
              onBlur={handleBlur('senha')}
              onChangeText={handleChange('senha')}
              secureTextEntry />

            {errors.senha && touched.senha && (
              <Text >{errors.senha}</Text>
            )}
            {isSubmitting ?
              (<ActivityIndicator color={TEMAS.colors.verde} size={30} />)
              :
              (
                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>)}

            {resultadoLogin == 'falhou' && (
              //preciso adicionar o vermelho para avisar o erro de senha ou email incorreto. 
              <Text /*textAlign={'center'} color={TEMAS.colors.red}*/>Email ou senha incorreto</Text>
            )}

            <TouchableOpacity>
              <Text style={styles.forgot} alignSelf="center">Esqueci minha senha</Text>
            </TouchableOpacity>


          </View>
        </View>

      )}
    </Formik>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // fundo  branco
  },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", //container branca cima
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d8b4e",
  },
  subtitle: {
    fontSize: 18,
    color: "#2d8b4e",
    marginTop: 4,
    fontWeight: 'bold'//letra em negritoo 
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "#f2eeeecf", // container cinza claro baixo
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopColor: "#2d8b4e",
    borderTopWidth: 3
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d8b4e",
    marginBottom: 4,
  },
  text: {
    color: "#777",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  forgot: {
    color: "#2d8b4e",
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2d8b4e",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
