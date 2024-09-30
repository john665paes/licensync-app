import React from 'react';
import Login from './src/screens/login/login';
import {NativeBaseProvider, StatusBar} from 'native-base'
import {TEMAS} from './src/estilos/temas'
export default function App() {
  return (
  <NativeBaseProvider theme={TEMAS}>
    <StatusBar backgroundColor={TEMAS.colors.verde} />
    <Login/>

  </NativeBaseProvider>
  );
}