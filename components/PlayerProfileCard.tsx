import type { ReactNode } from "react";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Chip, Text } from "react-native-paper";

type PlayerProfileProps = {
  name: string;
  age: number;
  birthday: string;
  country: string;
  position: string;
  height: string; // cm
  weight: string; // kg
  jerseyNumber?: string;
  currentClub?: string;
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
  currentClub,
  dominantFoot,
  marketValue,
  avatarUrl,
}: PlayerProfileProps) {
  const renderChip = (
    icon: string,
    label: string,
    key?: string | number
  ): ReactNode => (
    <Chip
      key={key || label}
      style={styles.chip}
      textStyle={{ color: "#1DB954" }}
      mode="outlined"
    >
      {label}
    </Chip>
  );

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Avatar.Image
            source={{ uri: avatarUrl || "https://picsum.photos/200" }}
            size={80}
          />
          <View style={{ marginLeft: 12 }}>
            <Text variant="titleLarge" style={styles.name}>
              {name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {currentClub
                ? `${currentClub} • #${jerseyNumber ?? "-"}`
                : `#${jerseyNumber ?? "-"}`}
            </Text>
          </View>
        </View>

        <View style={styles.chipContainer}>
          {renderChip("tag", `Edad: ${age} años`)}
          {renderChip("calendar-today", `Nacimiento: ${birthday}`)}
          {renderChip("flag", `País: ${country}`)}
          {renderChip("sports-soccer", `Posición: ${position}`)}
          {renderChip("height", `Altura: ${height}`)}
          {renderChip("fitness-center", `Peso: ${weight}`)}
          {dominantFoot &&
            renderChip("directions-run", `Pierna: ${dominantFoot}`)}
          {marketValue &&
            renderChip("monetization-on", `Valor mercado: ${marketValue}`)}
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
});