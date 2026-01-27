import React, { useEffect, useState } from "react";
import {   View,  Text,  StyleSheet,  ScrollView,  TouchableOpacity, Image,  Alert,  
  RefreshControl,  ActivityIndicator,  Linking,  SafeAreaView,  Platform,  StatusBar} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { db, storage } from "../../../config/firebase";
import {  collection,  deleteDoc,  doc,  getDoc,  getDocs,  updateDoc,} from "firebase/firestore";
import * as DocumentPicker from "expo-document-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import HomeHeader from "../../../componentes/HomeHeader";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import { theme } from "../../../estilos/themes";

// --- CONFIGURAÇÃO DE CORES E ESTILOS GERAIS ---
const COLORS = {
  primary: theme.colors.primary, // Verde similar ao da imagem
  background: "#F9FAFB", // Cinza bem claro de fundo
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
  const [usuario, setUsuario] = useState({});
  const [condicionantes, setCondicionantes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([handleBuscarUsuario(), handleBuscarCondicionantes()]);
    setRefreshing(false);
  };

  const handleBuscarUsuario = async () => {
    try {
      const snapshot = await getDoc(doc(db, "usuarios", id));
      if (snapshot.exists()) {
        setUsuario(snapshot.data());
      }
    } catch (error) {
      console.error("Erro usuário:", error);
    }
  };

  const handleBuscarCondicionantes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "usuarios", id, "condicionantes"));
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
        
        const response = await fetch(file.uri);
        const blob = await response.blob();
        
        await uploadBytes(refLicenca, blob);
        const url = await getDownloadURL(refLicenca);
        
        await updateDoc(doc(db, "usuarios", id), { licenca: url });
        setUsuario((prev) => ({ ...prev, licenca: url }));
        Alert.alert("Sucesso", "Licença enviada!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha no upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletarCondicionante = (idItem: string) => {
    Alert.alert("Excluir", "Deseja apagar esta condicionante?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "usuarios", id, "condicionantes", idItem));
            setCondicionantes((prev) => prev.filter((c) => c.id !== idItem));
          } catch (e) {
            Alert.alert("Erro", "Não foi possível apagar.");
          }
        },
      },
    ]);
  };

  const DashboardContent = () => (
    <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* --- CABEÇALHO / PERFIL --- */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: PLACEHOLDER_IMAGE }} // Troque por usuario?.fotoUrl se tiver
              style={styles.avatar}
            />
          </View>
          <Text style={styles.companyName}>
            {usuario?.empresa || "Carros Elétricos do Brasil"}
          </Text>
          <Text style={styles.contactName}>
            {usuario?.nomeContato || (usuario?.email ? usuario.email.split('@')[0] : "José Inácio Alcântara")}
          </Text>
        </View>

        {/* --- TÍTULO DA SEÇÃO E BOTÃO 'CRIAR NOVO' --- */}
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

        {/* --- LISTA --- */}
        <View style={styles.listContainer}>
          {condicionantes.length > 0 ? (
            condicionantes
              .sort((a, b) => moment(a.data).toDate() - moment(b.data).toDate())
              .map((item, index) => {
                const { color, icon } = getStatusInfo(item.data);
                const isLast = index === condicionantes.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={[styles.listItem, !isLast && styles.separator]}
                    onPress={() => handleDeletarCondicionante(item.id)}
                  >
                    {/* Ícone Esquerda */}
                    <View style={styles.iconWrapper}>
                      <Feather name={icon} size={24} color={color} />
                    </View>

                    {/* Textos */}
                    <View style={styles.textWrapper}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.condicionante || "Sem título"}
                      </Text>
                      <Text style={styles.itemDate}>
                        Prazo: {item.data ? moment(item.data).format("DD/MM/YYYY") : "--/--/----"}
                      </Text>
                    </View>

                    {/* Seta Direita */}
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

        {/* --- BOTÃO GRANDE DE LICENÇA --- */}
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
          
          {usuario?.licenca && (
             <TouchableOpacity style={{ marginTop: 12 }} onPress={() => Linking.openURL(usuario.licenca)}>
                <Text style={{ color: COLORS.primary, textAlign: 'center', textDecorationLine: 'underline' }}>
                   Ver licença atual
                </Text>
             </TouchableOpacity>
          )}
        </View>

      </ScrollView>

  );

  useEffect(() => {
    handleBuscarUsuario();
    handleBuscarCondicionantes();
  }, []);

  // --- LÓGICA VISUAL ---
  const getStatusInfo = (dataString: moment.MomentInput) => {
    if (!dataString) return { color: COLORS.textGray, icon: "help-circle" };
    
    const dataPrazo = moment(dataString, "YYYY-MM-DD");
    const hoje = moment();
    const diasRestantes = dataPrazo.diff(hoje, "days");

    if (dataPrazo.isBefore(hoje, 'day')) return { color: COLORS.red, icon: "alert-circle" };
    if (diasRestantes <= 30) return { color: COLORS.orange, icon: "clock" };
    return { color: COLORS.primary, icon: "check-circle" };
  };

  return (
    <SafeAreaView style={{ flex: 3 }}>
      <HomeHeader
        title="Detalhes do Cliente"
        onBackPress={() => router.back()}
        />

      <ScreenContainer
        bottomContent={<DashboardContent />}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Ajuste para Android
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Perfil
  profileContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: COLORS.primary, // Borda verde ao redor da foto
    padding: 3, // Espaço entre borda e foto
    backgroundColor: COLORS.white,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    resizeMode: 'contain',
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 4,
    textAlign: "center",
  },
  contactName: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
  },
  // Cabeçalho da Seção
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  createButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 12,
  },
  // Lista
  listContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16, // Margem lateral para parecer um "card" flutuante
    borderRadius: 12,
    // Sombra suave (Shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden", // Garante que itens não passem da borda arredondada
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // Linha divisória bem fina
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textGray,
    fontSize: 14,
  },
  // Rodapé
  footerContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  largeButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  largeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});