import React, { useEffect, useState, useCallback } from "react";
import {   
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Linking, Platform, StatusBar, ActivityIndicator, Image, Alert
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
import HomeHeader from "../../componentes/Headerprofile"; 
import { ScreenContainer } from "../../componentes/ScreenContainerpags";
import { LogOut } from "lucide-react-native";

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
    </TouchableOpacity>
);

export default function IndexCliente() {
    const id = auth.currentUser?.uid;
    const [usuario, setUsuario] = useState<any>({});
    const [condicionantes, setCondicionantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    // Contadores para os StatusCards
    const [countVencidos, setCountVencidos] = useState(0);
    const [countPendentes, setCountPendentes] = useState(0);
    const [countAprovados, setCountAprovados] = useState(0);

    const getSaudacao = () => {
        const horaAtual = moment().hour();
        if (horaAtual < 12) return 'Bom dia';
        if (horaAtual < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const getStatusInfo = (dataString: any) => {
        if (!dataString) return { color: COLORS.textGray, icon: "help-circle" };
        
        const dataPrazo = moment(dataString, "YYYY-MM-DD");
        const hoje = moment();
        const diasRestantes = dataPrazo.diff(hoje, "days");

        if (dataPrazo.isBefore(hoje, 'day')) return { color: COLORS.red, icon: "alert-circle" };
        if (diasRestantes <= 30) return { color: COLORS.orange, icon: "clock" };
        return { color: COLORS.green, icon: "check-circle" };
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

                        let vencidosTemp = 0;
                        let pendentesTemp = 0;
                        let aprovadosTemp = 0;
                        const hoje = moment();

                        conds.forEach((item: any) => {
                            if (!item.data) return;
                            const dataPrazo = moment(item.data, "YYYY-MM-DD");
                            const diasRestantes = dataPrazo.diff(hoje, "days");

                            if (dataPrazo.isBefore(hoje, 'day')) vencidosTemp++;
                            else if (diasRestantes <= 30) pendentesTemp++;
                            else aprovadosTemp++;
                        });

                        setCountVencidos(vencidosTemp);
                        setCountPendentes(pendentesTemp);
                        setCountAprovados(aprovadosTemp);
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
    const imagemFinalUri = (fotoParaExibir && fotoParaExibir !== "" && !imageError) ? fotoParaExibir : PLACEHOLDER_IMAGE;

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    const DashboardContent = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* --- CABEÇALHO DE PERFIL DO CLIENTE --- */}
            <View style={styles.profileContainer}>
                <View style={styles.avatarWrapper}>
                    <Image
                        key={imagemFinalUri} 
                        source={{ uri: imagemFinalUri }} 
                        style={styles.avatar}
                        onError={() => setImageError(true)}
                    />
                </View>
                
                <View style={styles.profileTextContainer}>
                    <Text style={styles.greetingText}>
                        {getSaudacao()}, <Text style={{fontWeight: 'bold'}}>{usuario?.nomeContato ? usuario.nomeContato.split(' ')[0] : "Cliente"}</Text>!
                    </Text>
                    <Text style={styles.companyName}>{usuario?.empresa || "Minha Empresa"}</Text>
                    
                    <TouchableOpacity onPress={() => handleContato(usuario?.telefone1)} style={styles.phoneButton}>
                        <Feather name="phone" size={12} color={COLORS.primary} />
                        <Text style={styles.linkText}>{usuario?.telefone1 || "Sem telefone"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- RESUMO (STATUS CARDS MAIS LARGOS) --- */}
            <View style={{ marginBottom: 12 }}>
                <StatusCard
                    icon="alert-triangle"
                    color={COLORS.red}
                    title="Condicionantes Vencidas"
                    subtitle={`${countVencidos} ${countVencidos === 1 ? 'condicionante' : 'condicionantes'}`}
                />
                <StatusCard
                    icon="clock"
                    color={COLORS.orange}
                    title="Próximas do Vencimento"
                    subtitle={`${countPendentes} ${countPendentes === 1 ? 'documento' : 'documentos'}`}
                />
                <StatusCard
                    icon="check-circle"
                    color={COLORS.green}
                    title="Condicionantes no Prazo"
                    subtitle={`${countAprovados} ${countAprovados === 1 ? 'condicionante' : 'condicionantes'}`}
                />
            </View>

            {/* --- CONDICIONANTES --- */}
            <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0, overflow: 'hidden' }]}>
                <Text style={[styles.sectionTitle, { marginHorizontal: 14 }]}>Minhas Condicionantes</Text>

                {condicionantes.length > 0 ? (
                    condicionantes
                        .sort((a, b) => {
                            const timeA = a.data ? moment(a.data, "YYYY-MM-DD").valueOf() : 0;
                            const timeB = b.data ? moment(b.data, "YYYY-MM-DD").valueOf() : 0;
                            return timeA - timeB;
                        })
                        .map((item, index) => {
                            const { color, icon } = getStatusInfo(item.data);
                            const isLast = index === condicionantes.length - 1;

                            return (
                                <TouchableOpacity
                                    key={item.id || index}
                                    style={[styles.listItem, !isLast && styles.separator]}
                                    onPress={() => router.push(`/cliente/checkCondicionante/${item.id}`)}
                                >
                                    <View style={styles.iconWrapper}>
                                        <Feather name={icon as any} size={22} color={color} />
                                    </View>
                                    <View style={styles.textWrapper}>
                                        <Text style={styles.itemTitle} numberOfLines={1}>
                                            {item.condicionante || "Sem título"}
                                        </Text>
                                        <Text style={styles.itemDate}>
                                            Prazo: {item.data ? moment(item.data, "YYYY-MM-DD").format("DD/MM/YYYY") : "--/--/----"}
                                        </Text>
                                    </View>
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
            <HomeHeader  onLogout={handleLogout} />
            

            <ScreenContainer bottomContent={<DashboardContent />} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background
    },
    header: {
        height: 60,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)'
    },
    // --- MÁGICA AQUI: Reduzido o paddingHorizontal de 16 para 6 ---
    scrollContent: {
        paddingHorizontal: 6,
        paddingTop: 12,
        paddingBottom: 40,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderLeftWidth: 4,
    },
    statusTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
    statusSubtitle: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },

    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarWrapper: {
        width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: COLORS.primary, padding: 2, justifyContent: 'center', alignItems: 'center'
    },
    avatar: { width: "100%", height: "100%", borderRadius: 28, resizeMode: 'cover' },
    profileTextContainer: { flex: 1, marginLeft: 14 },
    greetingText: { fontSize: 13, color: COLORS.textGray, marginBottom: 2 },
    companyName: { fontSize: 17, fontWeight: "bold", color: COLORS.textDark, marginBottom: 2 },
    phoneButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    linkText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
    
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 6,
    },
    
    licenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
    licenseCardIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
    licenseCardText: { flex: 1, marginLeft: 12 },
    licenseCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
    licenseCardSubtitle: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },

    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: COLORS.white,
    },
    separator: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    iconWrapper: { width: 28, alignItems: "center", marginRight: 12 },
    textWrapper: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textDark, marginBottom: 2 },
    itemDate: { fontSize: 12, color: COLORS.textGray },
    emptyText: { textAlign: 'center', color: COLORS.textGray, fontStyle: 'italic', padding: 10 },
});