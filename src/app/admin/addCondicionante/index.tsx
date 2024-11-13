import { 
    VStack, Image, Text, Box, FormControl,
    ScrollView, Row
} from "native-base";
import React, { useState } from "react";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { Button, View } from "react-native";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import DateTimePicker from '@react-native-community/datetimepicker';
import { TEMAS } from "../../../estilos/temas";
import Logo from '../../../assets/imgs/login.png';
import { router } from "expo-router";
import { format } from 'date-fns'

export default function AddCondicioante () {
    const [date, setDate] = useState(new Date(1598051730000));
    const [show, setShow] = useState(false);
    const [conteudoAdd, setConteudoAdd] = useState('');
    
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false); 
        setDate(currentDate);
        console.log(selectedDate);
    };
    
    const showDatePicker = () => {
        setShow(true);
    };
const setTexto = () =>{
    onchange
}
    const datePlaceholder = format(date, 'dd/MM/yyyy');

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
                {/* VOLTAR */}
                <View>
                    <BotaoVoltar />
                </View>

                {/* TEXTO */}
                <View style={{ flex: 5 }}>
                    <Text color={TEMAS.colors.branco} fontSize={"2xl"} textAlign={"center"}>
                        Adicionar Condicionante
                    </Text>
                </View>

                {/* SAIR */}
                <View>
                    <BotaoSair />
                </View>
            </Box>
            <ScrollView>
                <VStack flex={1} padding={5}>
                    <InputTexto
                        textAlignVertical="auto"
                        textAlign="left"
                        placeholder="Adicione a condicionante...."
                        height="200"
                        label="Condicionante"
                        value={conteudoAdd}
                        onChangeText={setConteudoAdd}
                        
                    />

                    {/* Date Picker */}
                    <View style={{ width: "50%", marginBottom: 5 }}>
                        <Text color={TEMAS.colors.cinza} fontSize='md' marginTop={"1.5"} marginBottom={'0.5'}>Data até o vencimento:</Text>
                        <Botoes  onPress={showDatePicker}>
                            {date ? datePlaceholder : "Selecionar data"}
                        </Botoes>
                    </View>
                    {show && (
                        <DateTimePicker
                            testID="datetimepicker"
                            value={date}
                            mode="date"
                            is24Hour={true}
                            onChange={onChange}
                        />
                    )}

                    <Box flexDirection={"row"} flex={1} alignSelf={'center'}>
                        <Botoes width={'50%'} marginRight={2} onPress={() => router.push('/admin/cadastroCliente')}>Salvar</Botoes>
                        <Botoes width={'50%'} bgColor={TEMAS.colors.red}>Cancelar</Botoes>
                    </Box>
                    <Botoes width={'100%'}>ADD Licença</Botoes>
                </VStack>
            </ScrollView>
        </>
    );
}
