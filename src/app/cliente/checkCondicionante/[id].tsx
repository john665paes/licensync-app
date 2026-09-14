import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, StatusBar, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import moment from 'moment';
import * as DocumentPicker from 'expo-document-picker';

// Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";

// Componentes e Estilos
import { TEMAS } from "../../../estilos/temas";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import HomeHeader from "../../../componentes/Headercliente"; 

const COLORS = {
    primary: TEMAS.colors.verde || "#10B981", 
    background: "#F9FAFB", 
    white: "#FFFFFF",
    textDark: "#1F2937",
    textGray: "#6B7280",
    border: "#E5E7EB",
    red: "#EF4444",
    orange: "#F59E0B",
    green: "#10B981",
    blue: "#3B82F6" // Cor para o "No prazo"
};

export default function CheckCondicionante() {
    const { id } = useLocalSearchParams();
    const condicionanteId = id as string;

    const [usuario, setUsuario] = useState<any>({});
    const [condicionante, setCondicionante] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleBuscarUsuario = async () => {
        if (!auth.currentUser?.uid) return;
        try {
            const snapshot = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
            if (snapshot.exists()) {
                setUsuario(snapshot.data());
            }
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
        }
    };

    const handleBuscarCondicionantes = async () => {
        if (!auth.currentUser?.uid || !condicionanteId) return;

        try {
            const docRef = doc(db, "usuarios", auth.currentUser.uid, "condicionantes", condicionanteId);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                setCondicionante(data);
                
                // Mágica de marcar como visualizada
                if (data.visualizada === false || data.visualizada === undefined) {
                    await updateDoc(docRef, { visualizada: true });
                }
            }
        } catch (error) {
            console.error("Erro ao buscar condicionante:", error);
        } finally {
            setLoading(false);
        }
    };

    const inserirComprovante = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setUploading(true);
                const usuarioID = auth.currentUser?.uid;
                const file = result.assets[0];
                const fileName = file.name || "comprovante.pdf";

                const refComprovante = ref(storage, `arquivos/${usuarioID}/${condicionanteId}/${Date.now()}_${fileName}`);

                const blob: any = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () { resolve(xhr.response); };
                    xhr.onerror = function (e) { reject(new TypeError("Falha na requisição")); };
                    xhr.responseType = "blob";
                    xhr.open("GET", file.uri, true);
                    xhr.send(null);
                });

                await uploadBytes(refComprovante, blob);
                const url = await getDownloadURL(refComprovante);

                if (usuarioID) {
                    await updateDoc(doc(db, "usuarios", usuarioID, 'condicionantes', condicionanteId), { comprovante: url });
                }

                setCondicionante((prevState: any) => ({ ...prevState, comprovante: url }));
                Alert.alert("Sucesso", "Comprovante anexado!");
            }
        } catch (error) {
            Alert.alert("Erro", "Falha ao enviar comprovante.");
        } finally {
            setUploading(false);
        }
    };

    const handleMarcarCumprida = () => {
        Alert.alert(
            "Confirmar",
            "Deseja marcar esta condicionante como cumprida?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sim, cumprida!", 
                    onPress: async () => {
                        setIsUpdatingStatus(true);
                        try {
                            const usuarioID = auth.currentUser?.uid;
                            if (usuarioID) {
                                await updateDoc(doc(db, "usuarios", usuarioID, 'condicionantes', condicionanteId), {
                                    status: 'cumprida',
                                    adminVisualizou: false
                                });
                                setCondicionante((prev: any) => ({ ...prev, status: 'cumprida' }));
                                Alert.alert("Sucesso!", "Condicionante finalizada!");
                            }
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível atualizar o status.");
                        } finally {
                            setIsUpdatingStatus(false);
                        }
                    } 
                }
            ]
        );
    };

    // --- NOVA REGRA DE CORES ---
    const getStatusPrazo = (data: string, statusCond: string) => {
        if (statusCond === 'cumprida') {
            return { text: "Condicionante Cumprida", color: COLORS.green, bg: "#D1FAE5" };
        }

        if (!data) return { text: "Sem data", color: COLORS.textGray, bg: "#f3f4f6" };
        
        const dataPrazo = moment(data, 'YYYY-MM-DD');
        const hoje = moment();
        const diasRestantes = dataPrazo.diff(hoje, 'days');

        if (diasRestantes < 0) return { text: "Condicionante expirada", color: COLORS.red, bg: "#FEE2E2" };
        if (diasRestantes <= 30) return { text: "Vencendo em breve", color: COLORS.orange, bg: "#FEF3C7" };
        
        // Azul para no prazo (não cumprida)
        return { text: "No prazo", color: COLORS.blue, bg: "#DBEAFE" }; 
    };

    const extractFileName = (url: string) => {
        if (!url) return "Visualizar Comprovante";
        try {
            const decoded = decodeURIComponent(url);
            return decoded.split('/').pop()?.split('?')[0] || "Visualizar Comprovante";
        } catch (e) { return "Visualizar Comprovante"; }
    };

    const handleContato = (telefone: string) => {
        if (!telefone) return Alert.alert("Aviso", "Telefone não cadastrado.");
        const numeroLimpo = telefone.replace(/\D/g, '');
        Linking.openURL(`tel:${numeroLimpo}`).catch(() => {
            Alert.alert("Erro", "Não foi possível abrir o discador nativo do celular.");
        });
    };

    useEffect(() => {
        handleBuscarUsuario();
        handleBuscarCondicionantes();
    }, [condicionanteId]);

    const nomeEmpresa = usuario?.empresa || "Cliente";
    const PLACEHOLDER_IMAGE = `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeEmpresa)}&background=10B981&color=fff&size=200`;
    
    const fotoParaExibir = usuario?.fotoPerfilCliente || usuario?.fotoPerfil;
    const imagemFinalUri = (fotoParaExibir && fotoParaExibir !== "") ? fotoParaExibir : PLACEHOLDER_IMAGE;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const status = getStatusPrazo(condicionante?.data, condicionante?.status);
    const fileName = extractFileName(condicionante?.comprovante);
    const isCumprida = condicionante?.status === 'cumprida';

    const pageContent = (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {condicionante ? (
                <>
                    {/* CARTÃO DE VENCIMENTO COM CORES ATUALIZADAS */}
                    <View style={[styles.modernCard, { borderTopWidth: 4, borderTopColor: status.color }]}>
                        <View style={styles.dateHeaderRow}>
                            <View style={styles.dateIconWrapper}>
                                <Feather name="calendar" size={24} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.labelMuted}>Data de Vencimento</Text>
                                <Text style={styles.dateTextHigh}>
                                    {condicionante.data ? moment(condicionante.data).format("DD/MM/YYYY") : "--/--/----"}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={[styles.modernStatusPill, { backgroundColor: status.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                            <Text style={[styles.modernStatusText, { color: status.color }]}>{status.text}</Text>
                        </View>
                    </View>

                    {/* CARTÃO DE DESCRIÇÃO */}
                    <View style={styles.modernCard}>
                        <Text style={styles.label}>Descrição da Condicionante</Text>
                        <Text style={styles.description}>
                            {condicionante.condicionante || "Sem descrição."}
                        </Text>
                    </View>

                    {/* AÇÕES E COMPROVANTE */}
                    <View style={styles.actionsContainer}>
                        
                        <TouchableOpacity
                            style={[styles.btnOutline, uploading && { opacity: 0.7 }]}
                            onPress={inserirComprovante}
                            disabled={uploading || isCumprida}
                        >
                            {uploading ? (
                                <ActivityIndicator color={COLORS.primary} />
                            ) : (
                                <>
                                    <Feather name="upload-cloud" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                                    <Text style={styles.btnOutlineText}>
                                        {condicionante?.comprovante ? "Substituir Comprovante" : "Anexar Comprovante (PDF)"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {condicionante?.comprovante && (
                            <TouchableOpacity style={styles.btnView} onPress={() => Linking.openURL(condicionante.comprovante)}>
                                <Feather name="file-text" size={18} color={COLORS.textDark} style={{ marginRight: 8 }} />
                                <Text style={styles.btnViewText} numberOfLines={1}>{fileName}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.divider} />

                        {/* BOTÃO CUMPRIDA */}
                        <TouchableOpacity
                            style={[
                                styles.btnSolid, 
                                isCumprida ? styles.btnSuccess : styles.btnPrimary,
                                !condicionante?.comprovante && !isCumprida && { opacity: 0.5 }
                            ]}
                            onPress={handleMarcarCumprida}
                            disabled={isCumprida || !condicionante?.comprovante || isUpdatingStatus}
                        >
                            {isUpdatingStatus ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Feather name={isCumprida ? "check-circle" : "check"} size={22} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.btnSolidText}>
                                        {isCumprida ? "Condicionante Cumprida" : "Marcar como Cumprida"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        
                        {!condicionante?.comprovante && !isCumprida && (
                            <Text style={styles.helperText}>* Anexe um comprovante para finalizar.</Text>
                        )}

                    </View>
                </>
            ) : (
                <Text style={styles.notFoundText}>Condicionante não encontrada.</Text>
            )}
        </ScrollView>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            
            {/* O SEU HEADER GLOBAL AQUI */}
            <HomeHeader
                isCliente={true}
                isVoltar={true} // <-- FORÇA A EXIBIÇÃO DA SETA DE VOLTAR
                nomeContato={usuario?.nomeContato}
                empresa={usuario?.empresa}
                telefone={usuario?.telefone1}
                onPhonePress={() => handleContato(usuario?.telefone1)}
                userImage={imagemFinalUri}
                onLogoutPress={() => router.back()} // Ação do botão da direita
            />

            <ScreenContainer bottomContent={pageContent} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    scrollContent: { padding: 16, paddingBottom: 40 },
    
    modernCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    dateHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    dateIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    labelMuted: { fontSize: 13, color: COLORS.textGray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    dateTextHigh: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
    
    modernStatusPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'flex-start' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    modernStatusText: { fontSize: 14, fontWeight: '600' },
    
    label: { fontSize: 14, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8, textTransform: 'uppercase' },
    description: { fontSize: 15, color: COLORS.textGray, lineHeight: 24 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
    
    actionsContainer: { marginTop: 8 },
    btnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, height: 54, marginBottom: 12, borderStyle: 'dashed' },
    btnOutlineText: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' },
    
    btnView: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, height: 50, marginBottom: 12 },
    btnViewText: { color: COLORS.textDark, fontSize: 14, fontWeight: '600' },
    
    btnSolid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, height: 54, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
    btnPrimary: { backgroundColor: COLORS.primary },
    btnSuccess: { backgroundColor: COLORS.green },
    btnSolidText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    
    helperText: { textAlign: 'center', color: COLORS.orange, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
    notFoundText: { textAlign: 'center', marginTop: 50, color: COLORS.textGray, fontSize: 16 }
});