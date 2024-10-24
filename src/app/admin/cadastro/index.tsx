import { VStack, Image, Text, Box, FormControl, 
  Input, Button, Link, 
  Center} from "native-base";
import React from "react";
import { Titulo } from "../../../componentes/titulo";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { View } from "react-native";
import { BotaoVoltar } from "../../../componentes/botoes/back";


export default function Cadastro() {
  return (
    <>
      <Box 
            height="20"  
            width="100%" 
            flexDir={"row"}
            paddingTop={10}
            backgroundColor={'verde'}>
           {/* VOLTAR */}
                <View>
                    <BotaoVoltar />
                </View>
                
                {/* TEXTO */}
                <View style={{flex:1,}}>
                    <Text color={"white"} textAlign={"center"}>Cadastro</Text>
                </View>
                
                {/* SAIR */}
                <View>
                    {/* <BotaoSair /> */}
                </View>
      </Box>
          
    <VStack flex={1} alignItems="center" padding={5}>
      {/* <Image size={100} width={150} marginTop="18" source={Logo} alt="background Login" /> */}
      
     
          <Titulo marginTop={"24"}  color={'verde'}>Cadatro de Cliente</Titulo>
          <InputTexto label="Nome" placeholder="Nome"></InputTexto>
          <InputTexto label="CNPJ" placeholder="CNPJ" mt={"1"}></InputTexto>
          <InputTexto label="Endereço" placeholder="Endereço" mt={"1"}></InputTexto>
          <InputTexto label="Cep" placeholder="Cep" mt={"1"}></InputTexto>
          <InputTexto label="Numero" placeholder="Numero" mt={"1"}></InputTexto>

          <Botoes>Salvar Cadastro</Botoes>
          <Botoes>Cancelar</Botoes>
      </VStack>
      </>
  );
}