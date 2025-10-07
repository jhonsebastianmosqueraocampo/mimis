// Stats.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import { Avatar, Button, Card, Chip, Text, useTheme } from "react-native-paper";
import PrivateLayout from "./privateLayout";

type TeamSummary = {
  id: string;
  name: string;
  logoUrl: string;
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  recentForm: string[];
  topPlayer: {
    name: string;
    photo: string;
    goals: number;
    assists: number;
  };
  nextMatch: {
    opponent: string;
    date: string;
    home: boolean;
  };
  seasonProgress: Array<{ matchday: number; points: number; position: number }>;
};

const dummyTeams: TeamSummary[] = [
  {
    id: "1",
    name: "FC Barcelona",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    position: 2,
    points: 78,
    played: 35,
    wins: 24,
    draws: 6,
    losses: 5,
    goalsFor: 72,
    goalsAgainst: 34,
    recentForm: ["W", "W", "L", "D", "W"],
    topPlayer: {
      name: "Lewandowski",
      photo:
        "https://img.a.transfermarkt.technology/portrait/big/38253-1694790513.jpg?lm=1",
      goals: 23,
      assists: 6,
    },
    nextMatch: {
      opponent: "Real Betis",
      date: "2025-06-12",
      home: true,
    },
    seasonProgress: Array.from({ length: 35 }, (_, i) => ({
      matchday: i + 1,
      points: 2 * (i + 1),
      position: Math.max(1, Math.ceil(5 - Math.sin(i / 5) * 3)),
    })),
  },
  {
    id: "2",
    name: "Liverpool FC",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    position: 3,
    points: 74,
    played: 36,
    wins: 22,
    draws: 8,
    losses: 6,
    goalsFor: 69,
    goalsAgainst: 40,
    recentForm: ["D", "W", "W", "L", "W"],
    topPlayer: {
      name: "Mohamed Salah",
      photo:
        "https://img.a.transfermarkt.technology/portrait/big/148455-1706203637.jpg?lm=1",
      goals: 19,
      assists: 10,
    },
    nextMatch: {
      opponent: "Manchester City",
      date: "2025-06-15",
      home: false,
    },
    seasonProgress: Array.from({ length: 35 }, (_, i) => ({
      matchday: i + 1,
      points: 2 * (i + 1),
      position: Math.max(1, Math.ceil(5 - Math.sin(i / 5) * 3)),
    })),
  },
];

const FormChip = ({ result }: { result: string }) => {
  const color = result === "W" ? "green" : result === "D" ? "orange" : "red";
  return (
    <Chip
      style={{ marginRight: 4, backgroundColor: color }}
      textStyle={{ color: "white" }}
    >
      {result}
    </Chip>
  );
};

export default function Stats() {
  const theme = useTheme();

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {dummyTeams.map((team) => {
          const pointsData = team.seasonProgress.map((d, i) => ({
            x: i,
            y: d.points,
          }));

          return (
            <Card key={team.id} style={{ marginBottom: 16 }}>
              <Card.Content>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Avatar.Image size={48} source={{ uri: team.logoUrl }} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="titleMedium">{team.name}</Text>
                    <Text variant="bodySmall" style={{ color: "#222222" }}>
                      Posición #{team.position} · {team.points} pts
                    </Text>
                  </View>
                  <Chip icon="trophy" mode="outlined">
                    #{team.position}
                  </Chip>
                </View>

                {/* Estadísticas */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>PJ: {team.played}</Text>
                  <Text>G: {team.wins}</Text>
                  <Text>E: {team.draws}</Text>
                  <Text>P: {team.losses}</Text>
                  <Text>GF: {team.goalsFor}</Text>
                  <Text>GC: {team.goalsAgainst}</Text>
                </View>

                {/* Racha */}
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  Últimos partidos:
                </Text>
                <View style={{ flexDirection: "row", marginBottom: 8 }}>
                  {team.recentForm.map((r, i) => (
                    <FormChip key={i} result={r} />
                  ))}
                </View>

                {/* Jugador destacado */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Avatar.Image
                    size={40}
                    source={{ uri: team.topPlayer.photo }}
                  />
                  <View style={{ marginLeft: 8 }}>
                    <Text>{team.topPlayer.name}</Text>
                    <Text variant="bodySmall" style={{ color: "#222222" }}>
                      {team.topPlayer.goals} G / {team.topPlayer.assists} A
                    </Text>
                  </View>
                  <Chip
                    icon="trending-up"
                    mode="outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    Jugador Clave
                  </Chip>
                </View>

                {/* Próximo partido */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 8,
                  }}
                >
                  <Text>
                    📅 Próximo partido vs {team.nextMatch.opponent} (
                    {team.nextMatch.home ? "Local" : "Visita"}) –{" "}
                    {new Date(team.nextMatch.date).toLocaleDateString()}
                  </Text>
                </View>

                {/* Botones */}
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Button mode="outlined" style={{ marginRight: 8 }} compact>
                    Ver equipo
                  </Button>
                  <Button mode="contained" icon="soccer" compact>
                    Estadísticas
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </PrivateLayout>
  );
}
