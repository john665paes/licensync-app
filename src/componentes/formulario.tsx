import { TextInputProps } from 'react-native';
import { FormControl, Input, theme } from "native-base";
import React from "react";
import { TEMAS } from '../estilos/temas';

interface InputformProps extends TextInputProps {
    label: string;
    placeholder: string;
    onBlur?: (e: any) => void;
    secureTextEntry?: boolean;
    onChangeText?: (text: string) => void;
    mt?: string;
    bgcolor?: string;
    width?: string;
    isReadOnly: boolean
}

export function InputTexto({
    label,
    placeholder,
    onBlur,
    onChangeText,
    secureTextEntry,
    width,
    ...props
}: InputformProps): JSX.Element {

    return (
        <FormControl marginTop={3}>
            {label && <FormControl.Label>{label}</FormControl.Label>}
            <Input
                textAlign={'center'}
                placeholder={placeholder}
                size='lg'
                mt={'0.5'}
                borderRadius='lg'
                borderColor={TEMAS.colors.verde}
                borderWidth={3}
                width={width}
                bgColor={TEMAS.colors.branco}
                shadow={5}
                onBlur={onBlur}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                {...props}
            />
        </FormControl>
    )
};