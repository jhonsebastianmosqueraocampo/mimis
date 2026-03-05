import { colors } from "@/theme/colors";
import { shadows } from "@/theme/shadows";
import { typography } from "@/theme/typography";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Divider, Text } from "react-native-paper";
import type { swiperItem } from "../types";

dayjs.extend(relativeTime);

type NextMatchProps = {
  homeTeam: swiperItem;
  awayTeam: swiperItem;
  datetime: string;
  stadium: string;
  referee: string;
  tournament: string;
  fixtureId: number;
  actionMatch: (id: string) => void;
};

export default function NextMatchBanner({
  homeTeam,
  awayTeam,
  datetime,
  stadium,
  referee,
  tournament,
  fixtureId,
  actionMatch,
}: NextMatchProps) {
  const matchDate = dayjs(datetime);
  const now = dayjs();
  const timeLeft = matchDate.isAfter(now)
    ? matchDate.fromNow(true)
    : "En curso o finalizado";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => actionMatch(fixtureId.toString())}
    >
      <Text variant="titleMedium" style={styles.title}>
        Próximo Partido
      </Text>

      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Avatar.Image
            style={{ backgroundColor: colors.background }}
            size={56}
            source={{ uri: homeTeam.img }}
          />
          <Text style={styles.teamName}>{homeTeam.title}</Text>
        </View>

        <Text variant="titleMedium" style={styles.vsText}>
          VS
        </Text>

        <View style={styles.team}>
          <Avatar.Image
            style={{ backgroundColor: colors.background }}
            size={56}
            source={{ uri: awayTeam.img }}
          />
          <Text style={styles.teamName}>{awayTeam.title}</Text>
        </View>
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

      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="trophy-outline"
          size={18}
          color={colors.textSecondary}
        />
        <Text>{tournament}</Text>
      </View>

      <View style={styles.timeLeftBox}>
        <Text style={styles.timeLeftText}>Faltan: {timeLeft}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: shadows.sm.shadowColor,
    elevation: 3,
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontWeight: "bold",
    color: colors.primary,
    fontFamily: typography.title.fontFamily,
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  team: {
    alignItems: "center",
  },
  teamName: {
    fontWeight: "600",
    fontFamily: typography.body.fontFamily,
    marginTop: 4,
  },
  vsText: {
    fontWeight: "bold",
    fontFamily: typography.body.fontFamily,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeLeftBox: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeLeftText: {
    color: colors.textOnPrimary,
    fontWeight: "bold",
    fontFamily: typography.body.fontFamily,
  },
});
