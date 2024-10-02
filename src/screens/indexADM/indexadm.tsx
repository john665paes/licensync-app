import { VStack, Image, Text, Box, FormControl, 
    Input, Button, Link, 
    Center} from "native-base";
import React from "react";
  
  
  export default function IndexADM() {
    return (
        <>
            <Box 
            height="16"  
            width="100%" 
            padding={10}
            backgroundColor={'verde'}></Box>
            
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