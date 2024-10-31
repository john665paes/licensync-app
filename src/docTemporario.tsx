import React from 'react';
import { FormControl, Input } from 'native-base';
import { TEMAS } from './estilos/temas';

const FormComponent = () => {
  return (
    <React.Fragment>
      <FormControl marginTop={3}>
        <FormControl.Label></FormControl.Label>
        <Input 
          textAlign={'center'}
          placeholder="Insira seu e-mail" 
          size='lg' 
          width="100%"
          borderRadius='lg'
          borderColor={TEMAS.colors.verde}
          borderWidth={3}
          bgColor={TEMAS.colors.branco}
          shadow={5}
        />
      </FormControl>
      <FormControl marginTop={3}>
        <FormControl.Label></FormControl.Label>
        <Input 
          textAlign={'center'}
          placeholder="Insira sua senha" 
          size='lg' 
          width="100%"
          borderRadius='lg'
          borderColor={TEMAS.colors.verde}
          borderWidth={3}
          bgColor={TEMAS.colors.branco}
          shadow={5}
        />
      </FormControl>
    </React.Fragment>
  );
};

export default FormComponent;
