import {
    VStack, Image, Text, Box, FormControl,
    Input, Button, Link,
    Center,
    ScrollView,
    Divider,
    Flex
  } from "native-base";
  import React, { useEffect } from "react";
  import { Titulo } from "../../componentes/titulo";
  import { InputTexto } from "../../componentes/formulario";
  import { Botoes } from "../../componentes/botoes";
  import { View } from "react-native";
  import { BotaoVoltar } from "../../componentes/botoes/back";
  import { BotaoSair } from "../../componentes/botoes/exit";
  
  import { TEMAS } from "../../estilos/temas";
  import Logo from '../../assets/imgs/login.png'
  import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
    
  export default function IndexCliente() {

    const [usuario , setUsuario] = React.useState<any>({});
    // ============================================
    const buscarDados = async () => {
        if (auth.currentUser) {
            const snapshot = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
            const dados = snapshot.data();
            setUsuario(dados);
        }
    }
    // ---------
    useEffect(() => {
        buscarDados();
    }, [])
    // ============================================
    return (
  
      <>
        <Box
        //   alignItems={"center"}
          height="20"
          width="100%"
          flexDir={"row"}
          paddingTop={10}
          backgroundColor={TEMAS.colors.verde}>
          {/* VOLTAR */}
          <View>
            {/* <BotaoVoltar /> */}
          </View>
  
          {/* TEXTO */}
          <View style={{ flex: 5, }}>
            <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>LicenSync</Text>
          </View>
  
          {/* SAIR */}
          <View>
            <BotaoSair />
          </View>
        </Box>
        <ScrollView >
          <VStack flex={2} padding={2} >
            <InputTexto
              textAlign="left"
              label="Empresa"
              isReadOnly={true}>{usuario?.empresa}</InputTexto>
            <InputTexto
              textAlign="left"
              label="CNPJ"
              isReadOnly={true}
              >{usuario?.cnpj}</InputTexto>
            <InputTexto
              textAlign="left"
              isReadOnly={true}
              label="E-mail">{usuario?.email}</InputTexto>
  
            <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
              <Box marginRight={2}>
                <InputTexto
                  width="180"
                  isReadOnly={true}
                  bgcolor={TEMAS.colors.cinza}
                  label="Telefones:">{usuario?.telefone1}</InputTexto>
              </Box>
              <Box>
                <InputTexto
                  isReadOnly={true}
                  width="180"
                  label=" "> {usuario?.telefone2} </InputTexto>
              </Box>
            </Box>

            <Divider mt={5}/>
            <Titulo mt={0}>Condicionantes</Titulo>
            <Divider mt={1}/>
            <Flex ali>
                <InputTexto></InputTexto>
                <Botoes 
                    editable
                    alignSelf={"start"}>
                            {"Selecionar data"}
                        </Botoes>
            </Flex>

  
            {/* <Botoes width={'100%'}
              onPress={() => router.push('/admin/addCondicionante')}
            >ADD Condicionante</Botoes>
            <Botoes width={'100%'}>ADD Licença</Botoes>
            <Botoes width={'100%'}>Editar Cliente</Botoes> */}
  
          </VStack>
        </ScrollView>
      </>
    );
  }