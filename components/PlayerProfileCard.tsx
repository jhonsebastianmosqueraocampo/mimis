import { TeamPlayer } from "@/types";
import type { ReactNode } from "react";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";

type PlayerProfileProps = {
  name: string;
  age: number;
  birthday: string;
  country: string;
  position: string;
  height: string; // cm
  weight: string; // kg
  jerseyNumber?: string;
  currentClub?: TeamPlayer;
  dominantFoot?: "Derecha" | "Izquierda" | "Ambas" | "";
  marketValue?: string;
  avatarUrl?: string;
};

export default function PlayerProfileCard({
  name,
  age,
  birthday,
  country,
  position,
  height,
  weight,
  jerseyNumber,
  dominantFoot,
  marketValue,
}: PlayerProfileProps) {
  const renderChip = (key?: string | number): ReactNode => (
    <Chip
      key={key}
      style={styles.chip}
      textStyle={{ color: "#1DB954" }}
      mode="outlined"
    >
      {key}
    </Chip>
  );

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={{ marginLeft: 12 }}>
            <Text variant="titleLarge" style={styles.name}>
              {name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {jerseyNumber && dominantFoot
                ? ` | ${jerseyNumber} - ${dominantFoot}`
                : ""}
            </Text>
          </View>
        </View>

        <View style={styles.chipContainer}>
          {renderChip(`Edad: ${age} años`)}
          {renderChip(`Nacimiento: ${birthday}`)}
          {renderChip(`País: ${country}`)}
          {renderChip(`Posición: ${position}`)}
          {renderChip(`Altura: ${height}`)}
          {renderChip(`Peso: ${weight}`)}
          {dominantFoot && renderChip(`Pierna: ${dominantFoot}`)}
          {marketValue && renderChip(`Valor mercado: ${marketValue}`)}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
    marginHorizontal: 24,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    color: "#888",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
  },
  chip: {
    borderColor: "#1DB954",
    marginRight: 8,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    paddingHorizontal: 8,
  },
  teamImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
});
