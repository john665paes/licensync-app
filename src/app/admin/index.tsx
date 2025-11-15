import React from "react";
import { router } from "expo-router";
// @ts-ignore
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { TouchableOpacity, View, Text, StyleSheet, SafeAreaView, StatusBar, Image, ScrollView, Button } from "react-native";
import { useEffect } from "react";
import { ScreenContainer } from "../../componentes/ScreenContainer";
import HomeHeader from "../../componentes/HomeHeader";
import {theme} from "../../estilos/themes";



function ConteudoDeBaixo() {
    return (
        <View>
            <Text style={styles.subtitulo}>Área de Ações</Text>
            <Text>Este conteúdo fica no painel cinza.</Text>
            <Button title="Clique-me" onPress={() => alert("Clicou!")} />
        </View>
    );
}
export default function IndexADM() {


    const [nomeUsuario, setNomeUsuario] = React.useState('');
    useEffect(() => {
        const fetchName = async () => {
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.email === auth.currentUser?.email) {
                    setNomeUsuario(data.nome);
                    console.log(nomeUsuario, "logado");
                }
            });
        };
        fetchName();
    }, []);


    return (
        <>
        <SafeAreaView style={{ flex: 1 }}>
            <HomeHeader></HomeHeader>
            {/* 2. Use o ScreenContainer e passe os componentes via props */}
            <ScreenContainer style={{ flex: 3 }}
                topContent={<ConteudoDeCima />}
                bottomContent ={<ConteudoDeBaixo />}
            />
        </SafeAreaView>
            {/* <View>

                <TouchableOpacity onPress={() => {console.log('clicou em clientes');
                    router.push('/admin/clientes')}} >
                    <Text>Clientes</Text>

                </TouchableOpacity>


                <TouchableOpacity onPress={() =>  {console.log('clicou cadastro')
                    router.push('/admin/cadastro')}}>
                    <Text> Cadastrar Clientes</Text>
                </TouchableOpacity>

            </View > */}
        </>
    );
}
function useAuth(): { user: any; } {
    throw new Error("Function not implemented.");
}
const styles = StyleSheet.create({
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

