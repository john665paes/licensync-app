import { FormControl, IFormControlProps, Input} from "native-base"
import React from "react"
import { ReactNode } from "react"

interface InputformProps extends IFormControlProps{
    placeholder?: string
    children?: ReactNode
    onChangeText(texto: string): void
}
export function Inputform({children, ...rest}: InputformProps){
    return(
        <FormControl marginTop={3}>
          <FormControl.Label></FormControl.Label>
          <Input 
            textAlign={'center'}
            placeholder="" 
            size='lg' 
            width="100%"
            borderRadius='lg'
            borderColor={'verde'}
            borderWidth={3}
            bgColor={'branco'}
            shadow={5}
            {...rest}/> 
            {children}
        </FormControl>
      
    )
};