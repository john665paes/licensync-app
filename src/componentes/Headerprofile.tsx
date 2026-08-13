import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '../estilos/themes';

export default function UserProfileHeader({ userName, userImage, onImagePress, onLogoutPress }) {

  const getSaudacao = () => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) return 'Bom-dia!';
    if (horaAtual < 18) return 'Boa-tarde!';
    return 'Boa-noite!';
  }
  const saudacao = getSaudacao();

  return (
    <View style={styles.header}>
      <View style={styles.contentContainer}>
        {/* Lado Esquerdo: Imagem e Texto */}
        <View style={styles.leftContent}>
          <TouchableOpacity onPress={onImagePress} activeOpacity={0.7}>
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Feather name="user" size={28} color={theme.colors.primary} />
              </View>
            )}

            <View style={styles.editIconContainer}>
              <Feather name="camera" size={10} color="#FFF" />
            </View>
          </TouchableOpacity>

          <View>
            <Text style={styles.greetingText}>{saudacao}</Text>
            <Text style={styles.userName}>{userName || "Carregando..."}</Text>
          </View>
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
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28, 
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingText: {
    fontSize: 14, 
    color: '#D1FAE5', 
  },
  userName: {
    fontSize: 20, 
    fontWeight: '600', 
    color: '#FFFFFF', 
  },
  logoutButton: {
    padding: 8, 
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Um fundo levemente transparente para destacar o botão
  },
  profilePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28, 
    backgroundColor: '#9CA3AF', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary, 
    borderRadius: 10,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
    elevation: 2
  },
});