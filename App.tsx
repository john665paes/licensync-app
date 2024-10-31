import React from 'react';
import { NativeBaseProvider, StatusBar } from 'native-base'
import { TEMAS } from './src/estilos/temas'
import Cadastro from './src/app/admin/cadastro';
import Login from './src/app/(login)';
//import IndexADM from './src/app/indexADM';
export default function App() {
  return (
    <NativeBaseProvider theme={TEMAS}>
      <StatusBar backgroundColor={TEMAS.colors.verde} />
      <Cadastro />
      {/* <IndexADM/> */}
      {/*<Login/> */}

    </NativeBaseProvider>
  );
}