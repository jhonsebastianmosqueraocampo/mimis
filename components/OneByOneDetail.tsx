import { OneByOne } from "@/types";
import React, { useMemo } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import {
    Card,
    Divider,
    IconButton,
    Text
} from "react-native-paper";

type Props = {
  oneByOne: OneByOne;     // ← AHORA RECIBE EL OBJETO COMPLETO
  onClose: () => void;
};

export default function OneByOneDetail({ oneByOne, onClose }: Props) {
  const { teams, result, playerRatings = [] } = oneByOne;

  // Promedio general real
  const avg =
    playerRatings.length > 0
      ? playerRatings.reduce((a, b) => a + b.rating, 0) / playerRatings.length
      : 0;

  // MVP real
  const mvp = useMemo(() => {
    if (!playerRatings.length) return null;
    return [...playerRatings].sort((a, b) => b.rating - a.rating)[0];
  }, [playerRatings]);

  return (
    <Modal animationType="slide" visible transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          {/* Botón cerrar */}
          <View style={styles.closeRow}>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={styles.container}>
            {/* HERO */}
            <View style={styles.hero}>
              <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />

              <View style={styles.heroCenter}>
                <Text variant="headlineSmall" style={styles.heroTitle}>
                  {teams.home.name} vs {teams.away.name}
                </Text>

                <Text style={styles.avg}>
                  Promedio general: {avg.toFixed(1)} ⭐
                </Text>
              </View>

              <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
            </View>

            {/* RESULTADO */}
            <View style={styles.scoreboard}>
              <Text style={styles.scoreText}>{result.home}</Text>
              <Text style={styles.scoreDash}>-</Text>
              <Text style={styles.scoreText}>{result.away}</Text>
            </View>

            <Divider style={styles.space} />

            {/* MVP */}
            {mvp && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Jugador destacado (MVP)
                </Text>

                <Card style={styles.mvpCard}>
                  <Card.Content style={styles.mvpRow}>
                    <View style={styles.mvpInfo}>
                      <Text style={styles.mvpName}>{mvp.title}</Text>
                      <Text style={styles.mvpRating}>
                        {mvp.rating} ⭐ — {mvp.description}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                <Divider style={styles.space} />
              </>
            )}

            {/* LISTA DE JUGADORES */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Análisis jugador por jugador
            </Text>

            {playerRatings.map((p) => (
              <Card key={p.playerId} style={styles.card}>
                <Card.Content>
                  <View style={styles.playerRow}>

                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{p.title}</Text>
                      <Text style={styles.playerRating}>{p.rating} ⭐</Text>
                    </View>
                  </View>

                  <Text style={styles.playerTitle}>“{p.title}”</Text>
                  <Text style={styles.playerDesc}>{p.description}</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    overflow: "hidden",
  },
  closeRow: { alignItems: "flex-end", padding: 8 },
  container: { padding: 16, paddingBottom: 40 },

  hero: { flexDirection: "row", alignItems: "center" },
  heroCenter: { flex: 1, alignItems: "center" },
  heroTitle: { fontWeight: "700", textAlign: "center" },
  avg: { fontWeight: "600", marginTop: 4 },
  teamLogo: { width: 60, height: 60, resizeMode: "contain" },

  scoreboard: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: { fontSize: 38, fontWeight: "700" },
  scoreDash: { fontSize: 38, marginHorizontal: 12, opacity: 0.6 },

  space: { marginVertical: 16 },

  // MVP
  mvpCard: { marginBottom: 16 },
  mvpRow: { flexDirection: "row", alignItems: "center" },
  mvpInfo: { marginLeft: 12 },
  mvpName: { fontWeight: "700", fontSize: 16 },
  mvpRating: { marginTop: 4, opacity: 0.8 },

  // Jugadores
  sectionTitle: { marginBottom: 12, fontWeight: "700" },
  card: { marginBottom: 14 },
  playerRow: { flexDirection: "row", alignItems: "center" },
  playerInfo: { marginLeft: 10 },
  playerName: { fontWeight: "700", fontSize: 15 },
  playerRating: { opacity: 0.8 },
  playerTitle: { marginTop: 8, fontWeight: "700", fontStyle: "italic" },
  playerDesc: { marginTop: 6, opacity: 0.9 },
});