import { VStack, Image, Text, Box, FormControl, 
  Input, Button, Link, 
  Center} from "native-base";
import React from "react";
import { Titulo } from "../../componentes/titulo";
import { Inputform } from "../../componentes/formulario";
import { Botoes } from "../../componentes/botoes";


export default function Cadastro() {
  return (
    <VStack flex={1} alignItems="center" padding={5}>
      {/* <Image size={100} width={150} marginTop="18" source={Logo} alt="background Login" /> */}
      
     
          <Box 
            height="16"  
            width="100%" 
            position="absolute"
            marginTop={10}
            padding={10}
            // right={100}
            // left={-100}
            // top={0}
            // height={5}
            backgroundColor={'verde'} 
            margin="100%">
               <Text 
                  height="16"  
                  width="100%" 
                  fontSize={"xl"}
                  position="absolute"
                  marginTop={"2.5"}
                  padding={19}
                  color={'branco'}> Olá, meu brother!</Text>
            </Box>
          <Titulo marginTop={"24"}  color={'verde'}>Cadatro de Cliente</Titulo>
          <Inputform placeholder="Nome"></Inputform>
          <Inputform placeholder="CNPJ" mt={"1"}></Inputform>
          <Inputform placeholder="Endereço" mt={"1"}></Inputform>
          <Inputform placeholder="Cep" mt={"1"}></Inputform>
          <Inputform placeholder="Numero" mt={"1"}></Inputform>

          <Botoes>Salvar Cadastro</Botoes>
          <Botoes>Cancelar</Botoes>
      </VStack>
 
  );
}