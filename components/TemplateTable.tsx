import React from "react";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar, Card, Divider, Text, useTheme } from "react-native-paper";

export type TournamentStats = {
  [tournament: string]: number;
};

export type TemplateStats = {
  id: number;
  name: string;
  position: string;
  totalMatches: number;
  matchesByTournament: TournamentStats;
  totalGoals: number;
  goalsByTournament: TournamentStats;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  starts: number;
  starterMatchesByTournament: TournamentStats;
};

type TeamStatsTableProps = {
  template: TemplateStats[];
};

export default function TemplateTable({ template }: TeamStatsTableProps) {
  const theme = useTheme();

  const allTournaments = Array.from(
    new Set(
      template.flatMap((p) =>
        Object.keys({
          ...p.matchesByTournament,
          ...p.goalsByTournament,
          ...p.starterMatchesByTournament,
        })
      )
    )
  );

  return (
    <ScrollView horizontal>
      <View style={{ padding: 12 }}>
        <FlatList
          data={template}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => console.log(`Jugador ID: ${item.id}`)}>
              <Card style={{ marginBottom: 8 }}>
                <Card.Title
                  title={item.name}
                  subtitle={`Posición: ${item.position}`}
                  left={() => (
                    <Avatar.Icon icon="soccer" size={40} style={{ backgroundColor: theme.colors.primary }} />
                  )}
                />
                <Card.Content>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>PJ:</Text>
                    <Text>{item.totalMatches}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>Goles:</Text>
                    <Text>{item.totalGoals}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>Minutos:</Text>
                    <Text>{item.minutesPlayed}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>Titular:</Text>
                    <Text>{item.starts}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>🟨 Amarillas:</Text>
                    <Text>{item.yellowCards}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>🟥 Rojas:</Text>
                    <Text>{item.redCards}</Text>
                  </View>

                  {/* Estadísticas por torneo */}
                  {allTournaments.map((tournament) => (
                    <View key={tournament} style={{ marginTop: 6 }}>
                      <Text style={{ fontWeight: "bold" }}>{tournament}</Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text>PJ:</Text>
                        <Text>{item.matchesByTournament[tournament] || 0}</Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text>G:</Text>
                        <Text>{item.goalsByTournament[tournament] || 0}</Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text>Titular:</Text>
                        <Text>{item.starterMatchesByTournament[tournament] || 0}</Text>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}