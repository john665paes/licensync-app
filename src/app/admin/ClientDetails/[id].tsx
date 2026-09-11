import React, { useCallback, useState } from "react";
import {   
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,  
  RefreshControl, ActivityIndicator, Linking, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { db, storage } from "../../../config/firebase";
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import * as DocumentPicker from "expo-document-picker";
// --- ADICIONADO deleteObject NA IMPORTAÇÃO DO STORAGE ---
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import moment from "moment";
import HomeHeader from "../../../componentes/HomeHeader";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import { theme } from "../../../estilos/themes";
import { UserCog, ShieldCheck, LogOut, TrashIcon, Trash2 } from 'lucide-react-native';

const COLORS = {
  primary: theme.colors.primary, 
  background: "#F9FAFB", 
  white: "#FFFFFF",
  textDark: "#1F2937",
  textGray: "#6B7280",
  border: "#E5E7EB",
  red: "#EF4444",
  orange: "#F59E0B",
};

const PLACEHOLDER_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/BYD_Auto_logo_%282022%29.svg/1200px-BYD_Auto_logo_%282022%29.svg.png";

export default function CadastroCliente() {
  const { id } = useLocalSearchParams();
  const [usuario, setUsuario] = useState<any>({});
  const [condicionantes, setCondicionantes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleApagarCliente = async () => {
    try {
      const condicionantesRef = collection(db, "usuarios", id as string, "condicionantes");
      const snap = await getDocs(condicionantesRef);
      
      const deletePromises = snap.docs.map(docItem => 
        deleteDoc(doc(db, "usuarios", id as string, "condicionantes", docItem.id))
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "usuarios", id as string));

      Alert.alert("Sucesso", "Cliente apagado permanentemente.");
      router.replace('/admin'); 
    } catch (error) {
      console.error("Erro ao apagar cliente:", error);
      Alert.alert("Erro", "Não foi possível apagar o cliente no momento.");
    }
  };

  const opcoesDoCliente = [
    { 
      id: 1, 
      label: 'Inicio', 
      icon: <UserCog size={20} color="#333" />, 
      onPress: () => router.push('admin/')
    },
    { 
      id: 2, 
      label: 'Editar Cliente', 
      icon: <ShieldCheck size={20} color="#333" />, 
      onPress: () => {
        router.push(`/admin/editar?id=${id}`);
      }
    },
    { 
      id: 3, 
      label: 'Apagar Cliente', 
      icon: <Trash2 size={20} color={COLORS.red} />, 
      isDestructive: true, 
      onPress: () => {
        Alert.alert("Apagar Cliente", "Deseja realmente apagar este cliente? Esta ação não pode ser desfeita.", [
            { text: "Cancelar", style: "cancel" },
            { 
              text: "Apagar", 
              style: "destructive", 
              onPress: handleApagarCliente 
            }
        ]);
      } 
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([handleBuscarUsuario(), handleBuscarCondicionantes()]);
    setRefreshing(false);
  };

  const handleBuscarUsuario = async () => {
    try {
      const snapshot = await getDoc(doc(db, "usuarios", id as string));
      if (snapshot.exists()) {
        setUsuario(snapshot.data());
      }
    } catch (error) {
      console.error("Erro usuário:", error);
    }
  };

  const handleBuscarCondicionantes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "usuarios", id as string, "condicionantes"));
      if (!snapshot.empty) {
        const data = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setCondicionantes(data);
      } else {
        setCondicionantes([]);
      }
    } catch (error) {
      console.error("Erro condicionantes:", error);
    }
  };

  const inserirLicenca = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && id) {
        setIsUploading(true);
        const file = result.assets[0];
        const fileName = file.name || "licenca.pdf";
        const refLicenca = ref(storage, `arquivos/${id}/${Date.now()}_${fileName}`);
        
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
          xhr.open("GET", file.uri, true);
          xhr.send(null);
        });
        
        await uploadBytes(refLicenca, blob);
        const url = await getDownloadURL(refLicenca);
        
        await updateDoc(doc(db, "usuarios", id as string), { licenca: url });
        setUsuario((prev: any) => ({ ...prev, licenca: url }));
        Alert.alert("Sucesso", "Licença enviada!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha no upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- NOVA FUNÇÃO: APAGAR A LICENÇA ---
  const handleApagarLicenca = () => {
    Alert.alert(
      "Apagar Licença",
      "Tem certeza que deseja apagar a licença atual? O PDF será excluído permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive", 
          onPress: async () => {
            try {
              // 1. Apaga do Firebase Storage
              const licencaRef = ref(storage, usuario.licenca);
              await deleteObject(licencaRef);

              // 2. Remove do Firestore
              await updateDoc(doc(db, "usuarios", id as string), { licenca: "" });

              // 3. Atualiza a tela
              setUsuario((prev: any) => ({ ...prev, licenca: "" }));
              Alert.alert("Sucesso", "Licença removida com sucesso!");
            } catch (error) {
              console.error("Erro ao apagar licença:", error);
              Alert.alert("Erro", "Não foi possível apagar a licença no momento.");
            }
          } 
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        handleBuscarUsuario();
        handleBuscarCondicionantes();
      }
    }, [id])
  );

  const getStatusInfo = (dataString: any) => {
    if (!dataString) return { color: COLORS.textGray, icon: "help-circle" };
    
    const dataPrazo = moment(dataString, "YYYY-MM-DD");
    const hoje = moment();
    const diasRestantes = dataPrazo.diff(hoje, "days");

    if (dataPrazo.isBefore(hoje, 'day')) return { color: COLORS.red, icon: "alert-circle" };
    if (diasRestantes <= 30) return { color: COLORS.orange, icon: "clock" };
    return { color: COLORS.primary, icon: "check-circle" };
  };

  const handleContato = (telefone: string) => {
    if (!telefone) return Alert.alert("Aviso", "Telefone não cadastrado.");
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    Linking.openURL(`tel:${numeroLimpo}`).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o aplicativo de telefone do celular.");
    });
  };

  const nomeEmpresa = usuario?.empresa || "Cliente";
  const PLACEHOLDER_IMAGE = `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeEmpresa)}&background=10B981&color=fff&size=200`;
  
  const fotoParaExibir = usuario?.fotoPerfilCliente || usuario?.fotoPerfil;
  const imagemFinalUri = (fotoParaExibir && fotoParaExibir !== "" && !imageError) ? fotoParaExibir : PLACEHOLDER_IMAGE;
  
  const dashboardContent = (
    <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileContainer}>
         <View style={styles.avatarWrapper}>
            <Image
              key={imagemFinalUri} 
              source={{ uri: imagemFinalUri }} 
              style={styles.avatar}
              onError={() => {
                console.log("Falha ao baixar foto do Firebase, usando placeholder...");
                setImageError(true);
              }}
            />
          </View>
          <Text style={styles.companyName}>
            {usuario?.empresa}
          </Text>
          
          <View style={styles.contactInfoContainer}>
            <Text style={styles.contactName}>
              <Text style={{fontWeight: 'bold', color: COLORS.textDark}}>Contato:</Text> {usuario?.nomeContato || (usuario?.email ? usuario.email.split('@')[0] : "Não informado")}
            </Text>
            
            <Text style={styles.contactSeparator}> | </Text>
            
            <TouchableOpacity onPress={() => handleContato(usuario?.telefone1)}>
              <Text style={styles.contactPhone}>
                <Text style={{fontWeight: 'bold', color: COLORS.textDark}}>Tel:</Text> <Text style={styles.linkText}>{usuario?.telefone1 || "Não informado"}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Condicionantes</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push(`/../admin/addCondicionante?id=${id}`)}
          >
            <Feather name="plus-square" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.createButtonText}>Criar Nova</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
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
                    onPress={() => router.push(`/admin/detalheCondicionante?clienteId=${id}&condicionanteId=${item.id}`)}
                  >
                    <View style={styles.iconWrapper}>
                      <Feather name={icon as any} size={24} color={color} />
                    </View>
                    <View style={styles.textWrapper}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.condicionante || "Sem título"}
                      </Text>
                      <Text style={styles.itemDate}>
                        Prazo: {item.data ? moment(item.data, "YYYY-MM-DD").format("DD/MM/YYYY") : "--/--/----"}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.textGray} />
                  </TouchableOpacity>
                );
              })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma condicionante encontrada.</Text>
            </View>
          )}
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.largeButton}
            onPress={inserirLicenca}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.largeButtonText}>Adicionar Licença</Text>
            )}
          </TouchableOpacity>
          
          {/* --- NOVO LAYOUT: Card de Licença + Botão Apagar --- */}
          {usuario?.licenca && (
             <View style={styles.licenseRowContainer}>
               <TouchableOpacity 
                  style={[styles.licenseCard, { flex: 1, marginTop: 0 }]} 
                  onPress={() => Linking.openURL(usuario.licenca)}
               >
                  <View style={styles.licenseCardIcon}>
                      <Feather name="file-text" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.licenseCardText}>
                      <Text style={styles.licenseCardTitle}>Licença do Cliente</Text>
                      <Text style={styles.licenseCardSubtitle}>Toque para abrir o PDF</Text>
                  </View>
                  <Feather name="external-link" size={20} color={COLORS.textGray} />
               </TouchableOpacity>

               <TouchableOpacity 
                  style={styles.deleteLicenseBtn} 
                  onPress={handleApagarLicenca}
               >
                 <Feather name="trash-2" size={24} color={COLORS.red} />
               </TouchableOpacity>
             </View>
          )}
        </View>
      </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <HomeHeader
        title="Detalhes do Cliente"
        onBackPress={() => {if (router.canGoBack()) router.back(); else router.replace('/admin');}}
        menuOptions={opcoesDoCliente} 
      />
      <ScreenContainer bottomContent={dashboardContent} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 25 : 0 },
  scrollContent: { paddingBottom: 40 },
  profileContainer: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  avatarWrapper: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: COLORS.primary, padding: 3, backgroundColor: COLORS.white, marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: "100%", height: "100%", borderRadius: 40, resizeMode: 'cover' },
  companyName: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark, marginBottom: 4, textAlign: "center" },
  contactInfoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  contactName: { fontSize: 14, color: COLORS.textGray },
  contactSeparator: { fontSize: 14, color: COLORS.textGray, marginHorizontal: 8 },
  contactPhone: { fontSize: 14, color: COLORS.textGray },
  linkText: { color: COLORS.primary, textDecorationLine: 'underline', fontWeight: '500' },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#4B5563" },
  createButton: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.primary, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "transparent" },
  createButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 12 },
  listContainer: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, backgroundColor: COLORS.white },
  separator: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  iconWrapper: { width: 32, alignItems: "center", marginRight: 12 },
  textWrapper: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textDark, marginBottom: 2 },
  itemDate: { fontSize: 12, color: COLORS.textGray },
  emptyState: { padding: 20, alignItems: "center" },
  emptyText: { color: COLORS.textGray, fontSize: 14 },
  footerContainer: { marginTop: 24, paddingHorizontal: 20 },
  largeButton: { width: "100%", height: 50, borderRadius: 25, borderWidth: 1, borderColor: COLORS.primary, justifyContent: "center", alignItems: "center", backgroundColor: "transparent" },
  largeButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: "bold" },
  
  // --- NOVOS ESTILOS PARA ACOMODAR A LIXEIRA DA LICENÇA ---
  licenseRowContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  licenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  licenseCardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  licenseCardText: { flex: 1, marginLeft: 12 },
  licenseCardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  licenseCardSubtitle: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  deleteLicenseBtn: { marginLeft: 12, backgroundColor: '#FEF2F2', width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' }
});