import React, { ReactNode } from "react";
import { 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    TouchableOpacityProps, 
    DimensionValue 
} from "react-native";
import { TEMAS } from "../estilos/temas";

interface BotoesProps extends TouchableOpacityProps {
    children: ReactNode;
    // Props opcionais para manter compatibilidade com o jeito que você usava no NativeBase
    width?: DimensionValue;
    height?: number | string;
    bgColor?: string;
    mt?: number;
    readOnly?: boolean; // Mapeia para disabled
}

export function Botoes({ 
    children, 
    style, 
    width = 150, 
    height = 50,
    bgColor = TEMAS.colors.verde,
    mt = 20, // Equivalente ao mt={5} do NativeBase (5 * 4px)
    readOnly,
    ...rest 
}: BotoesProps) {

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    width: width,
                    height: typeof height === 'string' ? parseInt(height) : height,
                    backgroundColor: bgColor,
                    marginTop: mt,
                    opacity: readOnly || rest.disabled ? 0.6 : 1 // Efeito visual de desabilitado
                },
                style
            ]}
            disabled={readOnly || rest.disabled}
            activeOpacity={0.7}
            {...rest}
        >
            {/* Se o filho for texto, aplica estilo padrão. Se for ícone/outro, renderiza direto */}
            {typeof children === 'string' ? (
                <Text style={styles.text}>{children}</Text>
            ) : (
                children
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignSelf: 'center',
        justifyContent: 'center', // Centraliza verticalmente
        alignItems: 'center',     // Centraliza horizontalmente
        borderRadius: 8,          // Equivalente ao 'lg'
        
        // Sombra leve para ficar bonito
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    text: {
        color: '#FFFFFF', // Texto branco padrão do botão
        fontSize: 16,     // Tamanho 'lg' aproximado
        fontWeight: 'bold',
    }
});