import React, { useEffect } from "react"; // Juntei os imports
import { router } from "expo-router";
// @ts-ignore
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { TouchableOpacity, View, Text, StyleSheet, SafeAreaView } from "react-native";
import { ScreenContainer } from "../../componentes/ScreenContainerpags";
import HomeHeader from "../../componentes/Headerprofile";
import { theme } from "../../estilos/themes";

export default function IndexADM() {

    const [nomeUsuario, setNomeUsuario] = React.useState('');

    // DICA EXTRA DO CHIPÃO: 
    // Buscar TODOS os usuários pra achar UM não é performático.
    // O ideal seria buscar direto pelo ID: doc(db, "usuarios", auth.currentUser.uid)
    useEffect(() => {
        const fetchName = async () => {
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.email === auth.currentUser?.email) {
                    setNomeUsuario(data.nome);
                    console.log(data.nome, "logado"); // Ajustei para logar o dado direto
                }
            });
        };
        fetchName();
    }, []);


    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <HomeHeader
                    userName={nomeUsuario}               
                
                />
                
                {/* AQUI ESTAVA O ERRO */}
                <ScreenContainer
                    // Você precisa passar a View dentro da prop bottomContent={}
                    bottomContent={
                        <View style={styles.buttonsContainer}> 
                            <TouchableOpacity 
                                style={styles.botao} // Adicionei um estilo de exemplo
                                onPress={() => {
                                    console.log('clicou em clientes');
                                    router.push('/admin/clientes')
                                }} 
                            >
                                <Text>Clientes</Text>
                            </TouchableOpacity>


                            <TouchableOpacity 
                                style={styles.botao} // Adicionei um estilo de exemplo
                                onPress={() => {
                                    console.log('clicou cadastro')
                                    router.push('/admin/cadastro')
                                }}>
                                <Text>Cadastrar Clientes</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </SafeAreaView>
        </>
    );
}

// Removi a function useAuth() que jogava erro

const styles = StyleSheet.create({
    // Adicionei um estilo pra organizar seus botões
    buttonsContainer: {
        width: '100%',
        padding: 10,
        gap: 10, // Espaço entre os botões
    },
    botao: {
        padding: 15,
        backgroundColor: '#ddd', // Só pra você ver o botão
        borderRadius: 8,
        alignItems: 'center'
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
});
