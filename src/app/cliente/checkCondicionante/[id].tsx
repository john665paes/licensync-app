import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    Linking, 
    Platform, 
    StatusBar,
    SafeAreaView,
    ActivityIndicator,
    Alert
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import moment from 'moment';
import * as DocumentPicker from 'expo-document-picker';

// Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";

// Componentes e Estilos
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";
import { TEMAS } from "../../../estilos/temas";

export default function CheckCondicionante() {
    const { id } = useLocalSearchParams(); 
    const condicionanteId = id as string;
    
    const [condicionante, setCondicionante] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Função para buscar a condicionante no Firebase
    const handleBuscarCondicionantes = async () => {
        if (!auth.currentUser?.uid || !condicionanteId) return;

        try {
            const docRef = doc(db, "usuarios", auth.currentUser.uid, "condicionantes", condicionanteId);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                setCondicionante(snapshot.data());
            } else {
                console.log("Nenhum condicionante encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar condicionante:", error);
        } finally {
            setLoading(false);
        }
    };

    const inserirComprovante = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setUploading(true);
                const usuarioID = auth.currentUser?.uid;
                
                const file = result.assets[0];
                const fileName = file.name || "comprovante.pdf";
                
                // Referência no Storage
                const refComprovante = ref(storage, `arquivos/${usuarioID}/${condicionanteId}/${Date.now()}_${fileName}`);

                // Converter URI para Blob e Upload
                const response = await fetch(file.uri);
                const blob = await response.blob();
                
                await uploadBytes(refComprovante, blob);
                const url = await getDownloadURL(refComprovante);

                // Atualizar Firestore
                if (usuarioID) {
                    await updateDoc(doc(db, "usuarios", usuarioID, 'condicionantes', condicionanteId), { 
                        comprovante: url 
                    });
                }

                setCondicionante((prevState: any) => ({ ...prevState, comprovante: url }));
                Alert.alert("Sucesso", "Comprovante enviado!");
            }
        } catch (error) {
            console.error("Erro upload:", error);
            Alert.alert("Erro", "Falha ao enviar comprovante.");
        } finally {
            setUploading(false);
        }
    };

    const getStatusPrazo = (data: string) => {
        if (!data) return { text: "Sem data", color: "#999" };
        
        const dataPrazo = moment(data, 'YYYY-MM-DD');
        const hoje = moment();
        const diasRestantes = dataPrazo.diff(hoje, 'days');

        if (diasRestantes < 0) {
            return { text: "A condicionante já expirou", color: "#EF4444" }; // Vermelho
        } else if (diasRestantes <= 30) {
            return { text: "Falta pouco tempo para o fim do prazo", color: "#F59E0B" }; // Laranja
        } else {
            return { text: "Esta condicionante está dentro do prazo", color: "#10B981" }; // Verde
        }
    };

    const extractFileName = (url: string) => {
        if (!url) return "Visualizar Comprovante";
        try {
            // Tenta decodificar o nome do arquivo da URL do Firebase Storage
            const decoded = decodeURIComponent(url);
            const splitName = decoded.split('/').pop()?.split('?')[0];
            return splitName || "Visualizar Comprovante";
        } catch (e) {
            return "Visualizar Comprovante";
        }
    };

    useEffect(() => {
        handleBuscarCondicionantes();
    }, [condicionanteId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={TEMAS.colors.verde} />
            </View>
        );
    }

    const status = getStatusPrazo(condicionante?.data);
    const fileName = extractFileName(condicionante?.comprovante);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEMAS.colors.verde} />

            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <BotaoVoltar />
                </View>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>LicenSync</Text>
                </View>
                <View style={styles.headerRight}>
                    <BotaoSair />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {condicionante ? (
                    <>
                        {/* --- CARTÃO DE DESCRIÇÃO --- */}
                        <View style={styles.card}>
                            <Text style={styles.label}>Condicionante:</Text>
                            <Text style={styles.description}>
                                {condicionante.condicionante || "Sem descrição."}
                            </Text>
                        </View>

                        {/* --- CARTÃO DE PRAZO --- */}
                        <View style={styles.card}>
                            <Text style={styles.label}>Data de Vencimento:</Text>
                            <Text style={styles.dateText}>
                                {condicionante.data ? moment(condicionante.data).format("DD/MM/YYYY") : "--/--/----"}
                            </Text>
                            
                            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                                <Text style={[styles.statusText, { color: status.color }]}>
                                    {status.text}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* --- AÇÕES --- */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.uploadButton]} 
                                onPress={inserirComprovante}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Feather name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.uploadButtonText}>Inserir Comprovante (PDF)</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {condicionante?.comprovante && (
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.viewButton]}
                                    onPress={() => Linking.openURL(condicionante.comprovante)}
                                >
                                    <Feather name="file-text" size={20} color="#333" style={{ marginRight: 8 }} />
                                    <Text style={styles.viewButtonText} numberOfLines={1}>
                                        {fileName}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                ) : (
                    <Text style={styles.notFoundText}>Condicionante não encontrada.</Text>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // HEADER
    header: {
        width: '100%',
        height: 80,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
        backgroundColor: TEMAS.colors.verde,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerLeft: { flex: 1 },
    headerCenter: { flex: 4, alignItems: 'center' },
    headerRight: { flex: 1, alignItems: 'flex-end' },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    // CONTEÚDO
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 16,
        color: '#1F2937',
        lineHeight: 24,
    },
    dateText: {
        fontSize: 18,
        color: '#1F2937',
        fontWeight: '500',
        marginBottom: 10,
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: TEMAS.colors.verde,
        marginVertical: 10,
        opacity: 0.3,
    },
    // BOTÕES
    actionsContainer: {
        marginTop: 10,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    uploadButton: {
        backgroundColor: TEMAS.colors.verde || "green",
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    viewButton: {
        backgroundColor: '#E5E7EB', // Cinza claro
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    viewButtonText: {
        color: '#1F2937',
        fontSize: 14,
        fontWeight: '600',
    },
    notFoundText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#6B7280',
        fontSize: 16,
    }
});