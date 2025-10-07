import { Prediction } from "@/types";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    Dialog,
    Divider,
    IconButton,
    Portal,
    Text,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

/** Utils */
const pctNum = (s?: string) => {
  if (!s) return 0;
  const n = parseFloat(String(s).replace("%", "").trim());
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
};
const num = (s?: string | number) => {
  if (s === null || s === undefined) return 0;
  const n = typeof s === "number" ? s : parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

/** Pequeña barra segmentada Home vs Away */
const SegmentedBar = ({
  home,
  away,
  height = 12,
  homeLabel = "Local",
  awayLabel = "Visitante",
}: {
  home: number;
  away: number;
  height?: number;
  homeLabel?: string;
  awayLabel?: string;
}) => {
  const total = Math.max(1, home + away);
  const homeW = (home / total) * 100;
  const awayW = (away / total) * 100;
  return (
    <View style={{ width: "100%" }}>
      <View style={[styles.segmentedBar, { height }]}>
        <View style={[styles.segmentHome, { width: `${homeW}%` }]} />
        <View style={[styles.segmentAway, { width: `${awayW}%` }]} />
      </View>
      <View style={styles.segmentLabels}>
        <Text style={styles.segmentText}>
          {homeLabel}: {home.toFixed(0)}%
        </Text>
        <Text style={styles.segmentText}>
          {awayLabel}: {away.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
};

/** Mini barras verticales (goles por partido en H2H) */
const TinyBars = ({
  values,
  maxBars = 6,
  height = 44,
}: {
  values: number[];
  maxBars?: number;
  height?: number;
}) => {
  const data = values.slice(0, maxBars);
  const maxVal = Math.max(1, ...data);
  return (
    <View style={[styles.tinyBars, { height }]}>
      {data.map((v, i) => {
        const h = (v / maxVal) * (height - 8);
        return (
          <View key={i} style={styles.tinyBarCol}>
            <View style={[styles.tinyBar, { height: h }]} />
            <Text style={styles.tinyBarLabel}>{v}</Text>
          </View>
        );
      })}
    </View>
  );
};

const StatRow = ({
  icon,
  label,
  value,
  onInfo,
}: {
  icon: string;
  label: string;
  value: string;
  onInfo?: () => void;
}) => (
  <View style={styles.rowBetween}>
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={18} />
      <Text style={styles.rowLabel}> {label}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      {onInfo && (
        <IconButton
          icon="information-outline"
          size={18}
          onPress={onInfo}
          style={{ margin: 0 }}
        />
      )}
    </View>
  </View>
);

const DualRow = ({
  icon,
  label,
  leftLabel,
  rightLabel,
  left,
  right,
  suffix = "",
  onInfo,
}: {
  icon: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  left: string | number;
  right: string | number;
  suffix?: string;
  onInfo?: () => void;
}) => (
  <View style={{ marginTop: 8 }}>
    <View style={styles.rowBetween}>
      <View style={styles.row}>
        <MaterialCommunityIcons name={icon} size={18} />
        <Text style={styles.rowLabel}> {label}</Text>
      </View>
      {onInfo && (
        <IconButton
          icon="information-outline"
          size={18}
          onPress={onInfo}
          style={{ margin: 0 }}
        />
      )}
    </View>
    <View style={styles.dualRow}>
      <Chip icon="home" style={styles.dualChip} compact>
        {leftLabel}:{" "}
        <Text style={styles.bold}>
          {left}
          {suffix}
        </Text>
      </Chip>
      <Chip icon="airplane" style={styles.dualChip} compact>
        {rightLabel}:{" "}
        <Text style={styles.bold}>
          {right}
          {suffix}
        </Text>
      </Chip>
    </View>
  </View>
);

type AdvancedMatchStats = {
  predictions: Prediction;
};

export default function AdvancedMatchStats({
  predictions,
}: AdvancedMatchStats) {
  const home = predictions?.teams?.home;
  const away = predictions?.teams?.away;
  const cmp = predictions?.comparison;
  const h2h = predictions?.h2h ?? [];

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoText, setInfoText] = useState("");

  const showInfo = (text: string) => {
    setInfoText(text);
    setInfoOpen(true);
  };

  const compRows = [
    {
      key: "Poisson (distrib.)",
      icon: "sigma",
      h: pctNum(cmp?.poisson_distribution?.home),
      a: pctNum(cmp?.poisson_distribution?.away),
      info: "Poisson aproxima la probabilidad de distintos conteos de goles basándose en tasas históricas. Un % mayor sugiere mayor probabilidad de anotar más.",
    },
    {
      key: "H2H (comparado)",
      icon: "handshake",
      h: pctNum(cmp?.h2h?.home),
      a: pctNum(cmp?.h2h?.away),
      info: "Comparativa de rendimiento directo entre ambos equipos en duelos recientes (Head-to-Head).",
    },
    {
      key: "Potencia de goles",
      icon: "soccer",
      h: pctNum(cmp?.goals?.home),
      a: pctNum(cmp?.goals?.away),
      info: "Indicador agregado de producción ofensiva (marcados) y vulnerabilidad (encajados).",
    },
    {
      key: "Total ponderado",
      icon: "chart-bar",
      h: pctNum(cmp?.total?.home),
      a: pctNum(cmp?.total?.away),
      info: "Resumen global ponderado de varios factores (forma, ataque, defensa, goles).",
    },
  ];

  const hGoals = home?.league?.goals;
  const aGoals = away?.league?.goals;

  const hForAvg = num(hGoals?.for?.average?.total);
  const hAgAvg = num(hGoals?.against?.average?.total);
  const aForAvg = num(aGoals?.for?.average?.total);
  const aAgAvg = num(aGoals?.against?.average?.total);

  const hPlayed = {
    home: num(home?.league?.fixtures?.played?.home),
    away: num(home?.league?.fixtures?.played?.away),
    total: num(home?.league?.fixtures?.played?.total),
  };
  const aPlayed = {
    home: num(away?.league?.fixtures?.played?.home),
    away: num(away?.league?.fixtures?.played?.away),
    total: num(away?.league?.fixtures?.played?.total),
  };

  const h2hSummary = useMemo(() => {
    let homeWins = 0,
      awayWins = 0,
      draws = 0;
    let goalsH = 0,
      goalsA = 0;

    h2h.forEach((m: any) => {
      const hw = m?.teams?.home?.winner === true;
      const aw = m?.teams?.away?.winner === true;
      if (hw && !aw) homeWins += 1;
      else if (!hw && aw) awayWins += 1;
      else draws += 1;

      goalsH += num(m?.goals?.home);
      goalsA += num(m?.goals?.away);
    });

    const goalsPerMatch = h2h.map(
      (m: any) => num(m?.goals?.home) + num(m?.goals?.away)
    );
    const total = h2h.length;

    return {
      total,
      homeWins,
      awayWins,
      draws,
      goalsH,
      goalsA,
      avgGoals: total ? ((goalsH + goalsA) / total).toFixed(2) : "0.00",
      goalsPerMatch,
    };
  }, [h2h]);

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          {/* ---- COMPARISON ---- */}
          <View style={styles.rowBetween}>
            <Text style={styles.blockTitle}>Comparación</Text>
            <IconButton
              icon="information-outline"
              size={18}
              onPress={() =>
                showInfo(
                  "Comparación de fuerzas entre local y visitante. Las barras muestran el reparto porcentual entre ambos equipos para cada métrica."
                )
              }
              style={{ margin: 0 }}
            />
          </View>

          {compRows.map((r) => (
            <View key={r.key} style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name={r.icon as any} size={18} />
                  <Text style={styles.rowLabel}> {r.key}</Text>
                </View>
                <IconButton
                  icon="information-outline"
                  size={18}
                  onPress={() => showInfo(r.info)}
                  style={{ margin: 0 }}
                />
              </View>
              <SegmentedBar
                home={r.h}
                away={r.a}
                homeLabel={home?.name ?? "Local"}
                awayLabel={away?.name ?? "Visitante"}
              />
            </View>
          ))}

          <Divider style={{ marginVertical: 12 }} />

          {/* ---- LIGA: PROMEDIOS DE GOLES ---- */}
          <View style={styles.rowBetween}>
            <Text style={styles.blockTitle}>Liga (promedio de goles)</Text>
            <IconButton
              icon="information-outline"
              size={18}
              onPress={() =>
                showInfo(
                  "Promedios de goles a favor y en contra (totales) basados en los partidos de liga registrados."
                )
              }
              style={{ margin: 0 }}
            />
          </View>

          <DualRow
            icon="soccer-field"
            label={`${home?.name ?? "Local"} – promedio total`}
            leftLabel="A favor"
            rightLabel="En contra"
            left={hForAvg.toFixed(2)}
            right={hAgAvg.toFixed(2)}
          />

          <DualRow
            icon="soccer-field"
            label={`${away?.name ?? "Visitante"} – promedio total`}
            leftLabel="A favor"
            rightLabel="En contra"
            left={aForAvg.toFixed(2)}
            right={aAgAvg.toFixed(2)}
          />

          {/* ---- PARTIDOS JUGADOS EN LIGA ---- */}
          <View style={styles.rowBetween}>
            <Text style={[styles.blockTitle, { marginTop: 12 }]}>
              Partidos jugados en liga
            </Text>
            <IconButton
              icon="information-outline"
              size={18}
              onPress={() =>
                showInfo(
                  "Distribución de partidos disputados en casa, fuera y el total en la competición de liga actual."
                )
              }
              style={{ margin: 0 }}
            />
          </View>

          <DualRow
            icon="home"
            label={`${home?.name ?? "Local"}`}
            leftLabel="Casa"
            rightLabel="Visita"
            left={hPlayed.home}
            right={hPlayed.away}
          />
          <StatRow
            icon="counter"
            label="Total"
            value={`${hPlayed.total}`}
            onInfo={() =>
              showInfo(
                "Cantidad total de partidos de liga jugados por el equipo local (casa + visita)."
              )
            }
          />

          <DualRow
            icon="home"
            label={`${away?.name ?? "Visitante"}`}
            leftLabel="Casa"
            rightLabel="Visita"
            left={aPlayed.home}
            right={aPlayed.away}
          />
          <StatRow
            icon="counter"
            label="Total"
            value={`${aPlayed.total}`}
            onInfo={() =>
              showInfo(
                "Cantidad total de partidos de liga jugados por el equipo visitante (casa + visita)."
              )
            }
          />

          <Divider style={{ marginVertical: 12 }} />

          {/* ---- H2H RESUMEN ---- */}
          <View style={styles.rowBetween}>
            <Text style={styles.blockTitle}>
              Enfrentamientos directos (H2H)
            </Text>
            <IconButton
              icon="information-outline"
              size={18}
              onPress={() =>
                showInfo(
                  "Resumen de los últimos enfrentamientos directos: victorias por bando, empates y goles totales. El minigráfico muestra los goles totales por partido."
                )
              }
              style={{ margin: 0 }}
            />
          </View>

          <View style={styles.h2hChips}>
            <Chip icon="trophy-variant" compact style={styles.chip}>
              {home?.name ?? "Local"}:{" "}
              <Text style={styles.bold}>{h2hSummary.homeWins}</Text>
            </Chip>

            <Chip icon="minus" compact style={styles.chip}>
              Empates: <Text style={styles.bold}>{h2hSummary.draws}</Text>
            </Chip>

            <Chip icon="sword-cross" compact style={styles.chip}>
              {away?.name ?? "Visitante"}:{" "}
              <Text style={styles.bold}>{h2hSummary.awayWins}</Text>
            </Chip>
          </View>

          <View style={styles.statBlock}>
            <StatRow
              icon="soccer"
              label="Goles totales H2H"
              value={`${h2hSummary.goalsH} - ${h2hSummary.goalsA}`}
              onInfo={() =>
                showInfo(
                  "Suma de goles anotados por cada equipo en los H2H recientes."
                )
              }
            />
            <Text style={styles.subLabel}>
              Promedio por partido:{" "}
              <Text style={styles.bold}>{h2hSummary.avgGoals}</Text>
            </Text>
          </View>

          {h2hSummary.goalsPerMatch.length > 0 && (
            <View style={styles.chartBlock}>
              <Text style={styles.chartLabel}>
                Goles totales por partido (H2H más recientes)
              </Text>
              <TinyBars values={h2hSummary.goalsPerMatch} />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Dialog de descripciones */}
      <Portal>
        <Dialog visible={infoOpen} onDismiss={() => setInfoOpen(false)}>
          <Dialog.Title>Información</Dialog.Title>
          <Dialog.Content>
            <Text>{infoText}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInfoOpen(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 14, elevation: 3 },
  title: { fontWeight: "700", marginBottom: 8 },
  blockTitle: { fontWeight: "600", marginBottom: 6, marginTop: 6 },

  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rowLabel: { fontSize: 14, fontWeight: "600" },
  rowValue: { fontWeight: "700" },

  dualRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  dualChip: { marginRight: 6 },
  bold: { fontWeight: "700" },

  segmentedBar: {
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "#efefef",
  },
  segmentHome: { backgroundColor: "#43a047" },
  segmentAway: { backgroundColor: "#e53935" },
  segmentLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  segmentText: { fontSize: 12, fontWeight: "600" },

  tinyBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingVertical: 6,
  },
  tinyBarCol: { alignItems: "center", width: 20 },
  tinyBar: {
    width: 16,
    borderRadius: 4,
    backgroundColor: "#5e35b1",
  },
  tinyBarLabel: { fontSize: 10, marginTop: 2, color: "#555" },
  smallMuted: { fontSize: 12, color: "#666" },
  h2hChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  chip: {
    marginVertical: 4,
    paddingHorizontal: 6,
  },
  statBlock: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  subLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  chartBlock: {
    marginTop: 14,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#444",
    marginBottom: 6,
    textAlign: "center",
  },
});
