import React from "react";
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TextInputProps, 
    DimensionValue 
} from 'react-native';
import { TEMAS } from "../estilos/temas";   

interface InputformProps extends TextInputProps {
    label?: string;
    mt?: number | string;
    bgcolor?: string;
    width?: DimensionValue;
    height?: number | string;
    isReadOnly?: boolean;
}

export function InputTexto({
    label,
    placeholder,
    onBlur,
    onChangeText,
    secureTextEntry,
    width = '100%',
    height = 50, // Altura padrão para simular o size='lg'
    mt = 12, // Margem padrão (equivalente ao marginTop={3} do NB)
    bgcolor = TEMAS.colors.branco,
    isReadOnly,
    style,
    ...props
}: InputformProps): JSX.Element {

    // Tratamento para margem superior
    const marginTop = typeof mt === 'string' ? parseInt(mt, 10) : mt;

    return (
        <View style={[styles.container, { width, marginTop }]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <TextInput
                style={[
                    styles.input,
                    { 
                        height: typeof height === 'string' ? parseInt(height) : height,
                        backgroundColor: bgcolor,
                        borderColor: TEMAS.colors.verde,
                    },
                    style
                ]}
                placeholder={placeholder}
                placeholderTextColor="#A0A0A0"
                onBlur={onBlur}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                textAlign="center"
                editable={!isReadOnly} // isReadOnly agora funciona de verdade
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
        marginLeft: 4,
    },
    input: {
        borderWidth: 3, // Mantive a borda grossa do seu original
        borderRadius: 8, // Aproximadamente o 'lg'
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
        
        // Sombra (Shadow 5 do NativeBase simulação)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});