import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import {
    Avatar,
    Card,
    Chip,
    Divider,
    Text
} from "react-native-paper";

const matchAnalysis = {
  homeTeam: "Barcelona",
  awayTeam: "Real Madrid",
  highlights: [
    {
      team: "Barcelona",
      title: "Golazo de Lewandowski vs Girona",
      videoUrl: "https://www.youtube.com/watch?v=...",
    },
    {
      team: "Real Madrid",
      title: "Asistencia de Bellingham vs Betis",
      videoUrl: "https://www.youtube.com/watch?v=...",
    },
  ],
  strengths: {
    home: ["Posesión alta", "Juego por bandas", "Presión tras pérdida"],
    away: ["Contraataques", "Balón parado", "Duelos individuales"],
  },
  weaknesses: {
    home: ["Defensa en transiciones", "Balón aéreo"],
    away: ["Espacios entre líneas", "Salida bajo presión"],
  },
  form: {
    home: ["✅", "✅", "❌", "✅", "➖"],
    away: ["✅", "✅", "✅", "❌", "✅"],
  },
  keyPlayers: [
    {
      name: "Pedri",
      team: "Barcelona",
      role: "Organizador",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      name: "Rodrygo",
      team: "Real Madrid",
      role: "Extremo",
      avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    },
  ],
  prediction:
    "Se espera un partido abierto con dominio de posesión para el Barça, pero Real Madrid tiene ventaja en transiciones. Jugadores como Vinícius y Lewandowski podrían ser decisivos.",
};

export default function MatchAnalysisPreview() {
  const { homeTeam, awayTeam, highlights, strengths, weaknesses, form, keyPlayers, prediction } =
    matchAnalysis;

  const openVideo = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("No se pudo abrir el enlace:", err));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        🔍 Análisis Previo del Partido
      </Text>

      <Text variant="titleMedium" style={styles.section}>
        <MaterialIcons name="visibility" size={16} /> Mejores Jugadas Recientes
      </Text>
      <View style={styles.chipsContainer}>
        {highlights.map((h, idx) => (
          <Chip
            key={idx}
            icon="play-circle"
            onPress={() => openVideo(h.videoUrl)}
            style={styles.chip}
          >
            {h.team}: {h.title}
          </Chip>
        ))}
      </View>

      {/* Fortalezas y Debilidades */}
      <View style={styles.teamSection}>
        {[homeTeam, awayTeam].map((teamKey, idx) => {
          const isHome = idx === 0;
          return (
            <View style={styles.strengthsWeaknessesBlock} key={teamKey}>
              <Text style={styles.bold}>💪 Fortalezas - {teamKey}</Text>
              <View style={styles.chipsContainer}>
                {(isHome ? strengths.home : strengths.away).map((s) => (
                  <Chip key={s} style={styles.successChip}>
                    {s}
                  </Chip>
                ))}
              </View>
              <Text style={[styles.bold, { marginTop: 8 }]}>⚠️ Debilidades - {teamKey}</Text>
              <View style={styles.chipsContainer}>
                {(isHome ? weaknesses.home : weaknesses.away).map((w) => (
                  <Chip key={w} style={styles.errorChip}>
                    {w}
                  </Chip>
                ))}
              </View>
            </View>
          );
        })}
      </View>

      <Divider style={styles.divider} />

      {/* Forma reciente */}
      <Text variant="titleMedium" style={styles.section}>
        <MaterialCommunityIcons name="trending-up" size={16} /> Forma Reciente (últimos 5)
      </Text>
      {[homeTeam, awayTeam].map((team, idx) => (
        <View key={team} style={{ marginTop: 10 }}>
          <Text style={styles.bold}>{team}</Text>
          <View style={styles.formChips}>
            {(idx === 0 ? form.home : form.away).map((r, i) => (
              <Chip key={i} style={styles.formChip}>
                {r}
              </Chip>
            ))}
          </View>
        </View>
      ))}

      {/* Jugadores clave */}
      <Text variant="titleMedium" style={styles.section}>
        <MaterialCommunityIcons name="brain" size={16} /> Jugadores Clave
      </Text>
      {keyPlayers.map((p) => (
        <Card key={p.name} mode="outlined" style={styles.playerCard}>
          <Card.Content style={styles.playerContent}>
            <Avatar.Image source={{ uri: p.avatar }} size={48} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.bold}>{p.name}</Text>
              <Text>{p.team} – {p.role}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Análisis final */}
      <Divider style={styles.divider} />
      <Text variant="titleMedium" style={styles.section}>🧠 Análisis del Partido</Text>
      <Text>{prediction}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    margin: 4,
  },
  successChip: {
    backgroundColor: "#C8E6C9",
    margin: 4,
  },
  errorChip: {
    backgroundColor: "#FFCDD2",
    margin: 4,
  },
  teamSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  strengthsWeaknessesBlock: {
    width: "48%",
  },
  bold: {
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 20,
  },
  formChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  formChip: {
    margin: 2,
  },
  playerCard: {
    marginTop: 10,
  },
  playerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});