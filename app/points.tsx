import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Avatar, ProgressBar } from "react-native-paper";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";

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
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
        }}
      >
        {/* HEADER */}

        <Text style={[g.title, { marginBottom: 4 }]}>Tu trayectoria</Text>

        <Text style={{ opacity: 0.7, marginBottom: spacing.md }}>
          Tu participación en MIMIS refleja tu compromiso con el fútbol ⚽
        </Text>

        {/* TARJETA PRINCIPAL */}

        <View style={[g.card, { padding: spacing.lg }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar.Icon
              icon="soccer"
              size={52}
              color={colors.primary}
              style={{ backgroundColor: colors.border }}
            />

            <View style={{ marginLeft: spacing.sm }}>
              <Text style={{ fontSize: 14, opacity: 0.7 }}>
                {user?.level ?? "Novato"}
              </Text>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {user?.xp ?? 0} XP acumulados
              </Text>
            </View>
          </View>

          {/* PROGRESS */}

          <View style={{ marginTop: spacing.md }}>
            <Text style={{ fontSize: 13, opacity: 0.7 }}>
              Progreso hacia el siguiente nivel
            </Text>

            <ProgressBar
              progress={progress ?? 0}
              color={colors.primary}
              style={{
                marginTop: 6,
                height: 8,
                borderRadius: radius.md,
                backgroundColor: colors.border,
              }}
            />

            <Text
              style={{
                textAlign: "right",
                marginTop: 4,
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              {user?.xp ?? 0} / {nextLevelXp} XP
            </Text>
          </View>

          {/* POINTS */}

          <View style={{ marginTop: spacing.md }}>
            <Text style={{ textAlign: "center", opacity: 0.7 }}>
              {user?.points ?? 0} pts disponibles para redimir
            </Text>
          </View>
        </View>

        {/* HISTORIAL */}

        <View style={{ marginTop: spacing.lg }}>
          <Text style={[g.subtitle, { marginBottom: spacing.sm }]}>
            Últimas actividades
          </Text>

          <View style={[g.card, { padding: spacing.md }]}>
            {user?.pointsHistory
              ?.slice(-5)
              .reverse()
              .map((h, i) => (
                <Text key={i} style={{ marginBottom: 4 }}>
                  {h.points > 0 ? "+" : ""}
                  {h.points} pts — {h.action}
                </Text>
              )) ?? <Text>Aún no tienes actividad registrada.</Text>}
          </View>
        </View>

        {/* COMO GANAR PUNTOS */}

        <View style={{ marginTop: spacing.lg }}>
          <Text style={[g.subtitle, { marginBottom: spacing.sm }]}>
            Cómo ganar puntos
          </Text>

          <View
            style={{
              backgroundColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
            }}
          >
            <Text style={{ marginBottom: 6 }}>
              🔸 Apuesta en partidos y gana recompensas.
            </Text>

            <Text style={{ marginBottom: 6 }}>
              🔸 Mira noticias o previas de partidos.
            </Text>

            <Text style={{ marginBottom: 6 }}>
              🔸 Participa en minijuegos antes de los partidos.
            </Text>

            <Text>🔸 Inicia sesión cada día para obtener bonus.</Text>
          </View>
        </View>

        {/* CRECER EN MIMIS */}

        <View style={{ marginTop: spacing.lg }}>
          <Text style={[g.subtitle, { marginBottom: spacing.sm }]}>
            Cómo crecer en MIMIS
          </Text>

          <View
            style={{
              backgroundColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
            }}
          >
            <Text style={{ marginBottom: 6 }}>
              ⚽ Participa en partidos y apuestas responsables.
            </Text>

            <Text style={{ marginBottom: 6 }}>
              📰 Publica noticias y comparte jugadas.
            </Text>

            <Text style={{ marginBottom: 6 }}>
              🏟️ Juega partidos sintéticos oficiales.
            </Text>

            <Text>🤝 Forma parte activa de la comunidad.</Text>
          </View>
        </View>
      </ScrollView>
    </PrivateLayout>
  );
}
