import React, { useEffect, useState } from "react";
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
    ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import moment from "moment";
import { Feather } from "@expo/vector-icons";

// Firebase
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

// Componentes e Estilos
import { TEMAS } from "../../estilos/temas";
import { BotaoSair } from "../../componentes/botoes/exit";
// Assumindo que BotaoSair já foi convertido. Se não, use um TouchableOpacity simples aqui temporariamente.

// Componente simples de InputTexto apenas para visualização (Read Only)
const ReadOnlyField = ({ label, value }: { label: string, value?: string }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{value || "..."}</Text>
        </View>
    </View>
);

export default function IndexCliente() {
    const id = auth.currentUser?.uid;
    const [usuario, setUsuario] = useState<any>({});
    const [condicionantes, setCondicionantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mudar a cor da data conforme vencimento
    const getPrazoColor = (data: string) => {
        if (!data) return "black";
        const dataPrazo = moment(data, 'YYYY-MM-DD');
        const hoje = moment();
        const diasRestantes = dataPrazo.diff(hoje, 'days');
        
        if (dataPrazo.isBefore(hoje)) return "#EF4444"; // Vermelho (Vencido)
        if (diasRestantes <= 30) return "#F59E0B"; // Laranja (Alerta)
        return "#10B981"; // Verde (No prazo)
    };

    // Buscar dados do usuário
    const buscarDados = async () => {
        if (auth.currentUser) {
            try {
                const snapshot = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                if (snapshot.exists()) {
                    setUsuario(snapshot.data());
                }
            } catch (error) {
                console.error("Erro ao buscar usuário", error);
            }
        }
    };

    // Buscar condicionantes
    const handleBuscarCondicionantes = async () => {
        if (!id) return;
        try {
            const snapshot = await getDocs(collection(db, "usuarios", id, "condicionantes"));
            if (!snapshot.empty) {
                const condicionantesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCondicionantes(condicionantesData);
            }
        } catch (error) {
            console.error("Erro ao buscar condicionantes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        buscarDados();
        handleBuscarCondicionantes();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={TEMAS.colors.verde} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEMAS.colors.verde} />

            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View style={{ width: 40 }} /> {/* Espaço vazio para equilibrar o layout */}
                <Text style={styles.headerTitle}>LicenSync</Text>
                <View style={styles.headerRight}>
                    <BotaoSair />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* --- DADOS DA EMPRESA --- */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
                    
                    <ReadOnlyField label="Empresa" value={usuario?.empresa} />
                    <ReadOnlyField label="CNPJ" value={usuario?.cnpj} />
                    <ReadOnlyField label="E-mail" value={usuario?.email} />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <ReadOnlyField label="Telefone 1" value={usuario?.telefone1} />
                        </View>
                        <View style={styles.space} />
                        <View style={styles.col}>
                            <ReadOnlyField label="Telefone 2" value={usuario?.telefone2} />
                        </View>
                    </View>
                </View>

                {/* --- LICENÇA --- */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Licença Ambiental</Text>
                    {usuario?.licenca ? (
                        <TouchableOpacity 
                            style={styles.downloadButton}
                            onPress={() => Linking.openURL(usuario?.licenca)}
                        >
                            <Feather name="download" size={20} color="#fff" style={{ marginRight: 10 }} />
                            <Text style={styles.downloadButtonText}>Baixar Licença (PDF)</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.emptyText}>Nenhuma licença vinculada.</Text>
                    )}
                </View>

                {/* --- CONDICIONANTES --- */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Minhas Condicionantes</Text>
                    
                    {condicionantes.length > 0 ? (
                        condicionantes
                            .sort((a, b) => moment(a.data).toDate().getTime() - moment(b.data).toDate().getTime())
                            .map((item, index) => (
                                <View key={item.id} style={styles.condicionanteItem}>
                                    
                                    <TouchableOpacity 
                                        style={styles.condicionanteButton}
                                        onPress={() => router.push(`/cliente/checkCondicionante/${item.id}`)}
                                    >
                                        <Text style={styles.condicionanteText} numberOfLines={2}>
                                            {item.condicionante || "Sem descrição"}
                                        </Text>
                                        <Feather name="chevron-right" size={20} color="#333" />
                                    </TouchableOpacity>

                                    {item.data && (
                                        <Text style={[styles.prazoText, { color: getPrazoColor(item.data) }]}>
                                            Prazo: {moment(item.data).format("DD/MM/YYYY")}
                                        </Text>
                                    )}

                                    {index < condicionantes.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))
                    ) : (
                        <Text style={styles.emptyText}>Nenhuma condicionante encontrada.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Fundo cinza claro
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
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRight: {
        // Estilo para o botão sair
    },
    // CONTEÚDO
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    // CAMPOS DE TEXTO
    fieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
    },
    fieldValueContainer: {
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    fieldValue: {
        fontSize: 15,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    col: {
        flex: 1,
    },
    space: {
        width: 10,
    },
    // BOTÃO DOWNLOAD
    downloadButton: {
        flexDirection: 'row',
        backgroundColor: '#374151', // Cinza escuro
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // LISTA CONDICIONANTES
    condicionanteItem: {
        marginBottom: 10,
    },
    condicionanteButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0FDF4', // Verde bem claro
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    condicionanteText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    prazoText: {
        textAlign: 'right',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        padding: 10,
    },
});