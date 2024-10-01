import { Button, IButtonProps} from "native-base"
import React from "react"
import { ReactNode } from "react"

interface BotoesProps extends IButtonProps{
    children: ReactNode
}
export function Botoes({children, ...rest}: BotoesProps){
    return(
        <Button
      width="100%"
      bgColor={'verde'}
      borderRadius='lg'
      borderBottomLeftRadius={80}
      borderLeftRadius={48}
      borderRightRadius={50}
      mt={5} 
      {...rest}> 
        {children}
      </Button>
    )
};