import { VStack, Image, Text, Box, FormControl, Input, Button, Link } from "native-base";
import Logo from '../../assets/imgs/login.png'


export default function Login() {
  return (
    <VStack flex={1} alignItems="center" padding={5}>
      <Image size={100} width={190} marginTop={40} source={Logo} alt="background Login" />
      <Text 
        fontSize="2xl"
        fontWeight="bold"
        color="verde"
        textAlign="center"
        mt={5}
        > Faça o login
      </Text>
      <Box>
        <FormControl marginTop={3}>
          <FormControl.Label>E-mail</FormControl.Label>
          <Input 
          placeholder="Insira seu e-mail" 
          size='lg' 
          width="100%"
          borderRadius='lg'
          borderColor={'verde'}
          borderWidth={3}
          bgColor={'branco'}
          shadow={5}
          />
        </FormControl>
        <FormControl marginTop={3}>
          <FormControl.Label>Senha</FormControl.Label>
          <Input 
          placeholder="Insira sua senha" 
          size='lg' 
          width="100%"
          borderRadius='lg'
          borderColor={'verde'}
          borderWidth={3}
          bgColor={'branco'}
          shadow={5}
          />
        </FormControl>
      </Box>
      {/* BOTÃO DE ENTRAR */}
      <Button
      width="100%"
      bgColor={'verde'}
      borderRadius='lg'
      mt={3}>
        Entrar
      </Button>
      <Link href="" mt={6}>Esqueceu sua senha?</Link>
    </VStack>
    
  );
}