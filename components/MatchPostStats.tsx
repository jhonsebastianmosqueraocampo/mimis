import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { TeamStatistics } from "@/types";
import React from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text } from "react-native-paper";

type MatchPostStatsProps = {
  stats: TeamStatistics[];
};

export default function MatchPostStats({ stats }: MatchPostStatsProps) {
  if (!stats || stats.length < 2) return null;

  const [home, away] = stats;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Equipos encabezado */}
      <View style={styles.teamsHeader}>
        <View style={styles.teamBlock}>
          <Avatar.Image
            source={{ uri: home.team.logo }}
            size={56}
            style={{ backgroundColor: colors.background }}
          />
          <Text style={styles.teamName}>{home.team.name}</Text>
        </View>

        <View>
          <Text style={styles.vsLabel}>ESTADÍSTICAS</Text>
        </View>

        <View style={styles.teamBlock}>
          <Avatar.Image
            source={{ uri: away.team.logo }}
            size={56}
            style={{ backgroundColor: colors.background }}
          />
          <Text style={styles.teamName}>{away.team.name}</Text>
        </View>
      </View>

      {/* Lista de estadísticas */}
      <View style={{ marginTop: 16 }}>
        {home.statistics.map((stat, idx) => {
          const awayStat = away.statistics.find((s) => s.type === stat.type);
          if (!awayStat) return null;

          const homeValue = parseValue(stat.value);
          const awayValue = parseValue(awayStat.value);
          const maxValue = homeValue + awayValue || 1;

          const homePercent = (homeValue / maxValue) * 100;
          const awayPercent = (awayValue / maxValue) * 100;

          return (
            <View key={idx} style={styles.row}>
              <Text style={[styles.valueText, { textAlign: "left" }]}>
                {formatValue(stat.value)}
              </Text>

              <View style={styles.barContainer}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      width: `${homePercent}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      width: `${awayPercent}%`,
                      backgroundColor: colors.error,
                      alignSelf: "flex-end",
                    },
                  ]}
                />
                <Text style={styles.statType}>{stat.type}</Text>
              </View>

              <Text style={[styles.valueText, { textAlign: "right" }]}>
                {formatValue(awayStat.value)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={{ marginVertical: 24, alignItems: "center" }}>
        <AdBanner />
      </View>
    </ScrollView>
  );
}

/* ---------------------- Helpers ---------------------- */

const parseValue = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string" && value.includes("%"))
    return parseFloat(value.replace("%", ""));
  return Number(value) || 0;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

/* ---------------------- Styles ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },

  teamsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  teamBlock: {
    alignItems: "center",
    width: "30%",
  },

  teamName: {
    ...typography.small,
    fontWeight: "600",
    textAlign: "center",
    color: colors.textPrimary,
    marginTop: spacing.xs ?? 4,
  },

  vsLabel: {
    ...typography.body,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },

  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: colors.border,
    borderRadius: radius.round,
    overflow: "hidden",
    justifyContent: "center",
  },

  bar: {
    height: "100%",
    position: "absolute",
    borderRadius: radius.round,
  },

  statType: {
    position: "absolute",
    alignSelf: "center",
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: "500",
  },

  valueText: {
    width: 36,
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
