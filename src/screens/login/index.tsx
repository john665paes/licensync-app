import * as React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
export interface LoginscreenProps {
}

export function Loginscreen(props: LoginscreenProps) {
  return (
    <ImageBackground style={styles.background} source={require('../../assets/imgs/backlogin.png')}>
      <View>
        <Text style={styles.text}>Caralho, quase não pega desgraçaaa</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:
  {
    width: '100%',
    height: '100%' 
  },
  text:
  {
    textAlign: "center",
  }
});
