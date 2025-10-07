// CoachTeamHistory.tsx (versión React Native con react-native-paper)
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Avatar, Card, Chip, Divider, Text, useTheme } from "react-native-paper";

type SeasonStats = {
  year: string;
  matches: number;
  titles: { name: string; year: string }[];
};

export type CoachTeamHis = {
  teamName: string;
  from: number;
  to: number;
  totalTitles: number;
  seasons: SeasonStats[];
};

interface Props {
  history: CoachTeamHis[];
}

export default function CoachTeamHistory({ history }: Props) {
  const theme = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <ScrollView>
      {history.map((team, idx) => (
        <Card
          key={idx}
          style={{ marginBottom: 12, borderRadius: 12 }}
          onPress={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
        >
          <Card.Title
            title={team.teamName}
            titleVariant="titleMedium"
            subtitle={`${team.from} - ${team.to} • ${team.totalTitles} títulos`}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon="trophy"
                style={{ backgroundColor: theme.colors.secondaryContainer }}
              />
            )}
          />

          {expandedIndex === idx && (
            <Card.Content>
              {team.seasons.map((season, sIdx) => (
                <View
                  key={sIdx}
                  style={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text variant="titleSmall" style={{ marginBottom: 6 }}>
                    Temporada {season.year}
                  </Text>

                  <Chip
                    icon="account"
                    style={{
                      marginBottom: 6,
                      borderColor: theme.colors.primary,
                      borderWidth: 1,
                      backgroundColor: "white",
                    }}
                    textStyle={{ color: theme.colors.primary }}
                  >
                    {season.matches} partidos
                  </Chip>

                  {season.titles.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Divider style={{ marginVertical: 6 }} />
                      <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                        Títulos ganados:
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {season.titles.map((title, tIdx) => (
                          <Chip
                            key={tIdx}
                            icon="trophy"
                            style={{ backgroundColor: "#fff8e1", marginRight: 6, marginBottom: 6 }}
                          >
                            {`${title.name} (${title.year})`}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </Card.Content>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}