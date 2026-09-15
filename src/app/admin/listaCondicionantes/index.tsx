import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import moment from "moment";

// Firebase
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";

// Componentes
import HomeHeader from "../../../componentes/HomeHeader";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";

const COLORS = {
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

export default function ListaCondicionantesAdmin() {
  const { tipo } = useLocalSearchParams(); // Recebe o "aviso" da rota
  const [condicionantes, setCondicionantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CONFIGURAÇÃO INTELIGENTE DA TELA BASEADA NO TIPO ---
  let pageConfig = { title: "Condicionantes", color: COLORS.textDark, icon: "list" };
  if (tipo === 'criticas') pageConfig = { title: "Atenção Necessária", color: COLORS.red, icon: "alert-triangle" };
  else if (tipo === 'seguras') pageConfig = { title: "No Prazo (Seguras)", color: COLORS.orange, icon: "clock" };
  else if (tipo === 'cumpridas') pageConfig = { title: "Cumpridas", color: COLORS.green, icon: "check-circle" };

  useFocusEffect(
    useCallback(() => {
      const fetchTodasCondicionantes = async () => {
        try {
          const usuariosRef = collection(db, "usuarios");
          const snapshotUsuarios = await getDocs(usuariosRef);
          
          let todasCondicionantes: any[] = [];
          const hoje = moment();

          for (const userDoc of snapshotUsuarios.docs) {
            const userData = userDoc.data();
            if (userData.nivel === 'cliente') {
              const condRef = collection(db, "usuarios", userDoc.id, "condicionantes");
              const condSnap = await getDocs(condRef);

              condSnap.forEach(docCond => {
                const dataCond = docCond.data();
                
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
                  todasCondicionantes.push({
                    id: docCond.id,
                    clienteId: userDoc.id,
                    clienteNome: userData.empresa || userData.nome || "Cliente Desconhecido",
                    clienteFoto: userData.fotoPerfilCliente || userData.fotoPerfil,
                    ...dataCond
                  });
                }
              });
            }
          }

          todasCondicionantes.sort((a, b) => {
            const timeA = a.data ? moment(a.data, "YYYY-MM-DD").valueOf() : 0;
            const timeB = b.data ? moment(b.data, "YYYY-MM-DD").valueOf() : 0;
            return timeA - timeB;
          });

          setCondicionantes(todasCondicionantes);
        } catch (error) {
          console.error("Erro ao buscar condicionantes:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDados();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      function fetchDados() { fetchTodasCondicionantes(); }
    }, [tipo])
  );

  const pageContent = (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.headerBanner, { backgroundColor: pageConfig.color + '15', borderColor: pageConfig.color }]}>
        <Feather name={pageConfig.icon as any} size={24} color={pageConfig.color} style={{ marginRight: 10 }} />
        <Text style={[styles.headerBannerText, { color: pageConfig.color }]}>{pageConfig.title}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={pageConfig.color} style={{ marginTop: 50 }} />
      ) : condicionantes.length > 0 ? (
        condicionantes.map((item, index) => {
          const fotoUri = item.clienteFoto || PLACEHOLDER_IMAGE;
          
          // MÁGICA DA NOTIFICAÇÃO: É cumprida E o Admin ainda não viu?
          const isUnread = item.status === 'cumprida' && item.adminVisualizou === false;

          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.card, isUnread && styles.unreadCard]}
              onPress={() => router.push(`/admin/detalheCondicionante?clienteId=${item.clienteId}&condicionanteId=${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: fotoUri }} style={styles.clientAvatar} />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{item.clienteNome}</Text>
                  <Text style={styles.dueDate}>
                    Prazo: {item.data ? moment(item.data, "YYYY-MM-DD").format("DD/MM/YYYY") : "--/--/----"}
                  </Text>
                </View>
                
                {/* ETIQUETA "NOVA" PRO ADMIN VER */}
                {isUnread && (
                    <View style={styles.notificationBadge}>
                        <Feather name="bell" size={12} color="#FFF" />
                        <Text style={styles.notificationBadgeText}>Nova</Text>
                    </View>
                )}
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.condicionanteText} numberOfLines={2}>
                  {item.condicionante || "Sem descrição..."}
                </Text>
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={[styles.actionText, { color: pageConfig.color }]}>Ver detalhes</Text>
                <Feather name="chevron-right" size={16} color={pageConfig.color} />
              </View>
            </TouchableOpacity>
          )
        })
      ) : (
        <Text style={styles.emptyText}>Nenhuma condicionante nesta categoria.</Text>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <HomeHeader
        title={pageConfig.title}
        onBackPress={() => router.back()}
      />
      <ScreenContainer bottomContent={pageContent} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  headerBannerText: { fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  
  // ESTILOS DA NOTIFICAÇÃO
  unreadCard: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  notificationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  notificationBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  clientAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark },
  dueDate: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  cardBody: { marginBottom: 12 },
  condicionanteText: { fontSize: 14, color: COLORS.textDark, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  actionText: { fontSize: 13, fontWeight: '600', marginRight: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textGray, fontSize: 16 }
});