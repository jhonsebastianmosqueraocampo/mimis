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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        <MaterialIcons name="schedule" size={18} color="#555" />
        <Text>{matchDate}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={18} color="#555" />
        <Text>{stadium}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="whistle-outline" size={18} color="#555" />
        <Text>Árbitro: {referee}</Text>
      </View>

      <TouchableOpacity onPress={() => actionLeague(tournamentId)}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="trophy-outline" size={18} color="#555" />
          <Text>{tournament}</Text>
        </View>
      </TouchableOpacity>
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
    marginBottom: 16,
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
    justifyContent: "center",
  },
  team: {
    alignItems: "center",
    width: 90,
  },
  teamName: {
    fontWeight: "600",
    fontFamily: "goli",
    marginTop: 4,
    textAlign: "center",
  },
  scoreBox: {
    backgroundColor: "#1DB954",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: "center",
  },
  scoreText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    fontFamily: "liter",
  },
  finalLabel: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
