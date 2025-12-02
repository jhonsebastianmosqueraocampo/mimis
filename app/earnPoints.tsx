import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function EarnPoints() {
  const [points, setPoints] = useState<number>(120);

  const handleStart = () => {
    console.log("Iniciar actividades para ganar puntos");
  };

  const handleRedeem = () => {
    console.log("Redimir puntos");
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Text style={styles.title}>🎯 Gana puntos</Text>
        <Text style={styles.subtitle}>
          Participa en actividades, retos o encuestas para acumular puntos y
          canjéalos por recompensas exclusivas.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.pointsLabel}>Tus puntos actuales</Text>
          <Text style={styles.pointsValue}>{points}</Text>
        </Card>

        <Button
          mode="contained"
          onPress={handleStart}
          style={styles.buttonPrimary}
          labelStyle={{ fontSize: 16 }}
        >
          Iniciar y ganar puntos
        </Button>

        <View style={styles.redeemSection}>
          <Text style={styles.redeemText}>
            💡 Puedes redimir tus puntos por beneficios, premios o descuentos
            cuando alcances los mínimos requeridos.
          </Text>

          <Button
            mode="outlined"
            onPress={handleRedeem}
            style={styles.buttonSecondary}
            labelStyle={{ fontSize: 16 }}
          >
            Redimir puntos
          </Button>
        </View>
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1DB954",
  },
  buttonPrimary: {
    backgroundColor: "#1DB954",
    marginBottom: 24,
    borderRadius: 8,
    paddingVertical: 4,
  },
  redeemSection: {
    alignItems: "center",
  },
  redeemText: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 18,
  },
  buttonSecondary: {
    borderColor: "#1DB954",
    borderRadius: 8,
  },
});