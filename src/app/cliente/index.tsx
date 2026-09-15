import React, { useEffect, useState, useCallback } from "react";
import { 
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Linking, StatusBar, ActivityIndicator, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import moment from "moment";
import { Feather } from "@expo/vector-icons";

// Firebase
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";

// Componentes e Estilos
import { theme } from "../../estilos/themes";
import HomeHeader from "../../componentes/Headercliente"; 
import { ScreenContainer } from "../../componentes/ScreenContainerpags";

const COLORS = {
    primary: theme.colors.primary, 
    background: "#F9FAFB", 
    white: "#FFFFFF",
    textDark: "#1F2937",
    textGray: "#6B7280",
    border: "#E5E7EB",
    red: "#EF4444",
    orange: "#F59E0B",
    green: "#10B981"
};

const PLACEHOLDER_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/BYD_Auto_logo_%282022%29.svg/1200px-BYD_Auto_logo_%282022%29.svg.png";

// --- COMPONENTE: Status Card ---
const StatusCard = ({ icon, color, title, subtitle, onPress }: any) => (
    <TouchableOpacity
        style={[styles.statusCard, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
    >
        <Feather name={icon} size={20} color={color} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{title}</Text>
            {subtitle ? <Text style={styles.statusSubtitle}>{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-right" size={16} color={COLORS.textGray} />
    </TouchableOpacity>
);

export default function IndexCliente() {
    const id = auth.currentUser?.uid;
    const [usuario, setUsuario] = useState<any>({});
    const [condicionantes, setCondicionantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- NOVOS CONTADORES ---
    const [countCriticas, setCountCriticas] = useState(0);   // Vermelhas
    const [countSeguras, setCountSeguras] = useState(0);     // Amarelas
    const [countCumpridas, setCountCumpridas] = useState(0); // Verdes

    // STATUS COM PRIORIDADE
    const getStatusInfo = (item: any) => {
        // 1. Verde (Cumpridas) - Prioridade 3 (Ficam por último)
        if (item.status === 'cumprida') {
            return { color: COLORS.green, icon: "check-circle", order: 3 };
        }

        if (!item.data) return { color: COLORS.textGray, icon: "help-circle", order: 4 };

        const dataPrazo = moment(item.data, "YYYY-MM-DD");
        const hoje = moment();
        const diasRestantes = dataPrazo.diff(hoje, "days");

        // 2. Vermelho (Vencidas ou <= 30 dias) - Prioridade 1 (Topo da lista)
        if (diasRestantes <= 30) {
            return { color: COLORS.red, icon: "alert-circle", order: 1 };
        }
        
        // 3. Amarelo (No prazo, > 30 dias) - Prioridade 2 (Meio da lista)
        return { color: COLORS.orange, icon: "clock", order: 2 };
    };

    const handleLogout = () => {
        Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut(auth);
                        router.replace('/'); 
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível sair no momento.");
                    }
                }
            }
        ]);
    };

    const handleContato = (telefone: string) => {
        if (!telefone) return Alert.alert("Aviso", "Telefone não cadastrado.");
        const numeroLimpo = telefone.replace(/\D/g, '');
        
        Alert.alert(
          "Opções de Contato",
          `Como deseja utilizar o número?`,
          [
            { text: "Cancelar", style: "cancel" },
            { text: "WhatsApp", onPress: () => Linking.openURL(`whatsapp://send?phone=55${numeroLimpo}`) },
            { text: "Ligar", onPress: () => Linking.openURL(`tel:${numeroLimpo}`) }
          ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            const fetchDados = async () => {
                if (!id) return;
                try {
                    const snapUser = await getDoc(doc(db, "usuarios", id));
                    if (snapUser.exists()) setUsuario(snapUser.data());

                    const snapCond = await getDocs(collection(db, "usuarios", id, "condicionantes"));
                    if (!snapCond.empty) {
                        const conds = snapCond.docs.map(d => ({ id: d.id, ...d.data() }));
                        setCondicionantes(conds);

                        let criticasTemp = 0;
                        let segurasTemp = 0;
                        let cumpridasTemp = 0;
                        const hoje = moment();

                        conds.forEach((item: any) => {
                            if (item.status === 'cumprida') {
                                cumpridasTemp++; // É Verde!
                            } else {
                                if (!item.data) return;
                                const dataPrazo = moment(item.data, "YYYY-MM-DD");
                                const diasRestantes = dataPrazo.diff(hoje, "days");

                                if (diasRestantes <= 30) criticasTemp++; // É Vermelho!
                                else segurasTemp++;                      // É Amarelo!
                            }
                        });

                        setCountCriticas(criticasTemp);
                        setCountSeguras(segurasTemp);
                        setCountCumpridas(cumpridasTemp);
                    } else {
                        setCondicionantes([]);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDados();
        }, [id])
    );

    const fotoParaExibir = usuario?.fotoPerfilCliente || usuario?.fotoPerfil;
    const imagemFinalUri = (fotoParaExibir && fotoParaExibir !== "") ? fotoParaExibir : PLACEHOLDER_IMAGE;

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    const DashboardContent = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* --- STATUS CARDS (Agora Clicáveis) --- */}
            <View style={{ marginBottom: 12 }}>
                <StatusCard 
                    icon="alert-triangle" 
                    color={COLORS.red} 
                    title="Atenção Necessária" 
                    subtitle={`${countCriticas} ${countCriticas === 1 ? 'condicionante crítica' : 'condicionantes críticas'}`} 
                    onPress={() => router.push('/cliente/listaCondicionantes?tipo=criticas')}
                />
                <StatusCard 
                    icon="clock" 
                    color={COLORS.orange} 
                    title="No Prazo" 
                    subtitle={`${countSeguras} ${countSeguras === 1 ? 'condicionante segura' : 'condicionantes seguras'}`} 
                    onPress={() => router.push('/cliente/listaCondicionantes?tipo=seguras')}
                />
                <StatusCard 
                    icon="check-circle" 
                    color={COLORS.green} 
                    title="Condicionantes Cumpridas" 
                    subtitle={`${countCumpridas} ${countCumpridas === 1 ? 'condicionante concluída' : 'condicionantes concluídas'}`} 
                    onPress={() => router.push('/cliente/listaCondicionantes?tipo=cumpridas')}
                />
            </View>

            {/* --- LISTA DE CONDICIONANTES --- */}
            <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0, overflow: 'hidden' }]}>
                <Text style={[styles.sectionTitle, { marginHorizontal: 14 }]}>Minhas Condicionantes</Text>

                {condicionantes.length > 0 ? (
                    condicionantes
                        // ORDENAÇÃO: Primeiro as Vermelhas (1), depois Amarelas (2), depois Verdes (3)
                        .sort((a, b) => {
                            const statusA = getStatusInfo(a);
                            const statusB = getStatusInfo(b);
                            
                            // Se a prioridade for diferente, ordena pela prioridade
                            if (statusA.order !== statusB.order) {
                                return statusA.order - statusB.order;
                            }
                            
                            // Se forem da mesma cor (prioridade igual), desempatar por data (as mais antigas no topo)
                            const timeA = a.data ? moment(a.data, "YYYY-MM-DD").valueOf() : 0;
                            const timeB = b.data ? moment(b.data, "YYYY-MM-DD").valueOf() : 0;
                            return timeA - timeB;
                        })
                        .map((item, index) => {
                            const { color, icon } = getStatusInfo(item);
                            const isLast = index === condicionantes.length - 1;
                            
                            // Lógica do sino de notificação
                            const isUnread = item.visualizada === false; 

                            return (
                                <TouchableOpacity
                                    key={item.id || index}
                                    style={[styles.listItem, !isLast && styles.separator, isUnread && styles.unreadItem]}
                                    onPress={() => router.push(`/cliente/checkCondicionante/${item.id}`)}
                                >
                                    <View style={styles.iconWrapper}>
                                        <Feather name={icon as any} size={22} color={color} />
                                    </View>
                                    
                                    <View style={styles.textWrapper}>
                                        <Text style={[styles.itemTitle, isUnread && { fontWeight: 'bold' }]} numberOfLines={1}>
                                            {item.condicionante || "Sem título"}
                                        </Text>
                                        <Text style={styles.itemDate}>
                                            Prazo: {item.data ? moment(item.data, "YYYY-MM-DD").format("DD/MM/YYYY") : "--/--/----"}
                                        </Text>
                                    </View>

                                    {/* SINO */}
                                    {isUnread && (
                                        <View style={styles.notificationBell}>
                                            <Feather name="bell" size={16} color={COLORS.orange} />
                                            <View style={styles.notificationDot} />
                                        </View>
                                    )}

                                    <Feather name="chevron-right" size={18} color={COLORS.textGray} />
                                </TouchableOpacity>
                            );
                        })
                ) : (
                    <Text style={[styles.emptyText, { marginBottom: 16 }]}>Nenhuma condicionante encontrada.</Text>
                )}
            </View>

            {/* --- LICENÇA --- */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Licença Ambiental</Text>
                {usuario?.licenca ? (
                    <TouchableOpacity style={styles.licenseCard} onPress={() => Linking.openURL(usuario.licenca)}>
                        <View style={styles.licenseCardIcon}>
                            <Feather name="file-text" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.licenseCardText}>
                            <Text style={styles.licenseCardTitle}>Minha Licença</Text>
                            <Text style={styles.licenseCardSubtitle}>Toque para visualizar o PDF</Text>
                        </View>
                        <Feather name="download" size={18} color={COLORS.textGray} />
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.emptyText}>Nenhuma licença vinculada no momento.</Text>
                )}
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            
            <HomeHeader 
                isCliente={true}
                nomeContato={usuario?.nomeContato}
                empresa={usuario?.empresa}
                telefone={usuario?.telefone1}
                onPhonePress={() => handleContato(usuario?.telefone1)}
                userImage={imagemFinalUri}
                onLogoutPress={handleLogout}
            />

            <ScreenContainer bottomContent={<DashboardContent />} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    scrollContent: { paddingHorizontal: 6, paddingTop: 12, paddingBottom: 40 },
    statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, borderLeftWidth: 4 },
    statusTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
    statusSubtitle: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
    card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
    licenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
    licenseCardIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
    licenseCardText: { flex: 1, marginLeft: 12 },
    licenseCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
    licenseCardSubtitle: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
    listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, backgroundColor: COLORS.white },
    separator: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    unreadItem: { backgroundColor: '#FFFBEB' },
    iconWrapper: { width: 28, alignItems: "center", marginRight: 12 },
    textWrapper: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: "500", color: COLORS.textDark, marginBottom: 2 },
    itemDate: { fontSize: 12, color: COLORS.textGray },
    emptyText: { textAlign: 'center', color: COLORS.textGray, fontStyle: 'italic', padding: 10 },
    notificationBell: { marginRight: 10, position: 'relative' },
    notificationDot: { position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.red, borderWidth: 1, borderColor: COLORS.white },
});