import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../estilos/themes';

// Não esquecer, deixar limpo para exibir apenas no topodas pags 
// sem informação, inserir info conforme a pagina
const HomeHeader: React.FC = () => {
  return (
    <View style={styles.container} backgroundColor={theme.colors.primary}>
      <Text style={styles.title}>Home Header</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 50, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600' },
});

export default HomeHeader;
