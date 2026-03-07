import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Card, Divider, List } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import type {
  PlayerStats,
  RootStackParamList,
  TeamPlayerStatsByLeague,
} from "../types";
import Loading from "./Loading";
import PlayersStatsTable from "./PlayersStatsTable";
import TeamSeasonAnalysis from "./TeamSeasonAnalysis";

type TeamStatsProps = {
  teamId: string;
};

export default function TeamStats({ teamId }: TeamStatsProps) {
  const { getPlayersStatsByTeam } = useFetch();

  const [stats, setStats] = useState<TeamPlayerStatsByLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    getPlayersStats();
  }, [teamId]);

  const getPlayersStats = async () => {
    setLoading(true);
    const { success, stats, message } = await getPlayersStatsByTeam(teamId);
    if (success) {
      const filteredStats = stats
        .map((league) => ({
          ...league,
          players: league.players.filter((p) =>
            p.statistics.some(
              (st) =>
                st.league.id === league.leagueId &&
                (st.games.appearences ?? 0) > 0,
            ),
          ),
        }))
        .filter((league) => league.players.length > 0);
      setStats(filteredStats);
    } else {
      setError(message!);
    }
    setLoading(false);
  };

  const allPlayers: PlayerStats[] = useMemo(() => {
    if (!stats) return [];
    return stats.flatMap((l) => l.players);
  }, [stats]);

  const topScorers = useMemo(() => {
    // Agrupar por jugador
    const playerMap = new Map<number, PlayerStats>();

    for (const p of allPlayers) {
      const id = p.player.id;
      const goals = p.statistics[0]?.goals.total || 0;

      if (!playerMap.has(id)) {
        playerMap.set(id, { ...p });
      } else {
        const existing = playerMap.get(id)!;
        const existingGoals = existing.statistics[0]?.goals.total || 0;
        // Sumar goles
        existing.statistics[0].goals.total = existingGoals + goals;
      }
    }

    // Convertir a array y ordenar
    return [...playerMap.values()]
      .sort(
        (a, b) =>
          (b.statistics[0]?.goals.total || 0) -
          (a.statistics[0]?.goals.total || 0),
      )
      .slice(0, 5);
  }, [allPlayers]);

  const topAssists = useMemo(() => {
    const playerMap = new Map<number, PlayerStats>();

    for (const p of allPlayers) {
      const id = p.player.id;
      const assists = p.statistics[0]?.goals.assists || 0;

      if (!playerMap.has(id)) {
        // Clonar objeto para no mutar el original
        playerMap.set(id, { ...p, statistics: [{ ...p.statistics[0] }] });
      } else {
        const existing = playerMap.get(id)!;
        const existingAssists = existing.statistics[0]?.goals.assists || 0;
        existing.statistics[0].goals.assists = existingAssists + assists;
      }
    }

    return [...playerMap.values()]
      .sort(
        (a, b) =>
          (b.statistics[0]?.goals.assists || 0) -
          (a.statistics[0]?.goals.assists || 0),
      )
      .slice(0, 5);
  }, [allPlayers]);

  if (loading) {
    return <Loading visible={loading} />;
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  const handleLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  const handlePlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  const year = new Date().getFullYear();

  return (
    <ScrollView>
      {/* Sección analisis de temporada */}
      <TeamSeasonAnalysis
        teamId={teamId}
        stats={stats}
        season={year.toString()}
      />

      {/* Sección de máximos */}
      <Card style={styles.card}>
        <Card.Title title="Máximo Goleador" />
        {topScorers.length > 0 && (
          <Card.Content>
            <TouchableOpacity
              style={styles.playerRow}
              onPress={() => handlePlayer(topScorers[0].player.id.toString())}
            >
              <Avatar.Image
                size={48}
                source={{ uri: topScorers[0].player.photo }}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: "bold" }}>
                  {topScorers[0].player.name}
                </Text>
                <Text>
                  Total Goles: {topScorers[0].statistics[0]?.goals.total}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Acordeón con detalle por liga */}
            <List.Accordion
              title="Ver más"
              left={(props) => <List.Icon {...props} icon="soccer" />}
            >
              {allPlayers
                .filter((p) => p.player.id === topScorers[0].player.id)
                .map((p, idx) => (
                  <List.Item
                    key={idx}
                    onPress={() =>
                      handleLeague(p.statistics[0]?.league.id.toString() ?? "")
                    }
                    title={p.statistics[0]?.league.name}
                    description={`Goles: ${p.statistics[0]?.goals.total ?? 0}`}
                    left={(props) => (
                      <Avatar.Image
                        {...props}
                        size={32}
                        source={{ uri: p.statistics[0]?.league.logo }}
                      />
                    )}
                  />
                ))}
            </List.Accordion>
          </Card.Content>
        )}
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Máximo Asistente" />
        {topAssists.length > 0 && (
          <Card.Content>
            <TouchableOpacity
              style={styles.playerRow}
              onPress={() => handlePlayer(topAssists[0].player.id.toString())}
            >
              <Avatar.Image
                size={48}
                source={{ uri: topAssists[0].player.photo }}
              />
              <View style={{ marginLeft: 10 }}>
                <Text>{topAssists[0].player.name}</Text>
                <Text>
                  Asistencias: {topAssists[0].statistics[0]?.goals.assists ?? 0}
                </Text>
              </View>
            </TouchableOpacity>
          </Card.Content>
        )}
      </Card>

      {/* Top 5 Goleadores */}
      <Card style={styles.card}>
        <Card.Title title="Top 5 Goleadores del Equipo" />
        <Card.Content>
          {topScorers.map((p, i) => (
            <View key={i} style={styles.playerRow}>
              <Text style={styles.rank}>{i + 1}</Text>
              <Avatar.Image size={40} source={{ uri: p.player.photo }} />
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => handlePlayer(p.player.id.toString())}
              >
                <Text>{p.player.name}</Text>
                <Text style={{ color: "gray" }}>
                  Goles: {p.statistics[0]?.goals.total}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={{ marginVertical: 20, alignItems: "center" }}>
        <AdBanner />
      </View>

      <Divider style={{ marginVertical: 10 }} />

      <PlayersStatsTable stats={stats} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
  innerCard: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    width: 20,
    textAlign: "center",
  },
});
