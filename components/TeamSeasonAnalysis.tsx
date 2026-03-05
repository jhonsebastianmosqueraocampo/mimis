// components/analysis/TeamSeasonAnalysis.tsx
import { useFetch } from "@/hooks/FetchContext";
import { AnalysisOpenAi, TeamSeasonAnalysisProps } from "@/types";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import AnalysisTabs from "./AnalysisTabs";
import Loading from "./Loading";

export default function TeamSeasonAnalysis({
  teamId,
  season,
  stats,
}: TeamSeasonAnalysisProps) {
  const { seasonTeamAnalysis } = useFetch();

  const [analysis, setAnalysis] = useState<AnalysisOpenAi | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasRequested, setHasRequested] = useState(false);

  const loadAnalysis = async () => {
    setLoading(true);
    setHasRequested(true);
    try {
      const { analysis, success, message } = await seasonTeamAnalysis(
        stats,
        teamId,
        season,
      );

      if (success) {
        setAnalysis(analysis);
      } else {
        setMessage(message!);
      }
    } catch (err) {
      setMessage("Error al generar el análisis del equipo.");
    } finally {
      setLoading(false);
    }
  };

  // Estado inicial (ANTES de generar análisis)
  if (!analysis && !loading && !hasRequested) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.center}>
          <Text style={styles.title}>
            📊 Análisis Inteligente de la Temporada
          </Text>

          <Text style={styles.big}>
            Genera un análisis avanzado basado en estadísticas de jugadores,
            rendimiento colectivo y resultados del equipo.
          </Text>

          <Text style={styles.subtle}>
            ⚠️ Este proceso puede tardar unos segundos.
          </Text>

          <Button
            mode="contained"
            onPress={loadAnalysis}
            style={styles.button}
            contentStyle={{ paddingVertical: 6 }}
          >
            🚀 Generar Análisis
          </Button>
        </Card.Content>
      </Card>
    );
  }

  // Loading mientras genera
  if (loading) {
    return (
      <Loading
        visible={true}
        title="Generando análisis inteligente..."
        subtitle="Estamos procesando estadísticas y resultados"
      />
    );
  }

  //  Si hubo error
  if (message && !analysis) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.center}>
          <Text style={{ color: "red" }}>{message}</Text>

          <Button mode="contained" onPress={loadAnalysis}>
            Reintentar
          </Button>
        </Card.Content>
      </Card>
    );
  }

  if (!analysis) return null;

  const strengths = analysis.summary?.strengths ?? [];
  const weaknesses = analysis.summary?.weaknesses ?? [];
  const recommendations = analysis.summary?.recommendations ?? [];

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

            {weaknesses.length > 0 && (
              <>
                <Text style={styles.subtitle}>Debilidades</Text>
                {weaknesses.map((w, i) => (
                  <Text key={i} style={styles.item}>
                    • {w}
                  </Text>
                ))}
              </>
            )}

            {recommendations.length > 0 && (
              <>
                <Text style={styles.subtitle}>Recomendaciones</Text>
                {recommendations.map((r, i) => (
                  <Text key={i} style={styles.item}>
                    • {r}
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
  card: { marginVertical: 12, padding: 10 },
  big: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: { fontSize: 17, fontWeight: "600", marginTop: 10 },
  subtle: { marginVertical: 10, opacity: 0.6, textAlign: "center" },
  item: { fontSize: 15, marginVertical: 2 },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 15,
    borderRadius: 8,
  },
});
