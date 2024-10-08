import { Button, IButtonProps} from "native-base"
import React from "react"
import { ReactNode } from "react"
import { Text, TouchableOpacity } from "react-native"

interface BotoesProps extends IButtonProps{
    onPress(): void
    children: ReactNode
}
export function Botoes({children, onPress, ...rest}: BotoesProps){
    return(
        <Button
            onPress={onPress}
            width="100%"
            height={50}
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