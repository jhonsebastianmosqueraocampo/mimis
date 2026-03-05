import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { AnalysisOpenAi, PreMatchStats } from "@/types";
import React, { useEffect, useState } from "react";
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

  const summary = analysis?.summary;

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

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },

  headerCard: {
    borderRadius: radius.xl ?? 18,
    overflow: "hidden",
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  headerTitle: {
    ...typography.titleLarge,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  headerSubtitle: {
    ...typography.small,
    marginTop: spacing.xs ?? 4,
    opacity: 0.7,
    color: colors.textSecondary,
  },

  headerChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  card: {
    borderRadius: radius.xl ?? 18,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },

  sectionTitle: {
    ...typography.body,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    ...typography.small,
    marginTop: spacing.xs ?? 2,
    opacity: 0.65,
    color: colors.textSecondary,
  },

  body: {
    ...typography.body,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  muted: {
    ...typography.small,
    opacity: 0.7,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  value: {
    ...typography.small,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },

  innerCard: {
    borderRadius: radius.lg ?? 14,
    backgroundColor: colors.surface,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.round,
    marginTop: spacing.xs ?? 6,
    backgroundColor: colors.primary,
  },

  track: {
    height: 10,
    borderRadius: radius.round,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },

  fill: {
    height: "100%",
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },
});
