import { Button, IButtonProps} from "native-base"
import React from "react"
import { ReactNode } from "react"

interface BotoesProps extends IButtonProps{
    onPress(): void
    children: ReactNode
}
export function Botoes({children, onPress, ...rest}: BotoesProps){
    return(
        <Button
            onPress={onPress}
            size='lg' 
            width="100%"
            height={50}
            bgColor={'verde'}
            borderRadius='lg'
            mt={5} 
            {...rest}> 
          {children}
        </Button>
    )
};