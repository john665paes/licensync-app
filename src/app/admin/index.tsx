import React, { useState, useCallback } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
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

const StatusCard = ({ icon, color, title, subtitle, onPress }: any) => (
    <TouchableOpacity
        style={[styles.statusCard, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Feather name={icon} size={24} color={color} style={{ marginRight: 15 }} />
        <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{title}</Text>
            {subtitle ? <Text style={styles.statusSubtitle}>{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

// --- COMPONENTE ClientItem ATUALIZADO ---
const ClientItem = ({ data, onPress }: any) => {
    // Tenta pegar a foto de perfil usando as duas nomenclaturas possíveis
    const fotoUri = data.fotoPerfilCliente || data.fotoPerfil;

    return (
        <TouchableOpacity style={styles.clientItem} onPress={onPress}>
            <View style={styles.clientIconBox}>
                {fotoUri ? (
                    <Image 
                        source={{ uri: fotoUri }} 
                        style={styles.clientImage} 
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.clientIconFallback}>
                        <Feather name="briefcase" size={20} color="#1A5A40" />
                    </View>
                )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.clientName}>{data.empresa || data.nome || "Sem Nome"}</Text>
                <Text style={styles.clientDate}>Atualizado em {data.dataAtualizacao || "Não informado"}</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
    );
};

export default function IndexADM() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listaClientes, setListaClientes] = useState<any[]>([]);
    
    // --- NOVOS CONTADORES NO PADRÃO DO SISTEMA ---
    const [countCriticas, setCountCriticas] = useState(0);   // Vermelhas
    const [countSeguras, setCountSeguras] = useState(0);     // Amarelas
    const [countCumpridas, setCountCumpridas] = useState(0); // Verdes
    
    const [searchText, setSearchText] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchDados = async () => {
                try {
                    const usuariosRef = collection(db, "usuarios");
                    const snapshot = await getDocs(usuariosRef);

                    let usuarioLogadoNome = '';
                    let usuarioLogadoFoto = null;
                    const listaTodosUsuarios: any[] = [];

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.email === auth.currentUser?.email) {
                            usuarioLogadoNome = data.nome;
                            usuarioLogadoFoto = data.fotoPerfil;
                        }
                        listaTodosUsuarios.push({ id: doc.id, ...data });
                    });

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

                    // Variáveis temporárias para a contagem
                    let criticasTemp = 0;
                    let segurasTemp = 0;
                    let cumpridasTemp = 0;
                    const hoje = moment();
                    
                    // Varre todos os clientes para somar as condicionantes
                    for (const cliente of clientesFiltrados) {
                        const condicionantesRef = collection(db, "usuarios", cliente.id, "condicionantes");
                        const snapshotCondicionantes = await getDocs(condicionantesRef);

                        snapshotCondicionantes.forEach((docCond) => {
                            const data = docCond.data();
                            
                            // Lógica idêntica a do cliente
                            if (data.status === 'cumprida') {
                                cumpridasTemp++; // É Verde!
                            } else {
                                const dataString = data.data;
                                if (!dataString) return;

                                const dataPrazo = moment(dataString, "YYYY-MM-DD");
                                const diasRestantes = dataPrazo.diff(hoje, "days");

                                if (diasRestantes <= 30) {
                                    criticasTemp++; // É Vermelho! (Vencidas ou <= 30 dias)
                                } else {
                                    segurasTemp++;  // É Amarelo! (> 30 dias)
                                }
                            }
                        });
                    }

                    setCountCriticas(criticasTemp);
                    setCountSeguras(segurasTemp);
                    setCountCumpridas(cumpridasTemp);

                } catch (error) {
                    console.log("Erro ao buscar dados:", error);
                }
            };
            
            fetchDados();
        }, []) 
    );

    const uploadImageToFirebase = async (uriLocal: any) => {
        if (!uriLocal) return;
        setLoading(true);
        try {
            const blob: any = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                  resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                  console.log(e);
                  reject(new TypeError("Falha na requisição de rede"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uriLocal, true);
                xhr.send(null);
            });

            const filename = `perfil/${auth.currentUser?.uid}.jpg`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);

            if(auth.currentUser){
                const userDocRef = doc(db, "usuarios", auth.currentUser.uid);
                await updateDoc(userDocRef, { fotoPerfil: downloadUrl });
                Alert.alert("Sucesso", "Foto atualizada!");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Falha no upload.");
        } finally {
            setLoading(false);
        }
    };

    const pickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri as any);
            await uploadImageToFirebase(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const res = await ImagePicker.requestCameraPermissionsAsync();
        if (!res.granted) return Alert.alert("Ops", "Precisamos da câmera!");
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri as any);
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

    const handleLogout = () => {
        Alert.alert("Sair", "Deseja realmente sair da conta?", [
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

    const clientesExibidos = listaClientes.filter(cliente => {
        const nomeBusca = cliente.empresa || cliente.nome || "";
        return nomeBusca.toLowerCase().includes(searchText.toLowerCase());
    });

    const conteudoDashboard = (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            {/* CARDS ATUALIZADOS */}
            <View style={{ marginTop: 10 }}>
                <StatusCard
                    icon="alert-triangle"
                    color="#EF4444" // Vermelho
                    title="Atenção Necessária"
                    subtitle={`${countCriticas} ${countCriticas === 1 ? 'condicionante crítica' : 'condicionantes críticas'}`}
                    onPress={() => router.push('/admin/listaVencidos')}
                />

                <StatusCard
                    icon="clock"
                    color="#F59E0B" // Amarelo/Laranja
                    title="No Prazo"
                    subtitle={`${countSeguras} ${countSeguras === 1 ? 'condicionante no prazo' : 'condicionantes no prazo'}`}
                    onPress={() => router.push('/admin/listaPendentes')}
                />

                <StatusCard
                    icon="check-circle"
                    color="#10B981" // Verde
                    title="Condicionantes Cumpridas"
                    subtitle={`${countCumpridas} ${countCumpridas === 1 ? 'condicionante concluída' : 'condicionantes concluídas'}`}
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

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar cliente..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <View style={styles.listContainer}>
                {clientesExibidos.map((cliente) => (
                    <ClientItem
                        key={cliente.id}
                        data={cliente}
                        onPress={() => router.push(`/admin/ClientDetails/${cliente.id}`)}
                    />
                ))}
                
                {clientesExibidos.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                        {listaClientes.length === 0 ? "Carregando clientes..." : "Nenhum cliente encontrado."}
                    </Text>
                ) : null}
            </View>
        </ScrollView>
    );

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
                    <ScreenContainer bottomContent={conteudoDashboard} />
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
    clientIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    clientIconFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ECFDF5', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientName: { fontSize: 16, fontWeight: '600', color: '#374151' },
    clientDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 18,
        borderWidth: 2,
        borderColor: '#08a437',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
    },
});