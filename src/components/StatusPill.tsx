import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  active?: boolean;
  color?: string;
}

export const StatusPill: React.FC<Props> = ({ label, active, color }) => (
  <View style={[styles.pill, active && styles.active, color ? { backgroundColor: color } : undefined]}>
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: "#3C4043" },
  active: { backgroundColor: "#1A73E8" },
  text: { color: "#E8EAED", fontSize: 12, fontWeight: "500" },
});
