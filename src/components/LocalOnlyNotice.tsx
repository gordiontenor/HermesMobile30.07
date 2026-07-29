import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const LocalOnlyNotice: React.FC = () => (
  <View style={styles.notice}>
    <Text style={styles.text}>Running in local-only mode</Text>
  </View>
);

const styles = StyleSheet.create({
  notice: { padding: 8, backgroundColor: "#3C4043", borderRadius: 4, margin: 8 },
  text: { color: "#9AA0A6", fontSize: 12, textAlign: "center" },
});
