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
  const timeLeft = matchDate.isAfter(now)
    ? matchDate.fromNow(true)
    : "En curso";

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
        <MaterialIcons name="access-time" size={18} color="#555" />
        <Text>{matchDate.format("dddd, D MMM YYYY - HH:mm")}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={18} color="#555" />
        <Text>{stadium}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="person" size={18} color="#555" />
        <Text>Árbitro: {referee}</Text>
      </View>

      <TouchableOpacity onPress={() => actionLeague(tournamentId)}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={18}
            color="#555"
          />
          <Text>{tournament}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.timeLeftBox}>
        <Text style={styles.timeLeftText}>Faltan: {timeLeft}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    elevation: 3,
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontWeight: "bold",
    color: "#1DB954",
    fontFamily: "goli",
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
    fontFamily: "goli",
    marginTop: 4,
  },
  vsText: {
    fontWeight: "bold",
    fontFamily: "goli",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeLeftBox: {
    marginTop: 12,
    backgroundColor: "#1DB954",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeLeftText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "liter",
  },
});
