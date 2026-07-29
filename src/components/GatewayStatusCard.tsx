import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  status: string;
  url?: string;
}

export const GatewayStatusCard: React.FC<Props> = ({ status, url }) => (
  <View style={styles.card}>
    <Text style={styles.status}>Gateway: {status}</Text>
    {url && <Text style={styles.url}>{url}</Text>}
  </View>
);

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, backgroundColor: "#1A1D23", borderRadius: 8 },
  status: { color: "#E8EAED", fontSize: 16, fontWeight: "600" },
  url: { color: "#9AA0A6", fontSize: 12, marginTop: 4 },
});
