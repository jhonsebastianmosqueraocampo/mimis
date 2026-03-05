import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Divider, Title } from "react-native-paper";
import { WebView } from "react-native-webview";

export type Goal = {
  team: "home" | "away";
  scorer: string;
  minute: number;
  videoUrl?: string;
};

type GoalTimelineProps = {
  homeTeam: string;
  awayTeam: string;
  goals: Goal[];
};

export default function GoalTimeline({
  homeTeam,
  awayTeam,
  goals,
}: GoalTimelineProps) {
  const homeGoals = goals.filter((g) => g.team === "home");
  const awayGoals = goals.filter((g) => g.team === "away");
  const cardWidth = (Dimensions.get("window").width - 64) / 2;

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>⚽ Goles del partido</Title>
      <View style={styles.goalsRow}>
        {/* Goles del local */}
        <View style={[styles.column, { minWidth: cardWidth }]}>
          <Text style={styles.teamTitle}>{homeTeam}</Text>
          <Divider style={styles.divider} />
          {homeGoals.map((goal, i) => (
            <View key={i} style={styles.goalItem}>
              <Text style={styles.goalText}>
                {goal.minute}' - {goal.scorer}
              </Text>
              {goal.videoUrl && (
                <Card style={styles.videoCard}>
                  <WebView
                    source={{ uri: goal.videoUrl }}
                    style={styles.webview}
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                  />
                </Card>
              )}
            </View>
          ))}
        </View>

        {/* Goles del visitante */}
        <View style={[styles.column, { minWidth: cardWidth }]}>
          <Text style={styles.teamTitle}>{awayTeam}</Text>
          <Divider style={styles.divider} />
          {awayGoals.map((goal, i) => (
            <View key={i} style={styles.goalItem}>
              <Text style={styles.goalText}>
                {goal.minute}' - {goal.scorer}
              </Text>
              {goal.videoUrl && (
                <Card style={styles.videoCard}>
                  <WebView
                    source={{ uri: goal.videoUrl }}
                    style={styles.webview}
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                  />
                </Card>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
  },

  title: {
    ...typography.title,
    marginBottom: spacing.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  goalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  column: {
    flex: 1,
  },

  teamTitle: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: spacing.xs ?? 4,
    color: colors.textPrimary,
  },

  divider: {
    marginBottom: spacing.xs,
  },

  goalItem: {
    marginBottom: spacing.md,
  },

  goalText: {
    ...typography.small,
    color: colors.textSecondary,
  },

  videoCard: {
    marginTop: spacing.xs,
    height: 180,
    overflow: "hidden",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },

  webview: {
    flex: 1,
  },
});
