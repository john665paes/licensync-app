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



export default function CadastroCliente() {
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
                    <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>Cliente</Text>
                </View>

                {/* SAIR */}
                <View>
                    <BotaoSair />
                </View>
            </Box>
            <ScrollView >
                <VStack flex={1} padding={5}>

                    <InputTexto
                        textAlign="left"
                        placeholder="Adicione a condicionate...."
                        height='230'
                        label="Condicionante">01.222.333/0001-00</InputTexto>
                    <InputTexto
                        textAlign="left"
                        label="Data até o vencimento:">byd@byd.com</InputTexto>



                    <Botoes width={'100%'}>ADD Condicionante</Botoes>
                    <Botoes width={'100%'}>ADD Licença</Botoes>
                    <Botoes width={'100%'}>Editar Cliente</Botoes>

                </VStack>
            </ScrollView>
        </>
    );
}