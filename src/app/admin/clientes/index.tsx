import {
  VStack, Image, Text, Box, FormControl,
  Input, Button, Link,
  Center,
  ScrollView
} from "native-base";
import React, { useEffect } from "react";
import { Titulo } from "../../../componentes/titulo";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { FlatList, View } from "react-native";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";

import { TEMAS } from "../../../estilos/temas";
// @ts-ignore
import Logo from '../../../assets/imgs/login.png'
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";



export default function Clientes() {
  const [clientes, setClientes] = React.useState<any>({});
  const listarClientes = async () => {

    const snapshot = await getDocs(collection(db, "usuarios"));
    const listaClientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const clientes = listaClientes.filter((item: any) => item.nivel == 'cliente')
        .sort((a: any, b: any) => a.empresa.localeCompare(b.empresa));
  ;
    setClientes(clientes);
  }
''


  // ---------
  useEffect(() => {
    listarClientes();
  }, [])
  // ============================================    
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
          <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>Clientes</Text>
        </View>

        {/* SAIR */}
        <View>
          <BotaoSair />
        </View>
      </Box>
      <ScrollView >
        <VStack flex={1} padding={5}>

          {<Image size={100} alignSelf={'center'} width={150} marginTop="18" source={Logo} alt="background Login" />}

          {/* <Titulo marginTop={"15"} color={TEMAS.colors.verde}>Cadatro de Cliente</Titulo> */}
          {/* <Button
          onPress={() => router.push('/admin/cadastroCliente')}
          fontSize={"2xl"}
          width={"full"}
          alignSelf={'center'}
          height={50}
          bgColor={TEMAS.colors.verde}
          borderRadius='lg'
          mt={5} >  BYD Carros Elétricos
        </Button> */}


          <FlatList
            scrollEnabled={false}
            data={clientes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <Button mt={5} width={"full"}
                  justifyContent={"center"} alignItems={"center"}
                  height={"12"} bgColor={TEMAS.colors.verde} borderRadius='lg'
                  onPress={() => router.push(`/admin/cadastroCliente/${item.id}`)}
                  _text={{
                    fontSize: "lg",
                    fontWeight: "semibold"
                  }}
                ><Text fontSize="lg" fontWeight="semibold" color="white" textAlign="center"> {item.empresa}</Text></Button>
                {/* <Text>Email: {item.email}</Text> */}
              </View>
            )}
          />

          <Botoes mt={10} bgColor={"green.800"} onPress={() => router.push('/admin/cadastro')}>Cadastrar Cliente</Botoes>
        </VStack>
      </ScrollView >
    </>
  );
}