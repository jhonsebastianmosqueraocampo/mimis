import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import AnalysisTabs from "./AnalysisTabs";

// Charts
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { AnalysisOpenAi, FixtureAnalysisProps } from "@/types";
import Loading from "./Loading";

const BAR_CHART_EXPLANATIONS: Record<string, string> = {
  "Tiros al arco":
    "Cantidad de disparos que fueron dirigidos al arco. Un número mayor indica mayor peligro ofensivo.",

  "Tiros fuera":
    "Disparos que no fueron al arco. Refleja intentos ofensivos sin precisión.",

  "Tiros totales": "Suma de todos los disparos realizados durante el partido.",

  "Tiros de esquina":
    "Cantidad de corners obtenidos. Suele indicar presión ofensiva.",

  Faltas: "Número de infracciones cometidas por cada equipo.",

  "Tarjetas amarillas":
    "Cantidad de amonestaciones recibidas durante el partido.",
};

const LINE_CHART_EXPLANATIONS: Record<string, string> = {
  "Evolución de tiros":
    "Muestra cómo cambiaron los tiros a lo largo del partido por tramos de tiempo.",
  "Evolución de tiros al arco":
    "Muestra los tiros al arco por tramos del partido. Sirve para ver quién tuvo más momentos de dominio.",
  "Ataques por tiempo":
    "Indica la intensidad ofensiva por periodos. Picos altos suelen coincidir con rachas de presión.",
  "Posesión por tiempo":
    "Muestra cómo fue variando la posesión durante el partido. Útil para detectar cambios de control.",
};

type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function FixtureAnalysis({
  fixtureId,
  stats,
}: FixtureAnalysisProps) {
  const { fixtureAnalysis } = useFetch();

  const [analysis, setAnalysis] = useState<AnalysisOpenAi | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const referenceId = fixtureId + "_post_match";
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        const { analysis, success, message } = await fixtureAnalysis(
          stats,
          referenceId,
        );
        if (!isMounted) return;

        if (success) {
          setAnalysis(analysis);
        } else {
          setMessage(message!);
        }
      } catch (err) {
        if (isMounted) setMessage("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !analysis) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const strengths = analysis.summary?.strengths ?? [];
  const weaknesses = analysis.summary?.weaknesses ?? [];

  return (
    <AnalysisTabs
      textView={
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.big}>{analysis.text}</Text>
          </Card.Content>
        </Card>
      }
      summaryView={
        <Card style={styles.card}>
          <Card.Content>
            {analysis.summary?.title && (
              <Text style={styles.title}>{analysis.summary.title}</Text>
            )}

            {analysis.summary?.keyPoints?.map((p, i) => (
              <Text key={i} style={styles.item}>
                • {p}
              </Text>
            ))}

            {strengths.length > 0 && (
              <>
                <Text style={styles.subtitle}>Fortalezas</Text>
                {strengths.map((s, i) => (
                  <Text key={i} style={styles.item}>
                    • {s}
                  </Text>
                ))}
              </>
            )}

            {weaknesses?.length > 0 && (
              <>
                <Text style={styles.subtitle}>Debilidades</Text>
                {weaknesses.map((w, i) => (
                  <Text key={i} style={styles.item}>
                    • {w}
                  </Text>
                ))}
              </>
            )}
          </Card.Content>
        </Card>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
  },

  big: {
    ...typography.body,
    lineHeight: 24,
  },

  title: {
    ...typography.titleLarge,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },

  item: {
    ...typography.body,
    marginVertical: spacing.xs ?? 2,
    color: colors.textSecondary,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
