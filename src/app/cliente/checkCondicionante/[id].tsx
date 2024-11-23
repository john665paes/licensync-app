import { Text, Box, Center, ScrollView, HStack } from "native-base";
import React, { useState, useEffect } from "react";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import { TEMAS } from "../../../estilos/temas";
import { TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../../../config/firebase";
import moment from 'moment';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as DocumentPicker from 'expo-document-picker';

export default function CheckCondicionante() {
  const { id } = useLocalSearchParams(); // Recebe o ID da condicionante
  const [condicionante, setCondicionante] = useState<any>(null); // Inicializa como null

  // Função para buscar a condicionante no Firebase
  const handleBuscarCondicionantes = async () => {
    try {
      console.log("UID do usuário atual:", auth.currentUser?.uid);
      console.log("ID recebido:", id);

      const snapshot = await getDoc(
        doc(db, `usuarios/${auth.currentUser?.uid}/condicionantes/${id}`)
      );

      if (snapshot.exists()) {
        const condicionanteData = snapshot.data(); // Obtém os dados do documento
        setCondicionante(condicionanteData); // Salva no estado
      } else {
        console.log("Nenhum condicionante encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar condicionante:", error);
    }
  };

   const inserirComprovante = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && id) {
        const usuarioID = auth.currentUser?.uid;
        const condicionanteID = id;
        const file = result.assets[0];
        const fileName = file.name || "comprovante.pdf";
        const refComprovante = ref(storage, `arquivos/${usuarioID}/${condicionanteID}/${fileName}`);

        const blobStream = await fetch(file.uri).then((r) => r.blob());
        await uploadBytes(refComprovante, blobStream);

        const url = await getDownloadURL(refComprovante);
        await updateDoc(doc(db, "usuarios", usuarioID, 'condicionantes', condicionanteID), { comprovante: url });

        setCondicionante(prevState => ({ ...prevState, comprovante: url }));
      } else {
        console.log("Operação cancelada ou ID do usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro durante o processo de upload da comprovante:", error);
    }
  };
  

  const avisoDeVencimento = (data) => {
    const dataHoje = moment()
    const dataPrazo = moment(data, 'YYYY-MM-DD')
    const diasRestantes = dataPrazo.diff(dataHoje, 'days')
  
    
    // Define a cor com base no tempo restante
    if (diasRestantes > 30) {
      return "Está condicionante está dentro do prazo"; // Mais de 50% restante
    } else if (diasRestantes > 0) {
      return "Falta pouco tempo para fim do prazo"; // Entre 33% e 50% restante
    } else {
      return "A condicionante já expirou"; // Menos de 33% restante
    }
  };

  // UseEffect para buscar os dados ao carregar o componente
  useEffect(() => {
    handleBuscarCondicionantes();
  }, []);

  return (
    <>
      <Box
        height="20"
        width="100%"
        flexDir={"row"}
        paddingTop={10}
        backgroundColor={TEMAS.colors.verde}
      >
        <View>
          <BotaoVoltar />
        </View>
        <View style={{ flex: 5 }}>
          <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>
            LicenSync
          </Text>
        </View>
        <View>
          <BotaoSair />
        </View>
      </Box>
      <ScrollView>
        <View style={{ padding: 16 }}>
          {/* Verifica se a condicionante foi carregada */}
          {condicionante ? (
            <View style={{ padding: 2 , borderRadius: 2}} >
              <Box
                borderWidth={1}
                borderColor="gray.300"
                borderRadius="md"
                padding={4}
                bg="gray.50"
                mb={4}
              >
                <Text fontSize="lg" fontWeight="bold">
                  Condicionante:
                </Text>
                <Text fontSize="lg">{condicionante.condicionante || "Sem descrição."}</Text>
              </Box>
              <Box
                borderWidth={1}
                borderColor="gray.300"
                borderRadius="md"
                padding={2}
                bg="gray.50"
              >
                <Text fontSize="md" fontWeight="bold">
                  Data de vencimento:
                </Text>
                {condicionante.data ? (
                  <Text fontSize="lg">
                    {moment(condicionante.data).format("DD/MM/YYYY")}
                  </Text>
                ) : (
                  <Text fontSize="sm">Sem data disponível.</Text>
                )}
              </Box>
              <Text>{avisoDeVencimento(condicionante.data)}</Text>
            </View>
          ) : (
            <Text fontSize="md" textAlign="center">
              Carregando condicionante...
            </Text>
          )}
          <TouchableOpacity onPress={inserirComprovante}><Text>Editar</Text></TouchableOpacity>

          { condicionante.comprovante && (<Text>Comprovante: {condicionante.comprovante}</Text> )}
        </View>
      </ScrollView>
    </>
  );
}
