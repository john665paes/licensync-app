import { StatusBar,  LogBox, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme} from '../estilos/themes';
import { Stack } from 'expo-router';


LogBox.ignoreLogs([
  '@firebase/firestore: Firestore',
  'WebChannelConnection RPC',
]);


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