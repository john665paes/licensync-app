import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
// Usando lucide-react-native como você já instalou
import { Menu, ChevronLeft, User, Settings, FileText, HelpCircle, LogOut } from 'lucide-react-native'; 
import { theme } from '../estilos/themes';

interface HomeHeaderProps {
  title?: string;
  onBackPress?: () => void;
  // onMenuPress não precisa mais vir de fora, pois o menu abre internamente agora
}

export default function HomeHeader({ title = "Página Inicial", onBackPress }: HomeHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  // Lista de opções do Menu (Aleatórias por enquanto)
  const menuOptions = [
    { id: 1, label: 'Meu Perfil', icon: <User size={20} color="#333" /> },
    { id: 2, label: 'Configurações', icon: <Settings size={20} color="#333" /> },
    { id: 3, label: 'Meus Pedidos', icon: <FileText size={20} color="#333" /> },
    { id: 4, label: 'Ajuda', icon: <HelpCircle size={20} color="#333" /> },
    { id: 5, label: 'Sair', icon: <LogOut size={20} color="#DC2626" />, isDestructive: true },
  ];

  // Função para lidar com o clique na opção (só fecha o menu e loga por enquanto)
  const handleMenuOption = (label: string) => {
    console.log(`Clicou em: ${label}`);
    setMenuVisible(false);
    // Aqui você adicionaria: router.push('/caminho')
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
        {/* Se onBackPress existir, mostra o botão. Se não, mostra uma View vazia pra manter o título no centro */}
        {onBackPress ? (
          <TouchableOpacity 
            onPress={onBackPress} 
            style={styles.iconButton}
          >
            {/* Ícone apontando para esquerda, mas posicionado na direita da tela */}
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
        onRequestClose={() => setMenuVisible(false)} // Para fechar no botão físico 'voltar' do Android
      >
        {/* TouchableWithoutFeedback fecha o menu se clicar fora dele */}
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            
            {/* O Conteúdo do Menu (Caixinha Branca) */}
            <TouchableWithoutFeedback>
              <View style={styles.menuContent}>
                {menuOptions.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      styles.menuItem, 
                      index === menuOptions.length - 1 && styles.lastMenuItem // Tira a borda do último
                    ]}
                    onPress={() => handleMenuOption(item.label)}
                  >
                    {item.icon}
                    <Text style={[
                      styles.menuText, 
                      item.isDestructive && styles.destructiveText // Texto vermelho se for 'Sair'
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
    justifyContent: 'space-between', // Isso joga um pra esquerda e um pra direita
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
    flex: 1, // Ocupa todo o espaço sobrando no meio
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Estilos do Modal (Menu)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Fundo escuro transparente
    justifyContent: 'flex-start', // Começa do topo
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    width: 250, // Largura do menu
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 55 : 90, // Posição abaixo do header
    marginLeft: 10, // Margem da esquerda
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