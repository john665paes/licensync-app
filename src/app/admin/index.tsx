import React, { useEffect, useState } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import moment from "moment";


import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../config/firebase";
import * as ImagePicker from 'expo-image-picker';


import { ScreenContainer } from "../../componentes/ScreenContainerpags";
import HomeHeader from "../../componentes/Headerprofile";
import { theme } from "../../estilos/themes";


const StatusCard = ({ icon, color, title, subtitle, onPress }) => (
    <TouchableOpacity
        style={[styles.statusCard, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.7}>

        <Feather name={icon} size={24} color={color} style={{ marginRight: 15 }} />
        <View>
            <Text style={styles.statusTitle}>{title}</Text>
            {subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
        </View>
    </TouchableOpacity>
);


const ClientItem = ({ data, onPress }) => (
    <TouchableOpacity style={styles.clientItem} onPress={onPress}>
        <View style={styles.clientIconBox}>
            <Feather name="layout" size={24} color="#1A5A40" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.clientName}>{data.empresa || data.nome || "Sem Nome"}</Text>
            <Text style={styles.clientDate}>Atualizado em {data.dataAtualizacao || "05/01/2025"}</Text>
        </View>
        <Feather name="chevron-right" size={24} color="#6B7280" />
    </TouchableOpacity>
);

export default function IndexADM() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listaClientes, setListaClientes] = useState([]);
    const [countVencidos, setCountVencidos] = useState(0);
    const [countPendentes, setCountPendentes] = useState(0);
    const [countAprovados, setCountAprovados] = useState(0);

    useEffect(() => {
        const fetchDados = async () => {
            try {

                const usuariosRef = collection(db, "usuarios");
                const snapshot = await getDocs(usuariosRef);

                // Variáveis temporárias
                let usuarioLogadoNome = '';
                let usuarioLogadoFoto = null;
                const listaTodosUsuarios = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();

                    if (data.email === auth.currentUser?.email) {
                        usuarioLogadoNome = data.nome;
                        usuarioLogadoFoto = data.fotoPerfil;
                    }


                    listaTodosUsuarios.push({ id: doc.id, ...data });
                });

                // Seta o estado do Header
                setNomeUsuario(usuarioLogadoNome);
                if (usuarioLogadoFoto) setImageUri(usuarioLogadoFoto);


                const clientesFiltrados = listaTodosUsuarios
                    .filter(item => item.nivel === 'cliente')
                    .sort((a, b) => {

                        const empresaA = a.empresa || "";
                        const empresaB = b.empresa || "";
                        return empresaA.localeCompare(empresaB);
                    });


                setListaClientes(clientesFiltrados);

                let vencidosTemp = 0;
                let pendentesTemp = 0;
                let aprovadosTemp = 0;
                const hoje = moment();
                for (const cliente of clientesFiltrados) {
                    const condicionantesRef = collection(db, "usuarios", cliente.id, "condicionantes");
                    const snapshotCondicionantes = await getDocs(condicionantesRef);

                    snapshotCondicionantes.forEach((docCond) => {
                        const dataString = docCond.data().data;
                        if (!dataString) return;

                        const dataPrazo = moment(dataString, "YYYY-MM-DD");
                        const diasRestantes = dataPrazo.diff(hoje, "days");

                        if (dataPrazo.isBefore(hoje, 'day')) {
                            vencidosTemp++; // Vermelho
                        } else if (diasRestantes <= 30) {
                            pendentesTemp++; // Laranja
                        } else {
                            aprovadosTemp++; // Verde
                        }
                    });
                }

                // Atualiza os estados finais
                setCountVencidos(vencidosTemp);
                setCountPendentes(pendentesTemp);
                setCountAprovados(aprovadosTemp);

            } catch (error) {
                console.log("Erro ao buscar dados:", error);
            }
        };
        fetchDados();
    }, []);


    const uploadImageToFirebase = async (uriLocal) => {
        if (!uriLocal) return;
        setLoading(true);
        try {
            const response = await fetch(uriLocal);
            const blob = await response.blob();
            const filename = `perfil/${auth.currentUser.uid}.jpg`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);

            const userDocRef = doc(db, "usuarios", auth.currentUser.uid);
            await updateDoc(userDocRef, { fotoPerfil: downloadUrl });
            Alert.alert("Sucesso", "Foto atualizada!");
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Falha no upload.");
        } finally {
            setLoading(false);
        }
    };

    const pickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            await uploadImageToFirebase(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const res = await ImagePicker.requestCameraPermissionsAsync();
        if (!res.granted) return Alert.alert("Ops", "Precisamos da câmera!");
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            await uploadImageToFirebase(result.assets[0].uri);
        }
    };

    const handleEditImage = () => {
        Alert.alert("Alterar Foto", "Escolha:", [
            { text: "Cancelar", style: "cancel" },
            { text: "Galeria", onPress: pickImageFromGallery },
            { text: "Câmera", onPress: takePhoto },
        ]);
    };

    const DashboardContent = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            <View style={{ marginTop: 10 }}>
                <StatusCard 
                    icon="alert-triangle" 
                    color="#DC2626" 
                    title="Condicionantes vencendo"
                    subtitle={`${countVencidos} ${countVencidos === 1 ? 'condicionante' : 'condicionantes'}`}
                    onPress={() => router.push('/admin/listaVencidos')}
                />
                
                <StatusCard 
                    icon="clock" 
                    color="#F59E0B" 
                    title="Documentos pendentes"
                    subtitle={`${countPendentes} ${countPendentes === 1 ? 'documento' : 'documentos'}`}
                    onPress={() => router.push('/admin/listaPendentes')}
                />

                <StatusCard 
                    icon="check-circle" 
                    color="#10B981"
                    title="Relatórios Aprovados"
                    subtitle={`${countAprovados} ${countAprovados === 1 ? 'relatório' : 'relatórios'}`}
                    onPress={() => router.push('/admin/listaAprovados')}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meus Clientes</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('../../admin/CreateClient')}
                >
                    <Feather name="user-plus" size={18} color="#FFF" />
                    <Text style={styles.addButtonText}>Cadastrar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                {listaClientes.map((cliente) => (
                    <ClientItem
                        key={cliente.id}
                        data={cliente}
                        onPress={() => router.push(`/admin/ClientDetails/${cliente.id}`)}
                    />
                ))}
                {listaClientes.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                        Carregando clientes ou lista vazia...
                    </Text>
                )}
            </View>
        </ScrollView>
    );

    const handleLogout = () => {
        Alert.alert("Sair", "Deseja realmente sair da conta?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut(auth);
                        router.replace('/'); // Redireciona para o login
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível sair no momento.");
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <>
                    <HomeHeader
                        userName={nomeUsuario}
                        userImage={imageUri}
                        onImagePress={handleEditImage}
                        onLogoutPress={handleLogout}
                    />
                    <ScreenContainer
                        bottomContent={<DashboardContent />}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderLeftWidth: 4,
    },
    statusTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
    statusSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#00A868',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
    },
    addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    clientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    clientName: { fontSize: 16, fontWeight: '600', color: '#374151' },
    clientDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});

