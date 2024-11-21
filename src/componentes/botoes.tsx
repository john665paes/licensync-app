import { Button, IButtonProps} from "native-base"
import React from "react"
import { ReactNode } from "react"
import { TEMAS } from "../estilos/temas"

interface BotoesProps extends IButtonProps{
    onPress(): void
    children: ReactNode
    readOnly?: boolean
}
export function Botoes({children, onPress, ...rest}: BotoesProps){
    return(
        <Button
            onPress={onPress}
            alignSelf={'center'}
            size='lg' 
            width={'150'}
            height={50}
            bgColor={TEMAS.colors.verde}
            borderRadius='lg'
            mt={5} 
            {...rest}> 
          {children}
        </Button>
    )
};