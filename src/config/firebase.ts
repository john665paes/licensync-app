import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_apiKey,
  authDomain: process.env.EXPO_PUBLIC_authDomain,
  projectId: process.env.EXPO_PUBLIC_projectId,
  storageBucket: process.env.EXPO_PUBLIC_storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_messagingSenderId,
  appId: process.env.EXPO_PUBLIC_appId,
  measurementId: process.env.EXPO_PUBLIC_measurementId
};

let app;
let auth: any;

// Verifica se o app já foi inicializado (Evita crash no Expo Go)
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  // A MÁGICA: Decide como fazer o login dependendo de onde o app tá rodando
  if (Platform.OS === 'web') {
    auth = getAuth(app); // Se for navegador, usa o padrão da web
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) // Se for celular, usa o AsyncStorage
    });
  }
} else {
  // Se já existir (porque salvou o arquivo), reaproveita a conexão
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };