import React, { useState } from "react";
import { 
    View, Text, ScrollView, TextInput, StyleSheet, Alert,
    Platform, TouchableOpacity, ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Feather } from "@expo/vector-icons";

// Firebase
import { db } from "../../../config/firebase";
import { addDoc, collection } from "firebase/firestore";

// Componentes do projeto
import HomeHeader from "../../../componentes/HomeHeader";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import { theme } from "../../../estilos/themes";
import { UserCog, LogOut } from 'lucide-react-native';

const COLORS = {
  primary: theme.colors.primary, 
  background: "#F9FAFB", 
  white: "#FFFFFF",
  textDark: "#1F2937",
  textGray: "#6B7280",
  border: "#E5E7EB",
  red: "#EF4444",
  green: "#10B981"
};

export default function AddCondicionante() {
    const { id } = useLocalSearchParams(); 

    const [date, setDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [showPicker, setShowPicker] = useState(false);
    const [conteudoAdd, setConteudoAdd] = useState('');
    const [loading, setLoading] = useState(false);

   
    const safeGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            
            if (id) {
                router.replace(`/admin/ClientDetails/${id}`);
            } else {
                router.replace('/admin');
            }
        }
    };

    // --- MENU SUPERIOR ---
    const opcoesMenu = [
        { 
          id: 1, 
          label: 'Inicio', 
          icon: <UserCog size={20} color="#333" />, 
          onPress: () => router.push('admin/') 
        },
        { 
          id: 2, 
          label: 'Sair', 
          icon: <LogOut size={20} color={COLORS.red} />, 
          isDestructive: true,
          onPress: () => {
            Alert.alert("Sair", "Deseja realmente sair?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: () => router.replace('/') }
            ]);
          }
        },
    ];

    // --- MANIPULAÇÃO DO CALENDÁRIO ---
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        
        if (selectedDate) {
            setDate(moment(selectedDate).format('YYYY-MM-DD'));
        }
    };

    const handleDismiss = () => {
        setShowPicker(false);
    };

    // --- SALVAR NO FIREBASE ---
    const salvarCondicionante = async () => {
        if (!id) {
            Alert.alert("Erro", "ID do cliente não encontrado.");
            return;
        }

        if (!conteudoAdd.trim() || !date) {
            Alert.alert("Atenção", "Todos os campos precisam ser preenchidos.");
            return;
        }

        try {
            setLoading(true);
            const condicionanteRef = collection(db, "usuarios", id as string, "condicionantes");
            
            await addDoc(condicionanteRef, {
                condicionante: conteudoAdd,
                data: date,
                visualizada: false 
            });

            // Usando a navegação segura no sucesso da Web
            if (Platform.OS === 'web') {
                window.alert("Condicionante salva com sucesso!");
                safeGoBack();
            } else {
                Alert.alert(
                  "Sucesso", 
                  "Condicionante salva com sucesso!",
                  [{ text: "OK", onPress: safeGoBack }] // Aplicado aqui!
                );
            }
        } catch (error: any) {
            console.error("Erro ao salvar condicionante:", error.message);
            Alert.alert("Erro", "Não foi possível salvar a condicionante.");
        } finally {
            setLoading(false);
        }
    };

    // --- CONTEÚDO DA TELA ---
    const pageContent = (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>Nova Condicionante</Text>

                <View style={styles.formContainer}>
                    {/* Campo de texto */}
                    <Text style={styles.label}>
                        Condicionante <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Adicione o texto da condicionante..."
                        placeholderTextColor="#999"
                        multiline={true}
                        numberOfLines={10}
                        textAlignVertical="top"
                        value={conteudoAdd}
                        onChangeText={setConteudoAdd}
                    />

                    {/* Botão de Data */}
                    <Text style={styles.label}>
                        Data de vencimento <Text style={styles.required}>*</Text>
                    </Text>

                    {/* --- A MÁGICA CROSS-PLATFORM (WEB VS CELULAR) ACONTECE AQUI --- */}
                    {Platform.OS === 'web' ? (
                        // @ts-ignore
                        <input 
                            type="date"
                            value={date}
                            onChange={(e: any) => setDate(e.target.value)}
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                outline: 'none',
                                marginBottom: '30px',
                                fontSize: '16px',
                                color: COLORS.textDark,
                                backgroundColor: COLORS.background,
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.datePickerButton} 
                                onPress={() => setShowPicker(true)}
                            >
                                <Feather name="calendar" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                                <Text style={styles.datePickerText}>
                                    {date ? moment(date).format('DD/MM/YYYY') : "Selecionar data"}
                                </Text>
                            </TouchableOpacity>

                            {showPicker && (
                                <DateTimePicker
                                    testID="datetimepicker"
                                    value={moment(date).toDate()}
                                    mode="date"
                                    minimumDate={new Date()}
                                    is24Hour={true}
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                        </>
                    )}
                    {/* ----------------------------------------------------------- */}

                    {/* Botões Salvar e Cancelar */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={[styles.btnAction, { borderColor: COLORS.textGray }]} 
                            onPress={safeGoBack} // Aplicado aqui!
                            disabled={loading}
                        >
                            <Text style={[styles.btnText, { color: COLORS.textGray }]}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.btnAction, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} 
                            onPress={salvarCondicionante}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Feather name="save" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                                    <Text style={[styles.btnText, { color: COLORS.white }]}>Salvar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <HomeHeader
                title="Inserir Condicionante"
                onBackPress={safeGoBack} // Aplicado aqui!
                menuOptions={opcoesMenu}
            />
            <ScreenContainer bottomContent={pageContent} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    cardContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 3 },
            web: { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }
        })
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark, marginBottom: 20, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10 },
    formContainer: { marginTop: 10 },
    label: { fontSize: 14, fontWeight: "600", color: COLORS.textGray, marginBottom: 8 },
    required: { color: COLORS.red },
    textArea: { height: 150, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.textDark, backgroundColor: COLORS.background, marginBottom: 20, textAlignVertical: 'top' },
    datePickerButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, backgroundColor: COLORS.background, marginBottom: 30 },
    datePickerText: { fontSize: 16, color: COLORS.textDark },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btnAction: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingVertical: 12, marginHorizontal: 5 },
    btnText: { fontSize: 14, fontWeight: 'bold' }
});