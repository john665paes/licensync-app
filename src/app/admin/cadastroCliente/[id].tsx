import {
  VStack, Image, Text, Box, FormControl,
  Input, Button, Link,
  Center,
  ScrollView
} from "native-base";
import React, { useEffect, useState } from "react";
import { Titulo } from "../../../componentes/titulo";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { View } from "react-native";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";

import { TEMAS } from "../../../estilos/temas";
// @ts-ignore
import Logo from '../../../assets/imgs/login.png'
import { router, useLocalSearchParams } from "expo-router";
import { auth, db, storage } from "../../../config/firebase";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import * as DocumentPicker from 'expo-document-picker';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";



export default function CadastroCliente() {

  const { id }: { id: string } = useLocalSearchParams();
  const [usuario, setUsuario] = useState<any>({});
  // ================================================
  const handleBuscarUsuario = async () => {
    const snapshot = await getDoc(doc(db, "usuarios", id));
    const dados = snapshot.data();
    setUsuario(dados);
  }
  // ----------
  const inserirLicenca = async () => {

    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && auth.currentUser) {
      const file = result;

      const refLicenca = ref(storage, `arquivos/${auth.currentUser?.uid}/licenca.pdf`);
      const blobStream = await fetch(file.assets[0].uri).then((r) => r.blob());

      await uploadBytes(refLicenca, blobStream);
      const url = await getDownloadURL(refLicenca);

      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
        licenca: url
      });

      setUsuario({ ...usuario, licenca: url });
    }
  }

  // ---------
  useEffect(() => {
    handleBuscarUsuario();

  }, [])
  // ====================================================
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
          <Text color={TEMAS.colors.branco} fontSize={"2xl"}
            textAlign={"center"}>Cliente</Text>
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
            label="Empresa"
            readOnly>{usuario.empresa}</InputTexto>
          <InputTexto
            textAlign="left"
            label="CNPJ"
            readOnly
          >{usuario.cnpj}</InputTexto>
          <InputTexto
            textAlign="left"
            readOnly
            label="E-mail">{usuario.email}</InputTexto>

          <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
            <Box marginRight={2}>
              <InputTexto
                width="180"
                readOnly
                bgcolor={TEMAS.colors.cinza}
                label="Telefones:"
                value={usuario.telefone1} />
            </Box>
            <Box>
              <InputTexto
                readOnly
                width="180"
                label="   "
                value={usuario.telefone2} />
            </Box>
          </Box>

          <Botoes width={'100%'}
            onPress={() => router.push('/admin/addCondicionante')}
          >ADD Condicionante</Botoes>
          {usuario?.linceca && <Text>Licença já inserida</Text>}
          <Botoes width={'100%'} onPress={inserirLicenca}>ADD Licença</Botoes>
          <Botoes width={'100%'} onPress={() => console.log("Editar Cliente")}>Editar Cliente</Botoes>

        </VStack>
      </ScrollView>
    </>
  );
}