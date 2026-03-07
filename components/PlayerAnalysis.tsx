import { useFetch } from "@/hooks/FetchContext";
import { AnalysisOpenAi, PlayerAnalysisProps } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import AnalysisTabs from "./AnalysisTabs";
import Loading from "./Loading";

export default function PlayerAnalysis({
  playerId,
  stats,
}: PlayerAnalysisProps) {
  const { playerAnalysis } = useFetch();
  const [analysis, setAnalysis] = useState<AnalysisOpenAi | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        const { analysis, success, message } = await playerAnalysis(
          stats,
          playerId,
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
    return <Loading visible={loading} />;
  }

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
              <Text key={i}>• {p}</Text>
            ))}
          </Card.Content>
        </Card>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 12, padding: 6 },
  big: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
