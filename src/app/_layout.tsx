import { StatusBar, SafeAreaView,   StyleSheet } from 'react-native';
import { theme} from '../estilos/themes';
import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <SafeAreaView style={Style.safeArea}>
            <StatusBar backgroundColor={theme.colors.primary} />
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
    );
}

const Style = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});