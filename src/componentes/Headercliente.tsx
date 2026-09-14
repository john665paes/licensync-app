import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '../estilos/themes';

export default function UserProfileHeader({ 
  userName, 
  userImage, 
  onImagePress, 
  onLogoutPress, // Mantemos o nome para não quebrar outras telas, mas agora ele serve como "Ação do Botão Direito"
  isCliente,
  nomeContato,
  empresa,
  telefone,
  onPhonePress,
  hideCamera,
  isVoltar,        // <--- MUDA O ÍCONE (Sair -> Seta Voltar)
  tituloCustom,    // <--- SUBSTITUI A SAUDAÇÃO (Ex: "Condicionante:")
  subtituloCustom  // <--- SUBSTITUI A EMPRESA (Ex: Nome da condicionante)
}: any) {

  const getSaudacao = () => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) return 'Bom dia';
    if (horaAtual < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  const saudacao = getSaudacao();
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

            {!hideCamera && !isCliente && (
              <View style={styles.editIconContainer}>
                <Feather name="camera" size={10} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          {isCliente ? (
            <View style={styles.profileTextContainer}>
              
              {/* --- MÁGICA DOS TEXTOS AQUI --- */}
              {tituloCustom ? (
                <Text style={styles.greetingText}>{tituloCustom}</Text>
              ) : (
                <Text style={styles.greetingText}>
                  {saudacao}, <Text style={{fontWeight: 'bold'}}>{primeiroNome}</Text>!
                </Text>
              )}
              
              <Text style={styles.companyName} numberOfLines={1}>
                {subtituloCustom ? subtituloCustom : (empresa || "Minha Empresa")}
              </Text>
              
              {/* Oculta o telefone se estiver na tela de detalhes (quando tiver tituloCustom) */}
              {!tituloCustom && telefone ? (
                <TouchableOpacity onPress={onPhonePress} style={styles.phoneButton}>
                  <Feather name="phone" size={12} color="#D1FAE5" />
                  <Text style={styles.linkText}>{telefone}</Text>
                </TouchableOpacity>
              ) : null}

            </View>
          ) : (
            <View>
              <Text style={styles.greetingText}>{saudacao}!</Text>
              <Text style={styles.userName}>{userName || "Carregando..."}</Text>
            </View>
          )}
        </View>

        {/* Lado Direito: Seta de Voltar ou Botão de Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress} activeOpacity={0.8}>
          <Feather name={isVoltar ? "arrow-left" : "log-out"} size={24} color="#fdfdfd" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: theme.colors.primary, padding: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  contentContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  profileImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#FFFFFF' },
  profilePlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, borderRadius: 10, padding: 4, borderWidth: 1.5, borderColor: '#FFF', elevation: 2 },
  greetingText: { fontSize: 13, color: '#D1FAE5', marginBottom: 2 },
  userName: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  profileTextContainer: { flex: 1, justifyContent: 'center' },
  companyName: { fontSize: 18, fontWeight: "bold", color: '#FFFFFF', marginBottom: 2 },
  phoneButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { color: '#D1FAE5', fontWeight: '600', fontSize: 13 },
  logoutButton: { padding: 8, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
});