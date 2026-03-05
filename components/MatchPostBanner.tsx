import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Divider, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import type { RootStackParamList, swiperItem } from "../types";

type MatchPostBannerProps = {
  homeTeam: swiperItem;
  awayTeam: swiperItem;
  datetime: string;
  stadium: string;
  referee: string;
  tournament: string;
  tournamentId: string;
  result: string;
};

export default function MatchPostBanner({
  homeTeam,
  awayTeam,
  datetime,
  stadium,
  referee,
  tournament,
  tournamentId,
  result,
}: MatchPostBannerProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const matchDate = dayjs(datetime).format("dddd, D MMM YYYY - HH:mm");

  const actionTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  const actionLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Resultado del Partido
      </Text>

      {/* Equipos y marcador */}
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

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{result}</Text>
          <Text style={styles.finalLabel}>Finalizado</Text>
        </View>

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

      {/* Información del partido */}
      <View style={styles.infoRow}>
        <MaterialIcons name="schedule" size={18} color={colors.textSecondary} />
        <Text>{matchDate}</Text>
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
        <MaterialCommunityIcons
          name="whistle-outline"
          size={18}
          color={colors.textSecondary}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceVariant ?? colors.surface,
    shadowColor: shadows.sm.shadowColor,
    elevation: 3,
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    justifyContent: "center",
  },

  team: {
    alignItems: "center",
    width: 90,
  },

  teamName: {
    ...typography.small,
    fontWeight: "600",
    marginTop: spacing.xs ?? 4,
    textAlign: "center",
    color: colors.textPrimary,
  },

  scoreBox: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs ?? 6,
    alignItems: "center",
  },

  scoreText: {
    ...typography.titleLarge,
    fontWeight: "700",
  },

  finalLabel: {
    ...typography.small,
    opacity: 0.9,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
