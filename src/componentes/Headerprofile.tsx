import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '../estilos/themes';


export default function UserProfileHeader({ userName }) {


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
        
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }} // Imagem placeholder
            style={styles.profileImage}
          />

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

// Definição dos estilos usando StyleSheet
const styles = StyleSheet.create({
  // Equivalente a 'bg-emerald-600 p-4 text-white shadow-md rounded-b-lg'
  header: {
    backgroundColor: theme.colors.primary, // Cor 'emerald-600' aproximada
    padding: 16, // p-4 (16px)
    // O shadow no React Native é diferente; esta é a sombra Android (elevation) e iOS (shadow...)
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Equivalente a 'flex items-center justify-between max-w-6xl mx-auto'
  contentContainer: {
    flexDirection: 'row', // flex
    alignItems: 'center', // items-center
    justifyContent: 'space-between', // justify-between
    // max-w-6xl e mx-auto não são diretamente necessários no RN, 
    // pois o layout é nativamente de largura total, mas centralizamos o conteúdo
  },

  // Equivalente a 'flex items-center space-x-4'
  leftContent: {
    flexDirection: 'row', // flex
    alignItems: 'center', // items-center
    gap: 16, // space-x-4 (gap para React Native 0.71+)
  },

  // Equivalente a 'w-14 h-14 rounded-full border-2 border-white shadow-sm'
  profileImage: {
    width: 56, // w-14 (56px)
    height: 56, // h-14 (56px)
    borderRadius: 28, // rounded-full (metade da largura/altura)
    borderWidth: 2, // border-2
    borderColor: '#FFFFFF', // border-white
  },

  // Equivalente a 'text-sm text-emerald-100'
  greetingText: {
    fontSize: 14, // text-sm
    color: '#D1FAE5', // Cor 'emerald-100' aproximada
  },

  // Equivalente a 'text-xl font-semibold'
  userName: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: '#FFFFFF', // text-white (Herdado, mas garantido)
  },

  // Equivalente a 'relative p-2 rounded-full hover:bg-emerald-500 focus...'
  notificationButton: {
    padding: 8, // p-2 (8px)
    borderRadius: 16, // rounded-full (para um botão de 24+8+8 = 40px)
    // No RN, não há 'hover' ou 'focus' automáticos; a TouchableOpacity lida com o feedback.
  },

  // Equivalente a 'absolute top-2 right-2 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-emerald-600'
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
});