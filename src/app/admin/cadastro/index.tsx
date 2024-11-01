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
import { TEMAS } from "../../../estilos/temas";
import Logo from '../../../assets/imgs/login.png'



export default function Cadastro() {
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
          <BotaoVoltar />
        </View>

        {/* TEXTO */}
        <View style={{ flex: 1, }}>
          <Text color={TEMAS.colors.branco} textAlign={"center"}>Cadastro</Text>
        </View>

        {/* SAIR */}
        <View>
          {/* <BotaoSair /> */}
        </View>
      </Box>
      <ScrollView>
        <VStack flex={1} padding={5}>

          {<Image size={100} alignSelf={'center'} width={150} marginTop="18" source={Logo} alt="background Login" />}

          <Titulo marginTop={"15"} color={TEMAS.colors.verde}>Cadatro de Cliente</Titulo>
          <InputTexto label="Empresa:"
            placeholder="Nome" />

          <InputTexto label="CNPJ:"
            placeholder="CNPJ" />

          <InputTexto label="Endereço:"
            placeholder="Endereço" />

          <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
            <Box marginRight={2}>
              <InputTexto
                width="180"
                bgcolor={TEMAS.colors.cinza}
                label="CEP:"
                placeholder="CEP" />
            </Box>
            <Box>
              <InputTexto
                width="180"
                label="Número:"
                placeholder="Número" />
            </Box>
          </Box>

          <Botoes onPress={() => console.log('Salvar Cadastro')}>Salvar Cadastro</Botoes>
          <Botoes onPress={() => console.log('Cancelar')} backgroundColor={TEMAS.colors.cinza}>Cancelar</Botoes>
        </VStack>
      </ScrollView>
    </>
  );
}