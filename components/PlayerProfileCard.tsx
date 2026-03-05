import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
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
      textStyle={{ color: colors.primary }}
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
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    elevation: 4,
    backgroundColor: colors.surface,
    shadowColor: shadows.md.shadowColor,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
    gap: spacing.xs,
  },

  chip: {
    borderColor: colors.primary,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },

  teamImage: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    marginRight: spacing.xs,
  },
});
