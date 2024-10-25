import { FormControl, Input} from "native-base"
import React from "react"
import { ReactNode } from "react"

interface InputformProps {
    placeholder?: string;
    label?: string;
    secureTextEntry?: boolean;
    children?: ReactNode
    onChangeText(texto: string): void;
}

export function InputTexto({
    label,
    placeholder,
    secureTextEntry = false
    } : InputformProps ) : JSX.Element{

    return(
        <FormControl marginTop={3}>
          {label &&<FormControl.Label>{label}</FormControl.Label>}
          <Input 
            textAlign={'center'}
            label=""
            placeholder={placeholder}
            size='lg' 
            borderRadius='lg'
            borderColor={'verde'}
            borderWidth={3}
            bgColor={'branco'}
            shadow={5}
            /> 
           
        </FormControl>
      
    )
};