import { colors } from "@/theme/colors";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Avatar, List, Text, useTheme } from "react-native-paper";
import type { TopPlayerTeamStatsListProps } from "../types";
import pluralize from "../utils/Pluralize";

export default function TopPlayerTeamStatsList({
  playerStatTitle,
  statTitle,
  players,
}: TopPlayerTeamStatsListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const theme = useTheme();

  const sortedPlayers = [...players].sort(
    (a, b) => b.totalStats - a.totalStats,
  );

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text
        variant="titleMedium"
        style={{ marginBottom: 12, fontWeight: "bold", color: "#1DB954" }}
      >
        {playerStatTitle}
      </Text>

      <ScrollView
        style={{ maxHeight: 350 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
      >
        {sortedPlayers.slice(1).map((player) => {
          const isExpanded = expandedId === player.id;
          return (
            <List.Accordion
              key={player.id}
              title={player.name}
              description={`${player.totalStats} ${pluralize(
                player.totalStats > 1 ? 2 : 1,
                statTitle,
              )} en ${player.matches} ${pluralize(
                player.matches > 1 ? 2 : 1,
                "partido",
              )}`}
              expanded={isExpanded}
              onPress={() => handleToggle(player.id)}
              titleStyle={{
                fontWeight: "bold",
                color: isExpanded ? colors.textOnPrimary : colors.text,
              }}
              descriptionStyle={{
                color: isExpanded ? colors.text : colors.textSecondary,
              }}
              style={{
                backgroundColor: isExpanded ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: 12,
                padding: 4,
              }}
              left={() => (
                <Avatar.Image
                  source={
                    player.photoUrl
                      ? { uri: player.photoUrl }
                      : require("../assets/field.jpg")
                  }
                  size={40}
                />
              )}
            >
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                {Object.entries(player.competitionStats).map(
                  ([competition, goals]) => (
                    <View
                      key={competition}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: isExpanded
                            ? colors.textOnPrimary
                            : colors.text,
                        }}
                      >
                        {competition}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color:
                            goals >= 5
                              ? colors.error
                              : isExpanded
                                ? colors.textOnPrimary
                                : colors.success,
                        }}
                      >
                        {goals} {pluralize(goals > 1 ? 2 : 1, statTitle)}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </List.Accordion>
          );
        })}
      </ScrollView>
    </View>
  );
}
