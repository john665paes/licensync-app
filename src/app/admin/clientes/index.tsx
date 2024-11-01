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

import { TEMAS } from "../../../estilos/temas";
import Logo from '../../../assets/imgs/login.png'
import { router } from "expo-router";



export default function Clientes() {
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
          <Button
            onPress={() => router.push('/admin/cadastroCliente')}
            fontSize={"2xl"}
            width={"full"}
            alignSelf={'center'}
            height={50}
            bgColor={TEMAS.colors.verde}
            borderRadius='lg'
            mt={5} >  BYD Carros Elétricos
        </Button>


          <Botoes onPress={() => console.log('Salvar Cadastro')}>Cadastrar Cliente</Botoes>
        </VStack>
      </ScrollView>
    </>
  );
}