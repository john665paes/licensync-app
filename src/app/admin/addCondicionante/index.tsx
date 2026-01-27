import React, { useState } from "react";
import { 
    View, 
    Text, 
    ScrollView, 
    TextInput, 
    StyleSheet, 
    Alert,
    Platform,
    StatusBar
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import moment from 'moment';

// Firebase imports
import { db } from "../../../config/firebase";
import { addDoc, collection } from "firebase/firestore";

// Componentes do projeto (assumindo que já foram migrados ou são compatíveis)
import { Botoes } from "../../../componentes/botoes";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import { TEMAS } from "../../../estilos/temas";

export default function AddCondicioante() {
    const [date, setDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [show, setShow] = useState(false);
    const [conteudoAdd, setConteudoAdd] = useState('');
    const { id }: { id: string } = useLocalSearchParams(); 

    // Função chamada quando a data é selecionada
    const onChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            let currentDate = moment(selectedDate).format('YYYY-MM-DD');
            setShow(false);
            setDate(currentDate);
        } else {
            setShow(false);
        }
    };

    const showDatePicker = () => {
        setShow(true);
    };

    // Função para salvar o condicionante no Firestore
    const salvarCondicionante = async () => {
        if (!id) {
            console.log("ID não encontrado.");
            return;
        }

        if (!conteudoAdd.trim() || !date) {
            Alert.alert("Atenção", "Todos os campos precisam ser preenchidos.");
            return;
        }

        try {
            const condicionanteRef = collection(db, "usuarios", id, "condicionantes");
            await addDoc(condicionanteRef, {
                condicionante: conteudoAdd,
                data: date
            });

            console.log("Condicionante adicionado com sucesso!");
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar condicionante:", error.message);
            Alert.alert("Erro", "Não foi possível salvar o condicionante.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / Cabeçalho */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <BotaoVoltar />
                </View>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        Adicionar Condicionante
                    </Text>
                </View>

                <View style={styles.headerRight}>
                    <BotaoSair />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    
                    {/* Campo de texto (TextArea) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Condicionante <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Adicione a condicionante...."
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={10}
                            textAlignVertical="top" // Importante para o texto começar em cima no Android
                            value={conteudoAdd}
                            onChangeText={setConteudoAdd}
                        />
                    </View>

                    {/* Seletor de data */}
                    <View style={styles.dateContainer}>
                        <Text style={styles.labelData}>Data até o vencimento:</Text>
                        <View style={{ width: '100%' }}>
                            <Botoes onPress={showDatePicker}>
                                {date ? moment(date).format('DD/MM/YYYY') : "Selecionar data"}
                            </Botoes>
                        </View>
                    </View>

                    {show && (
                        <DateTimePicker
                            testID="datetimepicker"
                            value={moment(date).toDate()}
                            mode="date"
                            minimumDate={new Date()}
                            is24Hour={true}
                            display="default"
                            onChange={onChange}
                        />
                    )}

                    {/* Botões de Ação */}
                    <View style={styles.footerButtons}>
                        <View style={styles.buttonWrapper}>
                            <Botoes onPress={salvarCondicionante}>
                                Salvar
                            </Botoes>
                        </View>
                        
                        <View style={styles.buttonWrapper}>
                            <Botoes 
                                onPress={() => router.back()} 
                                bgColor="tomato" // Verifique se seu componente Botoes aceita essa prop, se não, use style
                            >
                                Cancelar
                            </Botoes>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // ou cor de fundo padrão
    },
    header: {
        width: '100%',
        height: 100, // Ajuste conforme necessário (equivalente ao height="20" do native-base + padding)
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: TEMAS.colors.verde,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 5,
        alignItems: 'center',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    headerTitle: {
        color: TEMAS.colors.branco,
        fontSize: 24, // Equivalente ao "2xl"
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
    },
    formContainer: {
        padding: 20,
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    required: {
        color: 'red',
    },
    textArea: {
        height: 200,
        borderWidth: 1,
        borderColor: '#ccc', // Cor da borda padrão do input
        borderRadius: 4,
        padding: 12,
        backgroundColor: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
    },
    dateContainer: {
        width: '50%',
        marginBottom: 20,
    },
    labelData: {
        color: TEMAS.colors.cinza,
        fontSize: 16,
        marginTop: 6,
        marginBottom: 4,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    buttonWrapper: {
        width: '48%', // Para ficar lado a lado com espaço no meio
    }
});