import React from 'react';
import {NativeBaseProvider, StatusBar} from 'native-base'
import {TEMAS} from './src/estilos/temas'
import Cadastro from './src/screens/cadastro/cadastro';
import Login from './src/screens/login/login';
export default function App() {
  return (
  <NativeBaseProvider theme={TEMAS}>
    <StatusBar backgroundColor={TEMAS.colors.verde} />
    <Cadastro/>
    {/* <Login/> */}

  </NativeBaseProvider>
  );
}