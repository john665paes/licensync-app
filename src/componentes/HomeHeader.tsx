import React, { useState } from 'react';
import {
  View,  Text,  TouchableOpacity,  StyleSheet,  Platform,
  StatusBar,  Modal,  TouchableWithoutFeedback} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, ChevronLeft, User, Settings, FileText, HelpCircle, LogOut } from 'lucide-react-native';
import { theme } from '../estilos/themes';

export interface MenuOptionsItem {
  id: number;
  label: string;
  icon: React.ReactNode;
  isDestructive?: boolean;
  onPress?: () => void;
}

interface HomeHeaderProps {
  title?: string;
  onBackPress?: () => void;
  menuOptions?: MenuOptionsItem[];
}

const defaultMenuOptions: MenuOptionsItem[] = [
  { id: 1, label: 'Meu Perfil', icon: <User size={20} color="#333" /> },
  { id: 2, label: 'Configurações', icon: <Settings size={20} color="#333" /> },
  { id: 3, label: 'Meus Pedidos', icon: <FileText size={20} color="#333" /> },
  { id: 4, label: 'Ajuda', icon: <HelpCircle size={20} color="#333" /> },
  { id: 5, label: 'Sair', icon: <LogOut size={20} color="#DC2626" />, isDestructive: true },
];

export default function HomeHeader({
  title = "Página Inicial", 
  onBackPress, 
  menuOptions = defaultMenuOptions 
}: HomeHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  // Função para lidar com o clique na opção (agora corrigida a sintaxe "=")
  const handleMenuOption = (item: MenuOptionsItem) => {
    setMenuVisible(false);
    
    // Se a opção tiver uma função própria (ex: router.push), ela executa aqui
    if (item.onPress) {
      item.onPress();
    } else {
      console.log(`Clicou em: ${item.label} (Sem ação definida)`);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>

        {/* 1. ESQUERDA: Menu Sanduíche (Abre o Modal) */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.iconButton}
        >
          <Menu size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* 2. CENTRO: Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* 3. DIREITA: Botão de Voltar */}
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.iconButton}
          >
            <ChevronLeft size={35} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

      </View>

      {/* --- MENU MODAL (Dropdown) --- */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)} 
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>

            <TouchableWithoutFeedback>
              <View style={styles.menuContent}>
                {menuOptions.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      index === menuOptions.length - 1 && styles.lastMenuItem
                    ]}
                    onPress={() => handleMenuOption(item)}
                  >
                    {item.icon}
                    <Text style={[
                      styles.menuText,
                      item.isDestructive && styles.destructiveText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'flex-start', 
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    width: 250, 
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 55 : 90, 
    marginLeft: 10, 
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
  },
  destructiveText: {
    color: '#DC2626',
    fontWeight: 'bold',
  }
});