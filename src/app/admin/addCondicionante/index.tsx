import {
    VStack, Text, Box, ScrollView, View,
    TextArea,
    FormControl
} from "native-base";
import React, { useEffect, useState } from "react";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { TEMAS } from "../../../estilos/temas";
import { format } from 'date-fns';
import { db } from "../../../config/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import moment from 'moment';

export default function AddCondicioante() {
    const [date, setDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [show, setShow] = useState(false);
    const [conteudoAdd, setConteudoAdd] = useState('');
    const { id }: { id: string } = useLocalSearchParams(); // Obtendo o ID do usuário

    // Função chamada quando a data é selecionada
    const onChange = (event, selectedDate) => {
        let currentDate = moment(selectedDate).format('YYYY-MM-DD');
        setShow(false);
        setDate(currentDate);
    };

    const showDatePicker = () => {
        setShow(true);
    };

    // Função para salvar o condicionante no Firestore
    const salvarCondicionante = async () => {
        // Verifica se todos os campos estão preenchidos corretamente
        if (!id) {
            console.log("ID não encontrado.");
            return;
        }

        if (!conteudoAdd.trim() || !date) {
            console.log("Todos os campos precisam ser preenchidos corretamente.");
            return;
        }

        try {
            // Adicionando o condicionante no Firestore
            const condicionanteRef = collection(db, "usuarios", id, "condicionantes");
            await addDoc(condicionanteRef, {
                condicionante: conteudoAdd,
                data: date  // Salvando a data corretamente
            });

            console.log("Condicionante adicionado com sucesso!");
            router.back();
        } catch (error) {
            console.error("Erro ao salvar condicionante:", error.message, error.stack);
        }
    };

    return (
        <>
            <Box
                alignItems={"center"}
                height="20"
                width="100%"
                flexDir={"row"}
                paddingTop={10}
                backgroundColor={TEMAS.colors.verde}
            >
                <View>
                    {/* Botão Voltar */}
                    <BotaoVoltar />
                </View>

                <View style={{ flex: 5 }}>
                    <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>
                        Adicionar Condicionante
                    </Text>
                </View>

                <View>
                    {/* Botão Sair */}
                    <BotaoSair />
                </View>
            </Box>

            <ScrollView>
                <VStack flex={1} padding={5}>
                    {/* Campo de texto para o condicionante */}
                    <FormControl isRequired>
                        <FormControl.Label>Condicionante</FormControl.Label>
                        <TextArea
                            textAlignVertical="auto"
                            textAlign="left"
                            placeholder="Adicione a condicionante...."
                            height="200"
                            value={conteudoAdd}
                            onChangeText={setConteudoAdd} autoCompleteType={undefined} />
                    </FormControl>

                    {/* Seletor de data */}
                    <View style={{ width: "50%", marginBottom: 5 }}>
                        <Text color={TEMAS.colors.cinza} fontSize='md' marginTop={"1.5"} marginBottom={'0.5'}>Data até o vencimento:</Text>
                        <Botoes onPress={showDatePicker}>
                            {date ? moment(date).format('DD/MM/YYYY') : "Selecionar data"}
                        </Botoes>
                    </View>

                    {show && (
                        <DateTimePicker
                            testID="datetimepicker"
                            value={moment(date).toDate()}
                            mode="date"
                            minimumDate={new Date()}
                            is24Hour={true}
                            onChange={onChange}
                        />
                    )}

                    {/* Botões para salvar ou cancelar */}
                    <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                        <Botoes width={'50%'} marginRight={2} onPress={salvarCondicionante}>Salvar</Botoes>
                        <Botoes width={'50%'} onPress={() => router.back()} bgColor={"tomato"}>Cancelar</Botoes>
                    </Box>
                    {/* <Botoes width={'100%'} onPress={() => console.log("ADD Licença")}>ADD Licença</Botoes> */}
                </VStack>
            </ScrollView>
        </>
    );
}
