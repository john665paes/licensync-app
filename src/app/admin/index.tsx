import { router } from "expo-router";
import {
    VStack,
    Image,
    Text,
    Box,
    FormControl,
    Input,
    Button,
    Link,
    Center
} from "native-base";
import React, { useEffect } from "react";
import { View } from "react-native";
import { SvgUri } from "react-native-svg";
import { BotaoVoltar } from "../../componentes/botoes/back";
import { BotaoSair } from "../../componentes/botoes/exit";
import { Botoes } from "../../componentes/botoes";
// @ts-ignore
import Logo from '../../assets/imgs/login.png'
import { TEMAS } from "../../estilos/temas";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
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
            <Box
                height="20"
                width="100%"
                flexDir={"row"}
                paddingTop={10}

                backgroundColor={TEMAS.colors.verde}>
                {/* VOLTAR */}
                <View>
                    {/* <BotaoVoltar /> */}
                </View>

                {/* TEXTO */}
                <View style={{ flex: 1, }}>
                    <Text color={TEMAS.colors.branco} textAlign={"left"} fontSize={20}>  Olá,  {nomeUsuario}</Text> 

                </View>

                {/* SAIR */}
                <View>
                    <BotaoSair />
                </View>
            </Box>
            <Box >
                <VStack flex={1} alignItems="center" padding={5} >
                    {<Image size={100} width={150} marginTop="18" source={Logo} alt="background Login" />}


                    <Botoes onPress={() => router.push('/admin/clientes')} width="100%" >
                        Clientes
                    </Botoes>


                    <Botoes width="100%" onPress={() => router.push('/admin/cadastro')}>
                        Cadastrar Clientes
                    </Botoes>
                </VStack>
            </Box>


        </>
    );
}
function useAuth(): { user: any; } {
    throw new Error("Function not implemented.");
}

