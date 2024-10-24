import { router } from "expo-router";
import { VStack, Image, Text, Box, FormControl, 
    Input, Button, Link, 
    Center} from "native-base";
import React from "react";
import { View } from "react-native";
import { SvgUri } from "react-native-svg";
import { BotaoVoltar } from "../../componentes/botoes/back";
import { BotaoSair } from "../../componentes/botoes/exit";
import { Botoes } from "../../componentes/botoes";
  
  
  export default function IndexADM() {
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
                    {/* <BotaoVoltar /> */}
                </View>
                
                {/* TEXTO */}
                <View style={{flex:1,}}>
                    <Text color={"white"} textAlign={"center"}>ADMIN</Text>
                </View>
                
                {/* SAIR */}
                <View>
                    <BotaoSair />
                </View>
            </Box>
            <Box >
                <VStack flex={1} alignItems="center" padding={5} >
                {/* <Image size={100} width={150} marginTop="18" source={Logo} alt="background Login" /> */}

                
                    <Botoes width="100%" >
                            Clientes
                    </Botoes>

                    
                    <Botoes width="100%"  onPress={() => router.push('/admin/cadastro')}>
                        Cadastrar Clientes
                    </Botoes>
                    </VStack>    
            </Box>    
            
            
        </>
    );
  }