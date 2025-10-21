import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../estilos/temas";

export function PrimaryButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
});
