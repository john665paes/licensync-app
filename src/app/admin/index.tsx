import { router } from "expo-router";
import { VStack, Image, Text, Box, FormControl, 
    Input, Button, Link, 
    Center} from "native-base";
import React from "react";
import { View } from "react-native";
import { SvgUri } from "react-native-svg";
import { BotaoVoltar } from "../../componentes/botoes/back";
import { BotaoSair } from "../../componentes/botoes/exit";
  
  
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
            
            <VStack flex={1} alignItems="center" padding={5}>
                {/* <Image size={100} width={150} marginTop="18" source={Logo} alt="background Login" /> */}

                
                    <Button
                        marginTop={150}
                        width="100%"
                        bgColor={'verde'}
                        borderRadius='lg'
                        borderBottomLeftRadius={80}
                        borderLeftRadius={48}
                        borderRightRadius={50}
                        >
                            Clientes
                    </Button>
                    <Button
                        onPress={() => router.push('/admin/cadastro')}
                        width="100%"
                        bgColor={'verde'}
                        borderRadius='lg'
                        borderBottomLeftRadius={80}
                        borderLeftRadius={48}
                        borderRightRadius={50}
                        mt={5}>
                        Cadastrar Clientes
                </Button>
                    
            </VStack>
        </>
    );
  }