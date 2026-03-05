import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import type { ReactNode } from "react";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Chip, Text } from "react-native-paper";

type PlayerProfileProps = {
  name: string;
  age: number;
  country: string;
  currentClub?: string;
  avatarUrl?: string;
};

export default function CoachProfileCard({
  name,
  age,
  country,
  currentClub,
  avatarUrl,
}: PlayerProfileProps) {
  const renderChip = (
    icon: string,
    label: string,
    key?: string | number,
  ): ReactNode => (
    <Chip
      key={key || label}
      style={styles.chip}
      textStyle={{ color: colors.textOnPrimary }}
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
          </View>
        </View>

        <View style={styles.chipContainer}>
          {renderChip("tag", `Edad: ${age} años`)}
          {renderChip("flag", `País: ${country}`)}
          {renderChip("flag", `Club: ${currentClub}`)}
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
});
