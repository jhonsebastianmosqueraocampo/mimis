import { useFetch } from "@/hooks/FetchContext";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, TextInput } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function SyntheticMatchRegister() {
  const { saveSyntheticMatches } = useFetch();
  const [mimisGoals, setMimisGoals] = useState("");
  const [opponentGoals, setOpponentGoals] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const score = `${mimisGoals} - ${opponentGoals}`;

    try {
      setLoading(true);
      const { success, message } = await saveSyntheticMatches(score);

      if (success) {
        Alert.alert("✅ Partido guardado", "El resultado fue registrado con éxito.");
        setMimisGoals("");
        setOpponentGoals("");
      } else {
        Alert.alert("❌ Error", message || "No se pudo guardar el partido.");
      }
    } catch (err) {
      console.error("❌ Error al guardar el partido:", err);
      Alert.alert("❌ Error", "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Registrar partido de sintética" />
          <Card.Content>
            <View style={styles.scoreRow}>
              <TextInput
                label="Mimis"
                value={mimisGoals}
                onChangeText={setMimisGoals}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.scoreInput]}
                placeholder="0"
              />
              <TextInput
                label="Rival"
                value={opponentGoals}
                onChangeText={setOpponentGoals}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.scoreInput]}
                placeholder="0"
              />
            </View>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.btn}
              disabled={!mimisGoals || !opponentGoals || loading}
              loading={loading}
            >
              Guardar partido
            </Button>
          </Card.Content>
        </Card>
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    padding: 8,
  },
  input: {
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreInput: {
    flex: 1,
    marginRight: 6,
  },
  btn: {
    marginTop: 16,
    backgroundColor: "#1DB954",
  },
});