import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Divider, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import type { RootStackParamList, swiperItem } from "../types";

dayjs.extend(relativeTime);

type MatchProps = {
  homeTeam: swiperItem;
  awayTeam: swiperItem;
  datetime: string;
  stadium: string;
  referee: string;
  tournament: string;
  tournamentId: string;
};

export default function MatchBanner({
  homeTeam,
  awayTeam,
  datetime,
  stadium,
  referee,
  tournament,
  tournamentId,
}: MatchProps) {
  const matchDate = dayjs(datetime);
  const now = dayjs();

  const isFuture = matchDate.isAfter(now);
  const isPast = matchDate.isBefore(now);

  // Si solo tienes fecha y no estado real, lo más seguro:
  const timeLabel = isFuture ? "Empieza en:" : "Estado:";
  const timeValue = isFuture ? matchDate.fromNow(true) : "En curso";

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const actionTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  const actionLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Detalle del Partido
      </Text>

      <View style={styles.teamsContainer}>
        <TouchableOpacity onPress={() => actionTeam(homeTeam.id)}>
          <View style={styles.team}>
            <Avatar.Image
              style={{ backgroundColor: "transparent" }}
              size={56}
              source={{ uri: homeTeam.img }}
            />
            <Text style={styles.teamName}>{homeTeam.title}</Text>
          </View>
        </TouchableOpacity>

        <Text variant="titleMedium" style={styles.vsText}>
          VS
        </Text>

        <TouchableOpacity onPress={() => actionTeam(awayTeam.id)}>
          <View style={styles.team}>
            <Avatar.Image
              style={{ backgroundColor: "transparent" }}
              size={56}
              source={{ uri: awayTeam.img }}
            />
            <Text style={styles.teamName}>{awayTeam.title}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Divider style={{ width: "100%", marginVertical: 8 }} />

      <View style={styles.infoRow}>
        <MaterialIcons
          name="access-time"
          size={18}
          color={colors.textSecondary}
        />
        <Text>{matchDate.format("dddd, D MMM YYYY - HH:mm")}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons
          name="location-on"
          size={18}
          color={colors.textSecondary}
        />
        <Text>{stadium}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="person" size={18} color={colors.textSecondary} />
        <Text>Árbitro: {referee}</Text>
      </View>

      <TouchableOpacity onPress={() => actionLeague(tournamentId)}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text>{tournament}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.timeLeftBox}>
        <Text style={styles.timeLeftText}>
          {timeLabel} {timeValue}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    shadowColor: shadows.sm.shadowColor,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
    gap: spacing.sm,
  },

  title: {
    ...typography.title,
    fontWeight: "700",
    color: colors.primary,
  },

  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },

  team: {
    alignItems: "center",
  },

  teamName: {
    ...typography.body,
    fontWeight: "600",
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },

  vsText: {
    ...typography.title,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  timeLeftBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },

  timeLeftText: {
    ...typography.small,
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
});
