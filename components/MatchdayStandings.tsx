// MatchdayStandings.tsx
import React, { useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { Card, Chip, Divider, Text, useTheme } from "react-native-paper";

export type TeamStanding = {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type Matchday = {
  id: number;
  label: string;
  standings: TeamStanding[];
};

type MatchdayTableProps = {
  matchdays: Matchday[];
  currentTeamName: string;
};

export default function MatchdayStandings({ matchdays, currentTeamName }: MatchdayTableProps) {
  const [selectedMatchday, setSelectedMatchday] = useState<Matchday>(matchdays[0]);
  const theme = useTheme();

  return (
    <View style={{ padding: 12 }}>
      <Text variant="titleMedium" style={{ marginBottom: 12 }}>
        Tabla de posiciones por jornada
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {matchdays.map((day) => (
            <Chip
              key={day.id}
              selected={day.id === selectedMatchday.id}
              onPress={() => setSelectedMatchday(day)}
              style={{
                marginRight: 8,
                backgroundColor: day.id === selectedMatchday.id ? "#1DB954" : undefined,
              }}
              textStyle={{
                color: day.id === selectedMatchday.id ? "#fff" : theme.colors.onSurface,
              }}
            >
              {day.label}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <Card>
        <FlatList
          data={selectedMatchday.standings}
          keyExtractor={(item) => item.teamName}
          ListHeaderComponent={() => (
            <View style={{ flexDirection: "row", padding: 8, backgroundColor: '#f5f5f5' }}>
              {["#", "Equipo", "PJ", "G", "E", "P", "GF", "GC", "Pts"].map((col, i) => (
                <Text key={i} style={{ flex: col === "Equipo" ? 2 : 1, fontWeight: "bold", textAlign: "center" }}>{col}</Text>
              ))}
            </View>
          )}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item, index }) => (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: item.teamName === currentTeamName ? "#1DB95422" : "transparent",
                padding: 8,
              }}
            >
              <Text style={{ flex: 1, textAlign: "center" }}>{index + 1}</Text>
              <Text style={{ flex: 2, fontWeight: "bold" }}>{item.teamName}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{item.played}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{item.won}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{item.drawn}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{item.lost}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{item.goalsFor}</Text>
              <Text style={{ flex: 1, textAlign: "center" }}>{item.goalsAgainst}</Text>
              <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>{item.points}</Text>
            </View>
          )}
        />
      </Card>
    </View>
  );
}