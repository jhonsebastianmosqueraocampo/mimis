import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Card, ProgressBar } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function Points() {
  const { getUser } = useFetch();
  const [user, setUser] = useState<User>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getUserInfo = async () => {
      setLoading(true);
      try {
        const { success, user, message } = await getUser();

        if (!isMounted) return;

        if (success) {
          setUser(user!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getUserInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  // Cálculo de progreso al siguiente nivel
  const nextLevelXp =
    user && user.level === "Novato"
      ? 1000
      : user && user.level === "Intermedio"
        ? 2500
        : user && user.level === "Avanzado"
          ? 5000
          : user && user.level === "Experto"
            ? 10000
            : 12000;
  const progress = user && Math.min(user.xp / nextLevelXp, 1);

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🏅 Encabezado */}
        <Text style={styles.title}>Tu trayectoria</Text>
        <Text style={styles.subtitle}>
          Tu participación en MIMIS refleja tu compromiso con el fútbol ⚽
        </Text>

        {/* 💎 Tarjeta principal */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Avatar.Icon icon="soccer" size={52} color="#1DB954" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.level}>{user?.level ?? "Novato"}</Text>
              <Text style={styles.xpHighlight}>
                {user?.xp ?? 0} XP acumulados
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.progressLabel}>
              Progreso hacia el siguiente nivel
            </Text>
            <ProgressBar
              progress={progress ?? 0}
              color="#1DB954"
              style={styles.progressBar}
            />
            <Text style={styles.xp}>
              {user?.xp ?? 0} / {nextLevelXp} XP
            </Text>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.pointsSecondary}>
              {user?.points ?? 0} pts disponibles para redimir
            </Text>
          </View>
        </Card>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Últimas actividades</Text>
          <Card style={styles.historyCard}>
            {user?.pointsHistory
              ?.slice(-5)
              .reverse()
              .map((h, i) => (
                <Text key={i} style={styles.historyText}>
                  {h.points > 0 ? "+" : ""}
                  {h.points} pts — {h.action}
                </Text>
              )) ?? (
              <Text style={styles.historyText}>
                Aún no tienes actividad registrada.
              </Text>
            )}
          </Card>
        </View>

        {/* 📋 Cómo ganar puntos */}
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Cómo ganar puntos</Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              🔸 Apuesta en partidos y gana recompensas.
            </Text>
            <Text style={styles.tipText}>
              🔸 Mira noticias o previas de partidos.
            </Text>
            <Text style={styles.tipText}>
              🔸 Participa en minijuegos antes de los partidos.
            </Text>
            <Text style={styles.tipText}>
              🔸 Inicia sesión cada día para obtener bonus.
            </Text>
          </View>
        </View>

        {/* 🟢 Botón para ganar puntos */}
        <Text style={styles.sectionTitle}>Cómo crecer en MIMIS</Text>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            ⚽ Participa en partidos y apuestas responsables.
          </Text>
          <Text style={styles.tipText}>
            📰 Publica noticias y comparte jugadas.
          </Text>
          <Text style={styles.tipText}>
            🏟️ Juega partidos sintéticos oficiales.
          </Text>
          <Text style={styles.tipText}>
            🤝 Forma parte activa de la comunidad.
          </Text>
        </View>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  points: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1DB954",
  },
  level: {
    fontSize: 14,
    color: "#666",
  },
  progressLabel: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  xp: {
    fontSize: 13,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  tipBox: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 10,
  },
  tipText: {
    color: "#333",
    marginBottom: 6,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#1DB954",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
  },
  historyText: {
    color: "#333",
    fontSize: 13,
    marginBottom: 4,
  },
  xpHighlight: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1DB954",
  },
  pointsSecondary: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
});
