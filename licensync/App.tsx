import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Loginscreen} from './src/screens/login/';

export default function App() {
  return (<Loginscreen/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
