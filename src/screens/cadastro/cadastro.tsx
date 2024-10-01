import { VStack, Image, Text, Box, FormControl, 
    Input, Button, Link, 
    Center} from "native-base";
  import Logo from '../../assets/imgs/login.png'
import React from "react";
  
  
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
        margin="100%"></Box>

           
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
   
    );
  }