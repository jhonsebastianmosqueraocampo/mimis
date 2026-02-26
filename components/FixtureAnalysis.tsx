import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import AnalysisTabs from "./AnalysisTabs";

// Charts
import { useFetch } from "@/hooks/FetchContext";
import {
  AnalysisOpenAi,
  BarChartData,
  FixtureAnalysisProps,
  LineChartData,
  PieChartData,
  RadarChartData,
} from "@/types";
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

const ChartCard = ({ title, description, children }: ChartCardProps) => {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        marginVertical: 8,
        width: "100%",
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "700", marginBottom: 4 }}>
        {title}
      </Text>

      {description && (
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          {description}
        </Text>
      )}

      {children}
    </View>
  );
};

const getLineChartDescription = (title: string) => {
  return (
    LINE_CHART_EXPLANATIONS[title] ||
    "Gráfica temporal: muestra cómo cambia esta estadística durante el partido. Los picos indican momentos de mayor intensidad."
  );
};

const adaptBarCharts = (charts: any[] = []): BarChartData[] => {
  return charts.flatMap((c, idx) => [
    {
      id: `shots-on-${idx}`,
      title: "Tiros al arco",
      xLabels: c.teams,
      values: c.shotsOnGoal,
    },
    {
      id: `shots-off-${idx}`,
      title: "Tiros fuera",
      xLabels: c.teams,
      values: c.shotsOffGoal,
    },
    {
      id: `total-shots-${idx}`,
      title: "Tiros totales",
      xLabels: c.teams,
      values: c.totalShots,
    },
    {
      id: `corners-${idx}`,
      title: "Tiros de esquina",
      xLabels: c.teams,
      values: c.corners,
    },
    {
      id: `fouls-${idx}`,
      title: "Faltas",
      xLabels: c.teams,
      values: c.fouls,
    },
    {
      id: `yellow-${idx}`,
      title: "Tarjetas amarillas",
      xLabels: c.teams,
      values: c.yellowCards,
    },
  ]);
};

const adaptPieCharts = (charts: any[] = []): PieChartData[] => {
  return charts.map((c, idx) => ({
    id: `possession-${idx}`,
    title: "Posesión",
    slices: c.teams.map((team: string, i: number) => ({
      label: team,
      value: c.possession[i],
    })),
  }));
};

const adaptLineCharts = (charts: any[] = []): LineChartData[] => {
  return charts.map((c, idx) => ({
    id: `line-${idx}`,
    title: c.title,
    labels: c.labels,
    points: c.values,
  }));
};

const adaptRadarCharts = (charts: any[] = []): RadarChartData[] => {
  return charts.map((c, idx) => ({
    id: `radar-${idx}`,
    title: c.title,
    axes: c.axes,
    values: c.values,
  }));
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
      // chartsView={
      //   <>
      //     {adaptBarCharts(analysis.charts?.barCharts).map((c) => (
      //       <ChartCard
      //         key={c.id}
      //         title={c.title}
      //         description={BAR_CHART_EXPLANATIONS[c.title]}
      //       >
      //         <BarChartView
      //           title={c.title}
      //           xLabels={c.xLabels}
      //           values={c.values}
      //         />
      //       </ChartCard>
      //     ))}

      //     {adaptLineCharts(analysis.charts?.lineCharts).map((c) => (
      //       <ChartCard
      //         key={c.id}
      //         title={c.title}
      //         description={getLineChartDescription(c.title)}
      //       >
      //         <LineChartView
      //           title={c.title}
      //           labels={c.labels}
      //           points={c.points}
      //         />
      //       </ChartCard>
      //     ))}

      //     {adaptRadarCharts(analysis.charts?.radarCharts).map((c) => (
      //       <ChartCard
      //         key={c.id}
      //         title={c.title}
      //         description={
      //           "Perfil del partido: compara diferentes aspectos del juego en una escala de 0 a 100."
      //         }
      //       >
      //         <RadarChartView title={c.title} axes={c.axes} values={c.values} />
      //       </ChartCard>
      //     ))}
      //   </>
      // }
    />
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 12 },
  big: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 17, fontWeight: "600", marginTop: 10 },
  item: { fontSize: 15, marginVertical: 2 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
