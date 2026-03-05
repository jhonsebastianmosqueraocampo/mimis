import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { Fixture } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Card } from "react-native-paper";

dayjs.extend(relativeTime);

type FriendlyMatchesListProps = {
  standings: Fixture[];
  teamId?: string;
};

export default function FriendlyMatches({
  standings,
  teamId,
}: FriendlyMatchesListProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: 16 }}>
        {standings.map((match) => {
          const isHome = match.teams.home.id.toString() == teamId;
          const matchStart = dayjs(match.date);
          const matchEnd = matchStart.add(3, "hour");
          const now = dayjs();

          const formattedDate = matchStart.format("DD MMM YYYY, HH:mm");
          const borderColor = isHome ? "#1DB954" : "#F78E4F";
          const tagColor = borderColor;

          // Lógica para mostrar estado del partido
          let displayTime = "";
          let showScore = false;

          if (now.isAfter(matchEnd)) {
            displayTime = `Terminó ${matchStart.fromNow()}`;
            showScore = true;
          } else if (now.isAfter(matchStart) && now.isBefore(matchEnd)) {
            const minutes = now.diff(matchStart, "minute");
            displayTime = `En curso (${minutes}′)`;
            showScore = true;
          } else {
            displayTime = `Comienza ${matchStart.fromNow()}`;
          }

          return (
            <Card
              key={match.fixtureId}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderLeftColor: borderColor,
                },
              ]}
              elevation={2}
            >
              <View style={styles.header}>
                <Text style={[styles.dateText, { color: borderColor }]}>
                  {formattedDate}
                </Text>
                <Text style={[styles.tag, { color: tagColor }]}>
                  {match.league.name}
                </Text>
              </View>

              <View style={styles.teams}>
                <View style={styles.team}>
                  <Avatar.Image
                    style={{ backgroundColor: "transparent" }}
                    size={42}
                    source={{ uri: match.teams.home.logo }}
                  />
                  <Text style={styles.teamName}>{match.teams.home.name}</Text>
                </View>

                <View style={styles.scoreBox}>
                  {showScore ? (
                    <Text style={[styles.scoreText, { color: borderColor }]}>
                      {match.goals.home} - {match.goals.away}
                    </Text>
                  ) : (
                    <Text style={[styles.vs, { color: borderColor }]}>VS</Text>
                  )}
                </View>

                <View style={styles.team}>
                  <Avatar.Image
                    style={{ backgroundColor: "transparent" }}
                    size={42}
                    source={{ uri: match.teams.away.logo }}
                  />
                  <Text style={styles.teamName}>{match.teams.away.name}</Text>
                </View>
              </View>

              <Text style={styles.stadiumText}>{match.venue.name}</Text>
              <Text style={styles.timeUntil}>{displayTime}</Text>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  scrollArea: {
    paddingRight: spacing.xs ?? 4,
  },

  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 5,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  dateText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  tag: {
    ...typography.small,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.primary,
  },

  teams: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  team: {
    alignItems: "center",
    width: 90,
  },

  teamName: {
    ...typography.small,
    marginTop: spacing.xs ?? 6,
    textAlign: "center",
    color: colors.textPrimary,
  },

  scoreBox: {
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  vs: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  stadiumText: {
    ...(typography.subtitle ?? typography.small),
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xs ?? 4,
  },

  timeUntil: {
    ...(typography.subtitle ?? typography.small),
    color: colors.textSecondary,
    textAlign: "center",
  },
});
