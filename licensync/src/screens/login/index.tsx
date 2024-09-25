import * as React from 'react';
import { View, Text, ImageBackground } from 'react-native';
export interface LoginscreenProps {
}

export function Loginscreen (props: LoginscreenProps) {
    return (<ImageBackground source={require('././src/assets/imgs/backlogin.png')}> 
    {/* style={styles.background} */}
      <View>
         <Text>Caralho, quase não pega desgraçaaa</Text>
      </View>
      </ImageBackground>
    );
}

// const styles = StyleSheet.create({
//   background: {width: '100', height: '100%'}
// });
