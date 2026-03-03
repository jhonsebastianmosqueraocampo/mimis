import AdBanner from "@/services/ads/AdBanner";
import { LiveMatch, RootStackParamList } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Chip, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import FixtureAnalysis from "./FixtureAnalysis";
import FixtureLineups from "./FixtureLineups";
import MatchPostBanner from "./MatchPostBanner";
import MatchPostStats from "./MatchPostStats";
import MatchPostVideos from "./MatchPostVideos";

const items = [
  { id: "1", name: "Estadísticas" },
  { id: "2", name: "Calificaciones" },
  { id: "3", name: "Análisis del partido" },
  { id: "4", name: "Goles" },
  { id: "5", name: "Resumen jugadas" },
];

type MatchPostProps = {
  fixtureId: string;
  liveMatchFixture: LiveMatch;
};

export default function MatchPost({
  fixtureId,
  liveMatchFixture,
}: MatchPostProps) {
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goals = useMemo(
    () =>
      (liveMatchFixture?.events || []).filter(
        (e) =>
          (e.type || "").toLowerCase() === "goal" ||
          (e.detail || "").toLowerCase().includes("goal"),
      ),
    [liveMatchFixture],
  );

  const handlePlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 2 }}>
      <MatchPostBanner
        homeTeam={{
          id: liveMatchFixture?.teams.home.id.toString() ?? "",
          title: liveMatchFixture?.teams.home.name ?? "",
          img: liveMatchFixture?.teams.home.logo ?? "",
          pathTo: "",
        }}
        awayTeam={{
          id: liveMatchFixture?.teams.away.id.toString() ?? "",
          title: liveMatchFixture?.teams.away.name ?? "",
          img: liveMatchFixture?.teams.away.logo ?? "",
          pathTo: "",
        }}
        datetime={liveMatchFixture?.fixture.date.toString() ?? ""}
        stadium={liveMatchFixture?.fixture.venue.name ?? ""}
        referee={liveMatchFixture?.fixture.referee ?? ""}
        tournament={liveMatchFixture?.league.name ?? ""}
        tournamentId={liveMatchFixture?.league.id.toString() ?? ""}
        result={`${liveMatchFixture?.goals.home ?? 0} - ${liveMatchFixture?.goals.away ?? 0}`}
      />

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={{ marginVertical: 16 }}
      >
        {items.map((item) => (
          <Chip
            key={item.id}
            onPress={() => setSelectedItem(item)}
            mode={selectedItem.id === item.id ? "flat" : "outlined"}
            style={{
              backgroundColor:
                selectedItem.id === item.id ? "#1DB954" : "transparent",
              borderColor: "#1DB954",
              marginRight: 8,
            }}
            textStyle={{
              color: selectedItem.id === item.id ? "#fff" : "#000",
            }}
          >
            {item.name.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      {/* Contenido dinámico */}
      {selectedItem.name === "Estadísticas" && (
        <MatchPostStats stats={liveMatchFixture?.statistics!} />
      )}

      {selectedItem.name === "Calificaciones" && (
        <>
          <Text style={styles.placeholder}>📊 Calificaciones de jugadores</Text>
          <FixtureLineups
            events={liveMatchFixture?.events}
            status={liveMatchFixture?.status!}
            fixtureId={fixtureId}
          />
        </>
      )}

      {selectedItem.name === "Análisis del partido" && (
        <FixtureAnalysis
          fixtureId={fixtureId}
          stats={liveMatchFixture?.statistics}
        />
      )}

      {selectedItem.name === "Goles" && (
        <View style={styles.container}>
          {goals.map((g, i) => (
            <View key={i} style={styles.itemRow}>
              {/* Línea vertical de tiempo */}
              <View style={styles.timeline}>
                <View style={styles.timelineDot} />
                {i !== goals.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Contenido del evento */}
              <View style={styles.content}>
                {/* Minuto */}
                <Text style={styles.minute}>
                  {g.time.elapsed}
                  {g.time.extra ? `+${g.time.extra}` : ""}'
                </Text>

                {/* Detalle del evento */}
                <View style={styles.eventRow}>
                  <Avatar.Image
                    size={28}
                    source={{ uri: g.team?.logo }}
                    style={{ backgroundColor: "transparent", marginRight: 6 }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.playerRow}>
                      <MaterialCommunityIcons
                        name={
                          g.detail?.includes("Own")
                            ? "soccer"
                            : g.detail?.includes("Penalty")
                              ? "soccer"
                              : "soccer"
                        }
                        size={16}
                        color={
                          g.detail?.includes("Own")
                            ? "#e53935"
                            : g.detail?.includes("Penalty")
                              ? "#1976D2"
                              : "#1B5E20"
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={styles.playerName}
                        onPress={() =>
                          handlePlayer(g.player!.id!.toString() ?? "")
                        }
                      >
                        {g.player?.name}
                      </Text>
                    </View>

                    {g.assist?.name ? (
                      <Text
                        style={styles.assistText}
                        onPress={() => handlePlayer(g.assist!.id!.toString())}
                      >
                        Asistencia: {g.assist.name}
                      </Text>
                    ) : null}

                    <Text style={styles.teamText}>{g.team?.name}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          <View style={{ marginVertical: 24, alignItems: "center" }}>
            <AdBanner />
          </View>
        </View>
      )}

      {selectedItem.name === "Resumen jugadas" && (
        <ScrollView style={{ flex: 1 }}>
          <MatchPostVideos
            teamA={liveMatchFixture?.teams.home.name!}
            teamB={liveMatchFixture?.teams.away.name!}
            query={`${liveMatchFixture?.teams.home.name!} vs ${liveMatchFixture?.teams.away.name!} resumen partido highlights ${new Date(
              liveMatchFixture?.fixture.date!,
            )
              .getFullYear()
              .toString()} -reaction -eafc -fifa -game`}
            season={new Date(liveMatchFixture?.fixture.date!)
              .getFullYear()
              .toString()}
          />
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipScroll: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  placeholder: {
    textAlign: "center",
    marginVertical: 16,
    fontWeight: "500",
  },
  videoCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  videoThumbnail: {
    width: "100%",
    height: 220,
  },
  videoTitle: {
    padding: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullVideo: {
    width: "100%",
    height: "100%",
  },
  modalTitle: {
    position: "absolute",
    bottom: 60,
    color: "#fff",
    textAlign: "center",
    width: "100%",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
  },
  container: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  emptyText: {
    color: "gray",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timeline: {
    width: 16,
    alignItems: "center",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1DB954",
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#ddd",
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 8,
  },
  minute: {
    fontWeight: "bold",
    color: "#1B5E20",
    fontSize: 13,
    marginBottom: 4,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerName: {
    fontWeight: "600",
    fontSize: 13,
    color: "#222",
  },
  assistText: {
    color: "#555",
    fontSize: 12,
  },
  teamText: {
    color: "#777",
    fontSize: 12,
  },
});
