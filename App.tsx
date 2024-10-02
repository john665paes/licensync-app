import React from 'react';
import {NativeBaseProvider, StatusBar} from 'native-base'
import {TEMAS} from './src/estilos/temas'
import Cadastro from './src/screens/cadastro/cadastro';
import Login from './src/screens/login/login';
import IndexADM from './src/screens/indexADM/indexadm';
export default function App() {
  return (
  <NativeBaseProvider theme={TEMAS}>
    <StatusBar backgroundColor={TEMAS.colors.verde} />
    <Cadastro/>
    {/* <IndexADM/> */}
    {/* <Login/> */}

  </NativeBaseProvider>
  );
}