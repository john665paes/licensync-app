import { VStack, Image, Text, Box, FormControl, 
  Input, Button, Link } from "native-base";
import Logo from '../../assets/imgs/login.png'
import React from "react";
import { Titulo } from "../../componentes/titulo";
import { Botoes } from "../../componentes/botoes";
import { Inputform } from "../../componentes/formulario";


export default function Login() {
  return (
    <VStack flex={1} alignItems="center" padding={5}>
      <Image size={100} width={190} marginTop={40} source={Logo} alt="background Login" />
     
      <Titulo>
          Faça login em sua conta
      </Titulo>
      
      <Box >
        <Inputform placeholder="Digite seu e-mail"/>
        <Inputform placeholder="Digite sua senha"/>

      </Box>
     
      <Botoes>
          Entrar
      </Botoes>
      <Link href="" mt={6}>Esqueceu sua senha?</Link>
    </VStack>
  );
}