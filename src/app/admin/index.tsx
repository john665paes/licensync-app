import React, { useEffect, useState } from "react";
import { Alert, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons"; 


import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../config/firebase";
import * as ImagePicker from 'expo-image-picker';


import { ScreenContainer } from "../../componentes/ScreenContainerpags";
import HomeHeader from "../../componentes/Headerprofile";
import { theme } from "../../estilos/themes";


const StatusCard = ({ icon, color, title, subtitle }) => (
    <View style={[styles.statusCard, { borderLeftColor: color }]}>
        <Feather name={icon} size={24} color={color} style={{ marginRight: 15 }} />
        <View>
            <Text style={styles.statusTitle}>{title}</Text>
            {subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
        </View>
    </View>
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
                    
                    // 1. Acha o usuário logado para o Header
                    if (data.email === auth.currentUser?.email) {
                        usuarioLogadoNome = data.nome;
                        usuarioLogadoFoto = data.fotoPerfil;
                    }

                    // 2. Monta a lista com ID para filtrar depois
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
                <StatusCard icon="alert-triangle" color="#DC2626" title="Condicionantes vencendo" subtitle="5 Condicionantes" />
                <StatusCard icon="clock" color="#F59E0B" title="Documentos pendentes" subtitle="9 Documentos" />
                <StatusCard icon="check-circle" color="#10B981" title="Relatórios Aprovados" />
            </View>

     
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meus Clientes</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => router.push('/admin/cadastro')}
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
                        // Mudei o clique para usar a rota que estava no seu código: /admin/cadastroCliente/ID
                        // ainda falta finalizar a pag que recebe o ID pqp veii
                        onPress={() => router.push(`/admin/cadastroCliente/${cliente.id}`)} 
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