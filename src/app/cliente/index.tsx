import {
  VStack, Image, Box, FormControl,
  Input, Button, Link,
  Center,
  ScrollView,
  Divider,
  Flex,
  HStack
} from "native-base";
import React, { useEffect, useState } from "react";
import { Titulo } from "../../componentes/titulo";
import { InputTexto } from "../../componentes/formulario";
import { BotaoVoltar } from "../../componentes/botoes/back";
import { BotaoSair } from "../../componentes/botoes/exit";
import { TEMAS } from "../../estilos/temas";
import { router, useLocalSearchParams } from "expo-router";
import { collection, deleteDoc, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { View, Text, Linking } from "react-native";
import moment from "moment";
import { background } from "native-base/lib/typescript/theme/styled-system";

export default function IndexCliente() {
  const id = auth.currentUser?.uid;
  const [usuario, setUsuario] = useState<any>({});
  const [condicionantes, setCondicionantes] = useState<any[]>([]);

  // mudar a cor da data conforme vencimento
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
  

  // Buscar dados do usuário
  const buscarDados = async () => {
    if (auth.currentUser) {
      const snapshot = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
      const usuario =snapshot.data();
      setUsuario(usuario);

      // Exibe o nome do arquivo da licença
      console.log(usuario?.licenca)
    }
  };

  // Buscar condicionantes
  const handleBuscarCondicionantes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "usuarios", id!, "condicionantes"));
      if (!snapshot.empty) {
        const condicionantesData = snapshot.docs.map((doc) => ({
          id: doc.id, // Certifique-se de incluir o ID aqui
          ...doc.data(),
        }));
        setCondicionantes(condicionantesData);
      } else {
        console.log("Nenhum condicionante encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar condicionantes:", error);
    }
  };


  // Função para extrair o nome do arquivo a partir da URL

  

  useEffect(() => {
    buscarDados();
    handleBuscarCondicionantes();
  }, []);

  return (
    <>
      <Box height="20" width="100%" flexDir={"row"} paddingTop={10} backgroundColor={TEMAS.colors.verde}>
        <View>
          {/* <BotaoVoltar /> */}
        </View>
        <View style={{ flex: 5 }}>
          <Text style={{color:TEMAS.colors.branco, fontSize: 20, textAlign: "center" }}>LicenSync</Text>
        </View>
        <View>
          <BotaoSair />
        </View>
      </Box>

      <ScrollView>
        <VStack flex={2} padding={2}>
          <InputTexto textAlign="left" label="Empresa" isReadOnly>{usuario?.empresa}</InputTexto>
          <InputTexto textAlign="left" label="CNPJ" isReadOnly>{usuario?.cnpj}</InputTexto>
          <InputTexto textAlign="left" label="E-mail" isReadOnly>{usuario?.email}</InputTexto>

          <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
            <Box marginRight={2}>
              <InputTexto width="180" isReadOnly bgcolor={TEMAS.colors.cinza} label="Telefones:">{usuario?.telefone1}</InputTexto>
            </Box>
            <Box>
              <InputTexto isReadOnly width="180" label=" ">{usuario?.telefone2}</InputTexto>
            </Box>
          </Box>
          {/** =================================================== */}
          <Divider mt={5} />
          <Titulo mt={0}>Licença</Titulo>
          <Divider mt={2} />
          {usuario?.licenca && (
            <View style={{ alignItems: "center" }}>
              <Button
                mt={3}
                borderRadius="xl"
                width="80%"
                height="10"
                bg="gray.700"
                onPress={() => Linking.openURL(usuario?.licenca)}
                >
                Baixar licença
              </Button>
            </View>
            )}

          {/** =================================================== */}
          <Divider mt={5} />
          <Titulo mt={0}>Condicionantes</Titulo>
          <Divider mt={1} />

          {condicionantes.length > 0 ? (
            condicionantes
              .sort((a, b) => moment(a.data).toDate().valueOf() - moment(b.data).toDate().valueOf())
              .map((item) => (
                <Box key={item.id} mt={2}>
                  <Button mt={2} bgColor={TEMAS.colors.verde} color="black" borderRadius={"xl"} 
                  onPress={() => router.push(`/cliente/checkCondicionante/${item.id}`)}
                  >
                    {item.condicionante && item.condicionante.length > 100
                      ? item.condicionante.substring(0, 100) + "..."
                      : item.condicionante || "Condicionante não disponível"}
                  </Button>

                  
                    {item.data && (
                      <Text style={{color: getButtonColor(item.data), textAlign: 'right', fontWeight: 'bold', fontSize: 18 }}>
                        Prazo: {moment(item.data).format("DD/MM/YYYY")} 
                      </Text>
                    )}
                  

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
