import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, LogBox, ActivityIndicator, StatusBar, Alert } from "react-native";
// IMPORTANTE: Comentei o SVG porque sem a configuração avançada do Transformer, ele quebra o Android.
// Use um .png com a tag <Image> padrão do React Native depois!
// import Logo from "../../assets/imgs/login.svg"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { TEMAS } from "../../estilos/temas";
import { theme } from "../../estilos/themes";

export default function Login() {
  const [resultadoLogin, setResultadoLogin] = useState<null | 'logado' | 'falhou'>(null);
  const [mensagemErro, setMensagemErro] = useState<string>('');

  const handleLogin = async ({ email, senha }: any) => {
    setResultadoLogin(null);
    setMensagemErro('');

    await signInWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        // SUCESSO
        const snapshot = await getDoc(doc(db, "usuarios", userCredential.user.uid));
        const dados = snapshot.data();
        if (dados?.nivel == 'admin')
          router.replace('/admin');
        else
          router.replace('/cliente');
      })
      .catch((error) => {
        // FALHOU
        setResultadoLogin('falhou');
        console.log('Erro no Firebase:', error.code, error.message);
        
        // Agora o Firebase vai te dizer exatamente o que deu errado!
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          setMensagemErro('E-mail ou senha incorretos.');
        } else if (error.code === 'auth/invalid-email') {
          setMensagemErro('O formato do e-mail é inválido.');
        } else {
          setMensagemErro('Erro ao tentar logar. Tente novamente.');
        }
      });
  };

  useEffect(() => {
    LogBox.ignoreLogs(['In React 18, SSRProvider is not necessary']);
  }, []);

  return (
    <>
      <StatusBar backgroundColor={theme.colors.background} />
      
      <Formik
        initialValues={{ email: '', senha: '' }}
        validationSchema={Yup.object().shape({
          email: Yup.string().required('Informe o E-mail').email('E-mail não válido'),
          senha: Yup.string().required('Informe sua senha').min(3, 'A senha precisa ter 3 caracteres')
        })}
        onSubmit={handleLogin}
      >
        {({ errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
          <View style={styles.container}>
            
            {/* PARTE SUPERIOR BRANCA */}
            <View style={styles.topContainer}>
              {/* Espaço reservado para a Logo (usar PNG) */}
              <View style={{ width: 150, height: 150, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 20 }}>
                <Text style={{ color: '#aaa', fontWeight: 'bold' }}>Sua Logo Aqui</Text>
              </View>
              
              <Text style={styles.subtitle}>Gestão de Condicionantes Ambientais</Text>
            </View>

            {/* PARTE INFERIOR CINZA */}
            <View style={styles.bottomContainer}>
              <Text style={styles.title}>Faça seu login</Text>

              <TextInput 
                style={styles.input}
                placeholder="Digite seu email"
                autoCapitalize="none" // Importante para o Firebase não bugar com a primeira letra maiúscula
                keyboardType="email-address"
                onBlur={handleBlur('email')}
                onChangeText={handleChange('email')} 
              />
              {errors.email && touched.email && (
                <Text style={styles.errorTextForm}>{errors.email}</Text>
              )}

              <TextInput 
                style={styles.input}
                placeholder="Insira sua senha"
                onBlur={handleBlur('senha')}
                onChangeText={handleChange('senha')}
                secureTextEntry 
              />
              {errors.senha && touched.senha && (
                <Text style={styles.errorTextForm}>{errors.senha}</Text>
              )}

              {isSubmitting ? (
                <ActivityIndicator color={TEMAS.colors.verde} size={30} style={{ marginVertical: 10 }} />
              ) : (
                <TouchableOpacity onPress={() => handleSubmit()} style={styles.button}>
                  <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>
              )}

              {resultadoLogin === 'falhou' && (
                <Text style={styles.errorTextFirebase}>{mensagemErro}</Text>
              )}

              <TouchableOpacity>
                <Text style={styles.forgot}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </Formik>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#2d8b4e", 
    marginTop: 4,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "#f2eeeecf", 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopColor: "#2d8b4e",
    borderTopWidth: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d8b4e",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  forgot: {
    color: "#2d8b4e",
    fontSize: 14,
    marginTop: 15,
    alignSelf: "center", // Movido para dentro do estilo
  },
  button: {
    backgroundColor: "#2d8b4e",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorTextForm: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  errorTextFirebase: {
    color: "red",
    fontSize: 14,
    marginTop: 15,
    textAlign: "center",
    fontWeight: "bold",
  }
});