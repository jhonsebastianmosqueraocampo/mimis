import { useFetch } from "@/hooks/FetchContext";
import { AnalysisOpenAi, PreMatchStats } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";
import Loading from "./Loading";

type MatchAnalysisPreviewProps = {
  stats: PreMatchStats;
  fixtureId: string;
};

/**
 * IMPORTANT: Tu BD guarda charts así:
 * barCharts: [{ title, data: [{ team, shots }] }]
 * pieCharts: [{ title, data: [{ team, possession }] }]
 */
type BarChartDB = {
  title?: string;
  data?: { team?: string; shots?: number }[];
};
type PieChartDB = {
  title?: string;
  data?: { team?: string; possession?: number }[];
};

type ChartsDB = {
  barCharts?: BarChartDB[];
  pieCharts?: PieChartDB[];
  lineCharts?: any[];
  radarCharts?: any[];
  heatMaps?: any[];
};

const adaptBarCharts = (charts: any[] = []) =>
  charts.map((c) => ({
    title: c.title,
    data: Object.entries(c.data || {}).map(([team, shots]) => ({
      team,
      shots: Number(shots),
    })),
  }));

const adaptPieCharts = (charts: any[] = []) =>
  charts.map((c) => ({
    title: c.title,
    data: Object.entries(c.data || {}).map(([team, possession]) => ({
      team,
      possession: Number(possession),
    })),
  }));

