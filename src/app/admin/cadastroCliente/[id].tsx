import {
  VStack, Text, Box,
  Button,
  Divider,
  HStack,
  ScrollView,
} from "native-base";
import React, { useCallback, useEffect, useState } from "react";
import { Titulo } from "../../../componentes/titulo";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { RefreshControl, View } from "react-native";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import { Linking } from "react-native";
import { TEMAS } from "../../../estilos/temas";
import { router, useLocalSearchParams } from "expo-router";
import { db, storage } from "../../../config/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import * as DocumentPicker from 'expo-document-picker';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import moment from 'moment';
export default function CadastroCliente() {
  const { id }: { id: string } = useLocalSearchParams();
  const [usuario, setUsuario] = useState<any>({});
  const [condicionantes, setCondicionantes] = useState<any[]>([]);


  //Arrumar o reload
  const [refreshing, setRefreshing] = useState(false);
  // function do reload
  const onRefresh = async () => {
    setRefreshing(true);
    await handleBuscarCondicionantes();
    setRefreshing(false);
  };

  // Função para buscar dados do usuário
  const handleBuscarUsuario = async () => {
    try {
      const snapshot = await getDoc(doc(db, "usuarios", id));
      const dados = snapshot.data();
      setUsuario(dados);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  // Função para buscar condicionantes
  const handleBuscarCondicionantes = async () => {
    try {
      // Obtém a coleção de condicionantes
      const snapshot = await getDocs(collection(db, "usuarios", id, "condicionantes"));

      // Atualiza o estado com os dados da coleção
      if (!snapshot.empty) {
        const condicionantesData = snapshot.docs.map(doc => ({
          id: doc.id, // Inclui o ID do documento no objeto
          ...doc.data()
        }));
        setCondicionantes(condicionantesData);
      } else {
        console.log("Nenhum condicionante encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar condicionantes:", error);
    }
  };

  // Função para inserir a licença
  const inserirLicenca = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && id) {
        const file = result.assets[0];
        const fileName = file.name || "licença.pdf";
        const refLicenca = ref(storage, `arquivos/${id}/${fileName}`);

        const blobStream = await fetch(file.uri).then((r) => r.blob());
        await uploadBytes(refLicenca, blobStream);

        const url = await getDownloadURL(refLicenca);
        await updateDoc(doc(db, "usuarios", id), { licenca: url });

        setUsuario(prevState => ({ ...prevState, licenca: url }));
      } else {
        console.log("Operação cancelada ou ID do usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro durante o processo de upload da licença:", error);
    }
  };

  // Função para extrair o nome do arquivo a partir da URL
  const extractFileName = (url: string) => {
    if (!url) {
      console.error("A URL da licença está indefinida ou vazia");
      return "Licença não disponível";
    }

    const startIndex = url.indexOf(id);
    if (startIndex === -1) {
      console.error("ID não encontrado na URL");
      return "Licença não disponível";
    }

    const filePath = url.substring(startIndex + id.length);
    const fileNameWithParams = filePath.substring(filePath.lastIndexOf('/') + 1);
    const fileName = fileNameWithParams.split('?')[0];

    return decodeURIComponent(fileName);
  };

  // Exibe o nome do arquivo da licença
  const fileName = usuario?.licenca ? extractFileName(usuario?.licenca) : "Licença não disponível";

  useEffect(() => {
    handleBuscarUsuario();
    handleBuscarCondicionantes();
  }, []);

  const getButtonColor = (data) => {
    
    const dataHoje = moment()
    const dataPrazo = moment(data, 'YYYY-MM-DD')
    const diasRestantes = dataPrazo.diff(dataHoje, 'days')
    
    
    //Já passou o prazo 
    if (moment(data).isBefore(moment()))
      return "red";
    else if (diasRestantes <= 30) //É menos de 30 dias
      return "orange";
    else // Tem mais de 30 dias
      return "green"; 
  };

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

      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>

        <VStack flex={1} padding={5}>
          <InputTexto textAlign="left" label="Empresa" readOnly>{usuario?.empresa}</InputTexto>
          <InputTexto textAlign="left" label="CNPJ" readOnly>{usuario?.cnpj}</InputTexto>
          <InputTexto textAlign="left" readOnly label="E-mail">{usuario?.email}</InputTexto>

          <Box flexDirection={"row"} alignItems={"center"} justifyContent={"center"} marginBottom={3}>
            <Box marginRight={2}>
              <InputTexto
                width="180"
                readOnly
                bgcolor={TEMAS.colors.cinza}
                label="Telefone 1:"
                value={usuario?.telefone1}
              />
            </Box>
            <Box>
              <InputTexto
                readOnly
                width="180"
                label="Telefone 2:"
                value={usuario?.telefone2}
              />
            </Box>
          </Box>

          <Botoes
            width={'100%'}
            onPress={() => router.push(`/admin/addCondicionante?id=${id}`)}  // Aqui, userId seria a variável com o valor do id
          >Nova Condicionante</Botoes>

          <Botoes width={'100%'} onPress={inserirLicenca}>Inserir Licença</Botoes>
          {/* {usuario?.licenca && <Text>Licença já inserida</Text>} */}
          <Botoes width={'100%'} onPress={() => router.push(`/admin/editar?id=${id}`)}>Editar Cliente</Botoes>

          <Divider mt={5} />
          <Titulo mt={0}>Licença prefeitura</Titulo>
          <Divider mt={1} />

          <View style={{ alignItems: "center" }}>
            <Button
              mt={3}
              borderRadius="xl"
              width="80%"
              height="10"
              bg="gray.700"
              onPress={() => Linking.openURL(usuario?.licenca)}
            >
              {fileName}
            </Button>
          </View>

          <Divider mt={5} />
          <Titulo mt={0}>Condicionantes</Titulo>
          <Divider mt={1} />

          {condicionantes.length > 0 ? (
            condicionantes
            .sort((a, b) => moment(a.data).toDate().valueOf() - moment(b.data).toDate().valueOf())
            .map((item, index) => (
              <Box key={index} mt={2}>
                {/* Exibe uma parte do condicionante (limite de 100 caracteres, por exemplo) */}
                <Button
                  mt={2}
                  bgColor={"gray.500"}
                  color="black"
                  borderRadius={"xl"}
                  >

                  {item.condicionante && item.condicionante.length > 80
                    ? item.condicionante.substring(0, 80) + "..."
                    : item.condicionante || "Condicionante não disponível"}</Button>

                <HStack justifyContent="space-between">
                  {item.data && (

                    <Text alignItems={"self-end"}
                      mt={2}
                      fontSize={"md"}
                      bold
                      style={{
                        color: getButtonColor(item.data),
                      }}
                      >
                      {moment(item.data).format("DD/MM/YYYY")}
                    </Text>

                  )}
                  <Button
                    alignItems={"self-end"}
                    mt={2}
                    width={'30%'}
                    height={"80%"}
                    bg={"tomato"}
                    borderRadius={"xl"}
                    onPress={async () => {
                      if (!item?.id) {
                        console.error("ID do condicionante não encontrado.");
                        return;
                      }
                      try {
                        const condicionanteRef = doc(db, "usuarios", id, "condicionantes", item.id);
                        await deleteDoc(condicionanteRef);
                        setCondicionantes((prev) => prev.filter((c) => c.id !== item?.id));
                      } catch (error) {
                        console.error("Erro ao deletar condicionante:", error);
                      }
                    }}
                  >Apagar</Button>
                </HStack>

                <Divider mt={3} />
              </Box>
            ))
          ) : (
            <Text>Nenhuma condicionante encontrada.</Text>
          )}
        </VStack>

      </ScrollView>
    </>
  );
}
