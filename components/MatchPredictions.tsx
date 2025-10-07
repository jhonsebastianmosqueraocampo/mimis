import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import { Text as RNText, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  Divider,
  List,
  ProgressBar,
  Text,
} from "react-native-paper";
dayjs.extend(relativeTime);

import { useFetch } from "@/hooks/FetchContext";
import { PlayerFixtureStats, Prediction } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AdvancedMatchStats from "./AdvancedMatchStats";

type MatchPredictionsProps = {
  fixtureId: string;
};

export default function MatchPredictions({ fixtureId }: MatchPredictionsProps) {
  const { getFixturePrediction, getFeaturedPlayerByTeamLeague } = useFetch();
  const [predictions, setPredictions] = useState<Prediction>();
  const [featuredPlayers, setFeaturedPlayers] = useState<PlayerFixtureStats[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const getFixturePreview = async () => {
      setLoading(true);
      try {
        const { success, prediction, message } = await getFixturePrediction(
          fixtureId
        );

        if (!isMounted) return;

        if (success) {
          setPredictions(prediction!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el prediction");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const getFeaturedPlayer = async () => {
      setLoading(true);
      try {
        const {
          success,
          playerFixtureStatsHome,
          playerFixtureStatsAway,
          message,
        } = await getFeaturedPlayerByTeamLeague(fixtureId);

        if (!isMounted) return;

        if (success) {
          const players = [
            playerFixtureStatsHome,
            playerFixtureStatsAway,
          ].filter((p): p is PlayerFixtureStats => p !== null);
          setFeaturedPlayers(players);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el prediction");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (fixtureId) {
      getFixturePreview();
      getFeaturedPlayer();
    }

    return () => {
      isMounted = false;
    };
  }, [fixtureId]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const renderForm = (form: string[]) => (
    <View style={styles.formRow}>
      {form.map((result, idx) => {
        const bg =
          result === "W"
            ? "green"
            : result === "D"
            ? "#888"
            : result === "L"
            ? "red"
            : "#ccc";
        return (
          <View key={idx} style={[styles.formCircle, { backgroundColor: bg }]}>
            <RNText style={styles.formText}>{result}</RNText>
          </View>
        );
      })}
    </View>
  );

  const safeProgress = (percent?: string) => {
    if (!percent) return 0;
    const num = parseFloat(percent.replace("%", ""));
    return isNaN(num) ? 0 : Math.min(Math.max(num / 100, 0), 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Predicción del Partido: {predictions?.teams.home.name} vs{" "}
        {predictions?.teams.away.name}
      </Text>

      <Text variant="titleSmall" style={styles.section}>
        <MaterialCommunityIcons name="trending-up" size={18} /> Probabilidades
      </Text>
      <View>
        <Text>
          {predictions?.teams.home.name} (
          {predictions?.predictions.percent.home})
        </Text>
        <ProgressBar progress={safeProgress(predictions?.predictions.percent.home)} />
        <Text>Empate ({predictions?.predictions.percent.draw})</Text>
        <ProgressBar progress={safeProgress(predictions?.predictions.percent.draw)} />
        <Text>
          {predictions?.teams.away.name} (
          {predictions?.predictions.percent.away})
        </Text>
        <ProgressBar progress={safeProgress(predictions?.predictions.percent.away)} />
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        <MaterialCommunityIcons name="soccer" size={18} /> Forma reciente
      </Text>
      <Text style={styles.bold}>{predictions?.teams.home.name}</Text>
      <View>
        {predictions?.teams.home.league.form.split("") &&
          renderForm(predictions?.teams.home.league.form.split(""))}
      </View>
      <Text style={styles.bold}>{predictions?.teams.away.name}</Text>
      <View>
        {predictions?.teams.away.league.form.split("") &&
          renderForm(predictions?.teams.away.league.form.split(""))}
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        <MaterialCommunityIcons name="chart-bar" size={18} /> Estadísticas clave
      </Text>
      <AdvancedMatchStats predictions={predictions!} />

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        ⭐ Jugadores destacados
      </Text>

      {featuredPlayers.length > 0 &&
        featuredPlayers.map((p: PlayerFixtureStats) => (
          <List.Accordion
            key={p.player.id}
            title={p.player.name}
            description={`${p.statistics[0].games.position} · ${p.statistics[0].team.name}`}
            left={() => (
              <Avatar.Image source={{ uri: p.player.photo }} size={48} />
            )}
            style={styles.accordion}
          >
            <View style={styles.accordionContent}>
              <Text style={styles.statLine}>
                ⚽ Goles: {p.statistics[0].goals.total || 0}
              </Text>
              <Text style={styles.statLine}>
                🎯 Asistencias: {p.statistics[0].goals.assists || 0}
              </Text>
              <Text style={styles.statLine}>
                ⭐ Rating: {p.statistics[0].games.rating ? Number(p.statistics[0].games.rating).toFixed(1) : "-"}
              </Text>
              <Text style={styles.statLine}>
                ⏱️ Minutos jugados: {p.statistics[0].games.minutes || 0}
              </Text>
              <Text style={styles.statLine}>
                🎯 Pases clave: {p.statistics[0].passes.key || 0}
              </Text>
              <Text style={styles.statLine}>
                🌀 Regates exitosos: {p.statistics[0].dribbles.success || 0} /{" "}
                {p.statistics[0].dribbles.attempts || 0}
              </Text>
              <Text style={styles.statLine}>
                💪 Duelos ganados: {p.statistics[0].duels.won || 0} /{" "}
                {p.statistics[0].duels.total || 0}
              </Text>
            </View>
          </List.Accordion>
        ))}

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        🎯 Goles esperados (xG)
      </Text>
      <View style={styles.statRow}>
        <Text>{predictions?.teams.home.name}: </Text>
        <Text>{Number(predictions?.predictions.goals.home ?? 0).toFixed(2)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text>{predictions?.teams.away.name}: </Text>
        <Text>{Number(predictions?.predictions.goals.away ?? 0).toFixed(2)}</Text>
      </View>

      <Divider style={styles.divider} />

      {/* <Text variant="titleSmall" style={styles.section}>
        ⚠️ Alertas relevantes
      </Text>
      {prediction.alerts.map((a, i) => (
        <Text key={i} style={{ marginLeft: 8 }}>
          • {a}
        </Text>
      ))} */}

      {/* <Divider style={styles.divider} /> */}

      <Text variant="titleSmall" style={styles.section}>
        📅 Últimos enfrentamientos
      </Text>

      {predictions &&
        predictions.h2h.map((h2h, index) => {
          const matchDate = dayjs(h2h.fixture.date);
          const formattedDate = matchDate.format("DD MMM YYYY, HH:mm");
          const timeUntil = matchDate.fromNow();

          const bgColor = "#ffffff";
          const borderColor = "#1DB954";
          const tagColor = borderColor;

          return (
            <Card
              key={index}
              style={[
                styles.card,
                { backgroundColor: bgColor, borderLeftColor: borderColor },
              ]}
              elevation={2}
            >
              <View style={styles.header}>
                <Text style={[styles.dateText, { color: borderColor }]}>
                  {formattedDate}
                </Text>
              </View>

              <View style={styles.teams}>
                <View style={styles.team}>
                  <Avatar.Image
                    style={{ backgroundColor: "transparent" }}
                    size={42}
                    source={{ uri: h2h.teams.home.logo }}
                  />
                  <Text style={styles.teamName}>{h2h.teams.home.name}</Text>
                  <Text style={styles.teamName}>{h2h.goals.home}</Text>
                </View>

                <Text style={[styles.vs, { color: borderColor }]}>VS</Text>

                <View style={styles.team}>
                  <Avatar.Image
                    style={{ backgroundColor: "transparent" }}
                    size={42}
                    source={{ uri: h2h.teams.away.logo }}
                  />
                  <Text style={styles.teamName}>{h2h.teams.away.name}</Text>
                  <Text style={styles.teamName}>{h2h.goals.away}</Text>
                </View>
              </View>

              <Text style={styles.stadiumText}>{h2h.fixture.venue.name}</Text>
              <Text style={styles.timeUntil}>{timeUntil}</Text>
            </Card>
          );
        })}

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        🎯 Marcador exacto
      </Text>

      <View style={styles.teams}>
        <View style={styles.team}>
          <Avatar.Image
            style={{ backgroundColor: "transparent" }}
            size={42}
            source={{ uri: predictions?.teams.home.logo }}
          />
          <Text style={styles.teamName}>{predictions?.teams.home.name}</Text>
          <Text style={styles.teamName}>
            {predictions && predictions.predictions.goals.home}
          </Text>
        </View>

        <Text style={[styles.vs, { color: "#1DB954" }]}>VS</Text>

        <View style={styles.team}>
          <Avatar.Image
            style={{ backgroundColor: "transparent" }}
            size={42}
            source={{ uri: predictions?.teams.away.logo }}
          />
          <Text style={styles.teamName}>{predictions?.teams.away.name}</Text>
          <Text style={styles.teamName}>
            {predictions && predictions.predictions.goals.away}
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        💡 Recomendaciones de apuesta
      </Text>
      <View style={styles.chipWrap}>
        <Chip mode="outlined" style={{ margin: 4 }}>
          {predictions?.predictions.advice}
        </Chip>
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.section}>
        🤖 Score Predictor (IA)
      </Text>
      {/* <Text>{prediction.aiAnalysis}</Text> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  section: {
    marginTop: 16,
    fontWeight: "bold",
  },
  bar: {
    height: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  formRow: {
    flexDirection: "row",
    gap: 4,
    marginVertical: 4,
  },
  formCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  formText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  xg: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1DB954",
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  exactScore: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1DB954",
    textAlign: "center",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  divider: {
    marginVertical: 12,
  },
  accordion: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
  },
  accordionContent: {
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  statLine: {
    fontSize: 13,
    marginBottom: 4,
  },
  team: {
    alignItems: "center",
    width: 90,
  },
  teamName: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    color: "#333",
  },
  vs: {
    fontWeight: "bold",
    fontSize: 16,
  },
  stadiumText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    fontWeight: "600",
    fontSize: 14,
  },
  teams: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
  },
});
