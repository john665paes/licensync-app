import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '../estilos/themes';

export default function UserProfileHeader({ 
  userName, 
  userImage, 
  onImagePress, 
  onLogoutPress,
  isCliente,
  nomeContato,
  empresa,
  telefone,
  onPhonePress
}: any) {

  const getSaudacao = () => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) return 'Bom dia';
    if (horaAtual < 18) return 'Boa tarde';
    return 'Boa noite';
  }
  const saudacao = getSaudacao();

  // Pega só o primeiro nome do contato
  const primeiroNome = nomeContato ? nomeContato.split(' ')[0] : "Cliente";

  return (
    <View style={styles.header}>
      <View style={styles.contentContainer}>
        {/* Lado Esquerdo: Imagem e Texto */}
        <View style={styles.leftContent}>
          <TouchableOpacity onPress={onImagePress} activeOpacity={onImagePress ? 0.7 : 1} disabled={!onImagePress}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Feather name="user" size={28} color={theme.colors.primary} />
              </View>
            )}

            {/* A câmera só aparece se NÃO for o layout de cliente */}
            {!isCliente && (
              <View style={styles.editIconContainer}>
                <Feather name="camera" size={10} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          {isCliente ? (
            <View style={styles.profileTextContainer}>
              <Text style={styles.greetingText}>
                {saudacao}, <Text style={{fontWeight: 'bold'}}>{primeiroNome}</Text>!
              </Text>
              <Text style={styles.companyName} numberOfLines={1}>{empresa || "Minha Empresa"}</Text>
              
              {/* {telefone ? (
                <TouchableOpacity onPress={onPhonePress} style={styles.phoneButton}>
                  <Feather name="phone" size={12} color="#D1FAE5" />
                  <Text style={styles.linkText}>{telefone}</Text>
                </TouchableOpacity>
              ) : null} */}
            </View>
          ) : (
            // --- EXIBIÇÃO PADRÃO DO ADMIN ---
            <View>
              <Text style={styles.greetingText}>{saudacao}!</Text>
              <Text style={styles.userName}>{userName || "Carregando..."}</Text>
            </View>
          )}
        </View>

        {/* Lado Direito: Botão de Sair */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogoutPress}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={24} color="#fdfdfd" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary, 
    padding: 16, 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  leftContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    flex: 1, // Para evitar que nomes grandes empurrem o botão de sair
  },
  profileImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#FFFFFF' },
  profilePlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, borderRadius: 10, padding: 4, borderWidth: 1.5, borderColor: '#FFF', elevation: 2 },
  
  // Estilos de Texto do Admin
  greetingText: { fontSize: 16, color: '#D1FAE5', marginBottom: 2 },
  userName: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  
  // Estilos de Texto do Cliente (Baseado no seu código)
  profileTextContainer: { flex: 1, justifyContent: 'center' },
  companyName: { fontSize: 18, fontWeight: "bold", color: '#FFFFFF', marginBottom: 2 },
  phoneButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { color: '#D1FAE5', fontWeight: '600', fontSize: 13 },
  
  logoutButton: { padding: 8, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
});