import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '../estilos/themes';


export default function UserProfileHeader({ userName, userImage, onImagePress }) {


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
        {/* manter do laddo Esquerdo: Imagem e Texto */}
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

        {/* Lado Direito: Ícone de Notificação */}
        {/* TouchableOpacity é o botão padrão para feedback visual em mobile */}
        <TouchableOpacity
          style={styles.notificationButton}
          // Adicione uma função onPress
          onPress={() => console.log('Notificações pressionadas')}
          activeOpacity={0.8}>

          <Feather name="bell" size={24} color="#FFFFFF" />
          <View style={styles.notificationDot}></View>
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
    fontWeight: '600', // font-semibold
    color: '#FFFFFF', // text-white (Herdado, mas garantido)
  },

  // Equivalente a 'relative p-2 rounded-full hover:bg-emerald-500 focus...'
  notificationButton: {
    padding: 8, // p-2 (8px)
    borderRadius: 16, // rounded-full (para um botão de 24+8+8 = 40px)
    // No RN, não há 'hover' ou 'focus.
  },

  notificationDot: {
    position: 'absolute', // absolute
    top: 2, // top-2 (8px, ajustado para posicionamento)
    right: 2, // right-2 (8px, ajustado para posicionamento)
    width: 10, // w-2.5 (10px)
    height: 10, // h-2.5 (10px)
    backgroundColor: '#EF4444', // bg-red-500
    borderRadius: 5, // rounded-full (metade)
    borderWidth: 2, // border-2
    borderColor: '#059669', // border-emerald-600
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28, // Redondo
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  
  profilePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28, // Redondo
    backgroundColor: '#9CA3AF', // Um cinza médio (estilo placeholder padrão)
    justifyContent: 'center', // Centraliza o boneco
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  // Aquele ícone pequeno de câmera no cantinho (opcional, mas ajuda o usuário a saber que pode clicar)
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary, // Ou uma cor escura
    borderRadius: 10,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
    elevation: 2
  },
});