import { NativeBaseProvider, StatusBar } from 'native-base'
import { TEMAS } from '../estilos/temas';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
    return (
        <NativeBaseProvider theme={TEMAS}>
            <StatusBar backgroundColor={TEMAS.colors.verde} />
            <Stack screenOptions={{ headerShown: false }} />
        </NativeBaseProvider>
    );
}
