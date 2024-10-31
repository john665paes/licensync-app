import { Text, ITextProps} from "native-base"
import React from "react"
import { ReactNode } from "react"
import { TEMAS } from "../estilos/temas"

interface TituloProps extends ITextProps{
    children: ReactNode
}
export function Titulo({children, ...rest}: TituloProps){
    return(
        <Text fontSize="2xl"
        fontWeight="bold"
        color={TEMAS.colors.verde}
        textAlign="center"
        mt={5}
        {...rest}
        > 
        {children}
      </Text>
    )
};