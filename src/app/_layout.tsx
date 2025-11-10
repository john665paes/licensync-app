import { NativeBaseProvider, StatusBar, theme } from 'native-base'
import { TEMAS } from '../estilos/temas';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
    return (
        <NativeBaseProvider theme={theme}>
            <StatusBar backgroundColor={TEMAS.colors.verde} />
            <Stack screenOptions={{ headerShown: false }} />
        </NativeBaseProvider>
    );
}
