import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, ActivityIndicator, TextInput, Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "../../../config/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Feather } from "@expo/vector-icons";
import moment from "moment";
import DateTimePicker from '@react-native-community/datetimepicker'; // <-- Importado o Picker
import HomeHeader from "../../../componentes/HomeHeader";
import { ScreenContainer } from "../../../componentes/ScreenContainerpags";
import { theme } from "../../../estilos/themes";
import { UserCog, LogOut } from 'lucide-react-native';

const COLORS = {
  primary: theme.colors.primary, 
  background: "#F9FAFB", 
  white: "#FFFFFF",
  textDark: "#1F2937",
  textGray: "#6B7280",
  border: "#E5E7EB",
  red: "#EF4444",
  green: "#10B981"
};

export default function DetalhesCondicionante() {
  const { clienteId, condicionanteId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [condicionante, setCondicionante] = useState<any>(null);
  
  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");
  const [dataEditada, setDataEditada] = useState(""); 
  
  // Estado do Calendário
  const [showPicker, setShowPicker] = useState(false);

  // Opções do menu superior
  const opcoesMenu = [
    { 
      id: 1, 
      label: 'Inicio', 
      icon: <UserCog size={20} color="#333" />, 
      onPress: () => router.push('admin/') 
    },
    { 
      id: 2, 
      label: 'Sair', 
      icon: <LogOut size={20} color={COLORS.red} />, 
      isDestructive: true,
      onPress: () => {
        Alert.alert("Sair", "Deseja realmente sair?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: () => router.replace('/') }
        ]);
      }
    },
  ];

  const carregarCondicionante = async () => {
    try {
      const docRef = doc(db, "usuarios", clienteId as string, "condicionantes", condicionanteId as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCondicionante(data);
        setTextoEditado(data.condicionante || "");
        setDataEditada(data.data || "");
      } else {
        Alert.alert("Erro", "Condicionante não encontrada.");
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao buscar detalhes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCondicionante();
  }, []);

  // --- Funções do Calendário ---
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    
    if (selectedDate) {
        setDataEditada(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  const handleDismiss = () => {
      setShowPicker(false);
  };

  const handleSalvarEdicao = async () => {
    if (!textoEditado.trim() || !dataEditada) {
      Alert.alert("Aviso", "Todos os campos precisam ser preenchidos.");
      return;
    }

    try {
      setLoading(true);
      const docRef = doc(db, "usuarios", clienteId as string, "condicionantes", condicionanteId as string);
      
      await updateDoc(docRef, {
        condicionante: textoEditado,
        data: dataEditada
      });

      setCondicionante({ ...condicionante, condicionante: textoEditado, data: dataEditada });
      setIsEditing(false);
      
      Alert.alert(
        "Sucesso", 
        "Condicionante atualizada com sucesso!",
        [{ text: "OK", onPress: () => router.back() }]
      );
      
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handleApagar = () => {
    Alert.alert("Excluir", "Tem certeza que deseja apagar esta condicionante?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const docRef = doc(db, "usuarios", clienteId as string, "condicionantes", condicionanteId as string);
            await deleteDoc(docRef);
            Alert.alert("Sucesso", "Condicionante apagada.");
            router.back(); 
          } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível apagar.");
            setLoading(false);
          }
        },
      },
    ]);
  };

  const pageContent = (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Detalhes da Condicionante</Text>

          {isEditing ? (
            /* MODO DE EDIÇÃO */
            <View style={styles.formContainer}>
              
              <Text style={styles.label}>Texto da Condicionante:</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                value={textoEditado}
                onChangeText={setTextoEditado}
                multiline
              />
              
              <Text style={styles.label}>Data de Vencimento :</Text>
              
              {/* Botão para abrir o Calendário */}
              <TouchableOpacity 
                  style={styles.datePickerButton} 
                  onPress={() => setShowPicker(true)}
              >
                  <Feather name="calendar" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                  <Text style={styles.datePickerText}>
                      {dataEditada ? moment(dataEditada, "YYYY-MM-DD").format('DD/MM/YYYY') : "Selecionar data"}
                  </Text>
              </TouchableOpacity>

              {/* Calendário Nativo */}
              {showPicker && (
                  <DateTimePicker
                      testID="datetimepicker"
                      // Se já houver data, abre nela. Se não, abre na data de hoje
                      value={dataEditada ? moment(dataEditada, "YYYY-MM-DD").toDate() : new Date()}
                      mode="date"
                      display="default"
                      onValueChange={handleDateChange}
                      onDismiss={handleDismiss}
                  />
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.btnAction, { borderColor: COLORS.textGray }]} onPress={() => {
                  setIsEditing(false);
                  setTextoEditado(condicionante?.condicionante || ""); 
                  setDataEditada(condicionante?.data || "");
                }}>
                  <Text style={[styles.btnText, { color: COLORS.textGray }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnAction, { backgroundColor: COLORS.green, borderColor: COLORS.green }]} onPress={handleSalvarEdicao}>
                  <Feather name="save" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                  <Text style={[styles.btnText, { color: COLORS.white }]}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* MODO DE VISUALIZAÇÃO */
            <View style={styles.viewContainer}>
              <Text style={styles.viewLabel}>Texto da Condicionante:</Text>
              <View style={styles.textArea}>
                <Text style={styles.viewText}>{condicionante?.condicionante}</Text>
              </View>

              <Text style={styles.viewLabel}>Data de Vencimento:</Text>
              <View style={styles.textArea}>
                 <Text style={styles.viewText}>
                  {condicionante?.data ? moment(condicionante.data).format("DD/MM/YYYY") : "Não informada"}
                 </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.btnAction, { borderColor: COLORS.red }]} onPress={handleApagar}>
                  <Feather name="trash-2" size={16} color={COLORS.red} style={{ marginRight: 6 }} />
                  <Text style={[styles.btnText, { color: COLORS.red }]}>Apagar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnAction, { borderColor: COLORS.primary }]} onPress={() => setIsEditing(true)}>
                  <Feather name="edit-2" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.btnText, { color: COLORS.primary }]}>Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <HomeHeader
        title="Condicionante"
        onBackPress={() => router.back()}
        menuOptions={opcoesMenu} 
      />
      <ScreenContainer bottomContent={pageContent} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  viewContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textGray,
    marginBottom: 8,
  },
  viewLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textGray,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textDark,
    backgroundColor: COLORS.background,
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewText: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
  },
  btnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.background,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
});