import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const HermesCard: React.FC<Props> = ({ title, subtitle, children }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, backgroundColor: "#1A1D23", borderRadius: 8 },
  title: { color: "#E8EAED", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "#9AA0A6", fontSize: 14, marginTop: 4 },
});
