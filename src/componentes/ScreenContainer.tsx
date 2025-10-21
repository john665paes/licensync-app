import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../estilos/temas";

export function ScreenContainer({ topContent, bottomContent }) {
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>{topContent}</View>
      <View style={styles.bottomContainer}>{bottomContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  bottomContainer: {
    flex: 2,
    backgroundColor: theme.colors.grayBackground,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
});
