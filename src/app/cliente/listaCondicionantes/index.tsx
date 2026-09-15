import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import moment from "moment";

// Firebase
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";

// Componentes
import HomeHeader from "../../../componentes/Headercliente"; 
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import { theme } from "../../../estilos/themes";

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

export default function ListaCondicionantesCliente() {
  const { tipo } = useLocalSearchParams();
  const id = auth.currentUser?.uid;
  
  const [usuario, setUsuario] = useState<any>({});
  const [condicionantes, setCondicionantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CONFIGURAÇÃO DA TELA ---
  let pageConfig = { title: "Condicionantes", color: COLORS.textDark, icon: "list" };
  if (tipo === 'criticas') pageConfig = { title: "Atenção Necessária", color: COLORS.red, icon: "alert-triangle" };
  else if (tipo === 'seguras') pageConfig = { title: "No Prazo (Seguras)", color: COLORS.orange, icon: "clock" };
  else if (tipo === 'cumpridas') pageConfig = { title: "Cumpridas", color: COLORS.green, icon: "check-circle" };

  useFocusEffect(
    useCallback(() => {
      const fetchDados = async () => {
        if (!id) return;
        try {
          // Busca os dados do cliente (para colocar a foto no header)
          const snapUser = await getDoc(doc(db, "usuarios", id));
          if (snapUser.exists()) setUsuario(snapUser.data());

          // Busca as condicionantes Deste Cliente
          const snapCond = await getDocs(collection(db, "usuarios", id, "condicionantes"));
          let condsFiltradas: any[] = [];
          const hoje = moment();

          snapCond.forEach((docItem) => {
            const dataCond = docItem.data();
            let encaixaNoFiltro = false;
            
            if (tipo === 'cumpridas') {
              encaixaNoFiltro = dataCond.status === 'cumprida';
            } else if (dataCond.status !== 'cumprida') {
              const dataPrazo = moment(dataCond.data, "YYYY-MM-DD");
              const diasRestantes = dataPrazo.diff(hoje, "days");

              if (tipo === 'criticas' && diasRestantes <= 30) encaixaNoFiltro = true;
              if (tipo === 'seguras' && diasRestantes > 30) encaixaNoFiltro = true;
            }

            if (encaixaNoFiltro) {
              condsFiltradas.push({ id: docItem.id, ...dataCond });
            }
          });

          // Ordenação
          condsFiltradas.sort((a, b) => {
            const timeA = a.data ? moment(a.data, "YYYY-MM-DD").valueOf() : 0;
            const timeB = b.data ? moment(b.data, "YYYY-MM-DD").valueOf() : 0;
            return timeA - timeB;
          });

          setCondicionantes(condsFiltradas);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDados();
    }, [id, tipo])
  );

  const fotoParaExibir = usuario?.fotoPerfilCliente || usuario?.fotoPerfil;
  const imagemFinalUri = (fotoParaExibir && fotoParaExibir !== "") ? fotoParaExibir : PLACEHOLDER_IMAGE;

  const pageContent = (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      
      <View style={[styles.headerBanner, { backgroundColor: pageConfig.color + '15', borderColor: pageConfig.color }]}>
        <Feather name={pageConfig.icon as any} size={24} color={pageConfig.color} style={{ marginRight: 10 }} />
        <Text style={[styles.headerBannerText, { color: pageConfig.color }]}>{pageConfig.title}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : condicionantes.length > 0 ? (
        <View style={styles.listContainer}>
          {condicionantes.map((item, index) => {
            const isLast = index === condicionantes.length - 1;
            const isUnread = item.visualizada === false;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.listItem, !isLast && styles.separator, isUnread && styles.unreadItem]}
                onPress={() => router.push(`/cliente/checkCondicionante/${item.id}`)}
              >
                <View style={styles.iconWrapper}>
                  <Feather name={pageConfig.icon as any} size={22} color={pageConfig.color} />
                </View>
                
                <View style={styles.textWrapper}>
                  <Text style={[styles.itemTitle, isUnread && { fontWeight: 'bold' }]} numberOfLines={1}>
                    {item.condicionante || "Sem título"}
                  </Text>
                  <Text style={styles.itemDate}>
                    Prazo: {item.data ? moment(item.data, "YYYY-MM-DD").format("DD/MM/YYYY") : "--/--/----"}
                  </Text>
                </View>

                {isUnread && (
                  <View style={styles.notificationBell}>
                    <Feather name="bell" size={16} color={COLORS.orange} />
                    <View style={styles.notificationDot} />
                  </View>
                )}

                <Feather name="chevron-right" size={18} color={COLORS.textGray} />
              </TouchableOpacity>
            )
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>Você não possui condicionantes nesta categoria.</Text>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <HomeHeader
        isCliente={true}
        isVoltar={true}
        hideCamera={true}
        tituloCustom={pageConfig.title}
        subtituloCustom="Lista de Condicionantes"
        userImage={imagemFinalUri}
        onLogoutPress={() => router.back()} 
      />
      <ScreenContainer bottomContent={pageContent} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  headerBannerText: { fontSize: 18, fontWeight: 'bold' },
  listContainer: { backgroundColor: COLORS.white, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, backgroundColor: COLORS.white },
  separator: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  unreadItem: { backgroundColor: '#FFFBEB' },
  iconWrapper: { width: 32, alignItems: "center", marginRight: 12 },
  textWrapper: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textDark, marginBottom: 2 },
  itemDate: { fontSize: 12, color: COLORS.textGray },
  notificationBell: { marginRight: 10, position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.red, borderWidth: 1, borderColor: COLORS.white },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textGray, fontSize: 16 }
});