export default function MatchAnalysisPreview({
  stats,
  fixtureId,
}: MatchAnalysisPreviewProps) {
  const { fixtureAnalysis } = useFetch();

  const [analysis, setAnalysis] = useState<AnalysisOpenAi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState({
    overview: true,
    summary: true,
    charts: true,
  });

  useEffect(() => {
    let isMounted = true;

    const getAnalysis = async () => {
      setLoading(true);
      setError(null);
      const referenceId = fixtureId + "_pre_match";
      try {
        const { success, analysis, message } = await fixtureAnalysis(
          stats,
          referenceId,
        );
        if (!isMounted) return;
        // console.log(analysis);
        if (success) setAnalysis(analysis ?? null);
        else {
          setAnalysis(null);
          setError(message ?? "No se pudo generar el análisis.");
        }
      } catch {
        if (isMounted) {
          setAnalysis(null);
          setError("Error al cargar/generar el análisis.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (fixtureId) getAnalysis();
    else {
      setAnalysis(null);
      setError("No hay fixtureId.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [fixtureId]);

  const generatedLabel = useMemo(() => {
    if (!analysis?.generatedAt) return null;
    return new Date(analysis.generatedAt).toLocaleString();
  }, [analysis?.generatedAt]);

  const summary = analysis?.summary;
  const charts = (analysis?.charts as unknown as ChartsDB) ?? {};

  const barCharts = useMemo(
    () => adaptBarCharts(charts.barCharts),
    [charts.barCharts],
  );

  const pieCharts = useMemo(
    () => adaptPieCharts(charts.pieCharts),
    [charts.pieCharts],
  );

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Generando análisis"
        subtitle="Esto puede tardar unos segundos…"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER limpio, legible */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content style={{ gap: 10 }}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Análisis previo</Text>
              <Text style={styles.headerSubtitle}>
                Resumen + puntos clave + comparativas rápidas
              </Text>
            </View>

            <IconButton icon="refresh" size={22} onPress={() => {}} />
          </View>

          <View style={styles.headerChips}>
            {summary?.title ? (
              <Chip icon="text-box-outline" compact>
                {summary.title}
              </Chip>
            ) : (
              <Chip icon="text-box-outline" compact>
                Sin título
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* ERROR */}
      {error ? (
        <Card style={styles.card} mode="elevated">
          <Card.Content style={{ gap: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>No se pudo cargar</Text>
              <Chip icon="alert-circle-outline" compact>
                Error
              </Chip>
            </View>
            <Text style={styles.body}>{error}</Text>
            <Button mode="contained" onPress={() => setLoading(true)}>
              Reintentar
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {/* CONTENT */}
      {!error && analysis ? (
        <>
          {/* TEXTO completo (colapsable) */}
          <SectionCard
            title="Vista general"
            subtitle="Texto completo del análisis"
            open={open.overview}
            onToggle={() => setOpen((p) => ({ ...p, overview: !p.overview }))}
          >
            <Text style={styles.body}>{analysis.text ?? ""}</Text>
          </SectionCard>

          {/* BLOQUES NO APRETADOS: en vertical */}
          <SectionCard
            title="Puntos clave"
            subtitle="Lo esencial en segundos"
            open={open.summary}
            onToggle={() => setOpen((p) => ({ ...p, summary: !p.summary }))}
          >
            <ListCard
              icon="check-circle-outline"
              title="Puntos clave"
              items={summary?.keyPoints}
              empty="No se generaron puntos clave."
            />

            <Divider style={{ marginVertical: 12 }} />

            <ListCard
              icon="arm-flex-outline"
              title="Fortalezas"
              items={summary?.strengths}
              empty="Sin fortalezas detectadas."
            />

            <Divider style={{ marginVertical: 12 }} />

            <ListCard
              icon="alert-circle-outline"
              title="Debilidades"
              items={summary?.weaknesses}
              empty="Sin debilidades detectadas."
            />

            <Divider style={{ marginVertical: 12 }} />

            <ListCard
              icon="target"
              title="Recomendaciones"
              items={summary?.recommendations}
              empty="Sin recomendaciones."
            />
          </SectionCard>

          {/* GRAFICAS adaptadas a tu BD */}
          {/* <SectionCard
            title="Comparativas"
            subtitle="Tiros y posesión (según lo guardado)"
            open={open.charts}
            onToggle={() => setOpen((p) => ({ ...p, charts: !p.charts }))}
          >
            {barCharts.length === 0 && pieCharts.length === 0 ? (
              <Text style={styles.muted}>No hay datos de comparativas.</Text>
            ) : (
              <View style={{ gap: 12 }}>
                {barCharts.map((c, idx) => (
                  <Card
                    key={`bar-${idx}`}
                    style={styles.innerCard}
                    mode="outlined"
                  >
                    <Card.Content style={{ gap: 10 }}>
                      <Text>{c.title ?? "Comparación"}</Text>
                      <ShotsCompare data={c.data} />
                    </Card.Content>
                  </Card>
                ))}

                {pieCharts.map((c, idx) => (
                  <Card
                    key={`pie-${idx}`}
                    style={styles.innerCard}
                    mode="outlined"
                  >
                    <Card.Content style={{ gap: 10 }}>
                      <Text>{c.title ?? "Distribución"}</Text>
                      <PossessionCompare data={c.data} />
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </SectionCard> */}
        </>
      ) : null}

      {!error && !analysis ? (
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>Sin análisis</Text>
            <Text style={styles.body}>
              No llegó contenido desde el backend.
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}

/* ------------------------- Section Card ------------------------- */

function SectionCard({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle ? (
              <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            ) : null}
          </View>
          <IconButton
            icon={open ? "chevron-up" : "chevron-down"}
            size={24}
            onPress={onToggle}
          />
        </View>

        {open ? (
          <>
            <Divider style={{ marginVertical: 12 }} />
            {children}
          </>
        ) : null}
      </Card.Content>
    </Card>
  );
}

/* ------------------------- ListCard (no apretado) ------------------------- */

function ListCard({
  title,
  items,
  empty,
  icon,
}: {
  title: string;
  items?: string[];
  empty: string;
  icon: string;
}) {
  const safe = Array.isArray(items) ? items : [];

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Chip icon={icon as any} compact>
          {title}
        </Chip>
      </View>

      {safe.length === 0 ? (
        <Text style={styles.muted}>{empty}</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {safe.map((t, i) => (
            <View key={`${title}-${i}`} style={styles.bulletRow}>
              <View style={styles.dot} />
              <Text style={[styles.body, { flex: 1 }]}>{t}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ------------------------- Charts (según BD) ------------------------- */

function ShotsCompare({
  data,
}: {
  data?: { team?: string; shots?: number }[];
}) {
  const rows = Array.isArray(data) ? data : [];
  if (!rows.length)
    return <Text style={styles.muted}>Sin datos de tiros.</Text>;

  const values = rows.map((r) => Number(r.shots) || 0);
  const max = Math.max(...values, 1);

  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, idx) => {
        const team = r.team ?? `Equipo ${idx + 1}`;
        const v = Number(r.shots) || 0;
        const w = (v / max) * 100;

        return (
          <View key={`${team}-${idx}`} style={{ gap: 6 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>{team}</Text>
              <Text style={styles.value}>{v.toFixed(1)} tiros</Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(6, w)}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PossessionCompare({
  data,
}: {
  data?: { team?: string; possession?: number }[];
}) {
  const rows = Array.isArray(data) ? data : [];
  if (!rows.length)
    return <Text style={styles.muted}>Sin datos de posesión.</Text>;

  // posesión ya viene como porcentaje, pero la normalizamos por si acaso
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, idx) => {
        const team = r.team ?? `Equipo ${idx + 1}`;
        const pct = clamp(Number(r.possession) || 0);

        return (
          <View key={`${team}-${idx}`} style={{ gap: 6 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>{team}</Text>
              <Text style={styles.value}>{pct.toFixed(1)}%</Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(6, pct)}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------- Styles (legible, sin “apretar”) ------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 40,
    gap: 12,
  },

  headerCard: {
    borderRadius: 18,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  headerChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  card: {
    borderRadius: 18,
    overflow: "hidden",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  sectionSubtitle: {
    marginTop: 2,
    opacity: 0.65,
  },

  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  muted: {
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 18,
  },
  value: {
    fontSize: 13,
    fontWeight: "800",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  innerCard: {
    borderRadius: 14,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: "rgba(60,130,255,0.95)",
  },

  track: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(60,130,255,0.85)",
  },
});
