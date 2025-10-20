import { useFetch } from "@/hooks/FetchContext";
import { LiveMatch } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Avatar, Chip, Text } from "react-native-paper";
import FixtureLineups from "./FixtureLineups";
import MatchAnalysisPost from "./MatchAnalysisPost";
import MatchPostBanner from "./MatchPostBanner";
import MatchPostStats from "./MatchPostStats";

const { height } = Dimensions.get("window");

const items = [
  { id: "1", name: "Estadísticas" },
  { id: "2", name: "Calificaciones" },
  { id: "3", name: "Análisis del partido" },
  { id: "4", name: "Goles" },
  { id: "5", name: "Resumen jugadas" },
];

// Mock temporal de ScoreBat (simula backend)
const mockVideos = [
  {
    id: "1",
    title: "Gol de Vinícius Jr (1-0)",
    thumbnail: "https://i.ytimg.com/vi/abcd1234/hqdefault.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    source: "ScoreBat Highlights",
  },
  {
    id: "2",
    title: "Gol de Lewandowski (1-1)",
    thumbnail: "https://i.ytimg.com/vi/efgh5678/hqdefault.jpg",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    source: "ScoreBat Highlights",
  },
  {
    id: "3",
    title: "Jugadas destacadas del partido",
    thumbnail: "https://i.ytimg.com/vi/ijkl9012/hqdefault.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    source: "ScoreBat Highlights",
  },
];

type MatchPostProps = {
  fixtureId: string;
};

export default function MatchPost({ fixtureId }: MatchPostProps) {
  const { getLiveMatch } = useFetch();
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [match, setMatch] = useState<LiveMatch>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    console.log(fixtureId)
    const loadFixture = async () => {
      try {
        const { success, live, message } = await getLiveMatch(fixtureId);
        console.log(live?.statistics)
        if (mounted) {
          if (success) setMatch(live!);
          else setError(message!);
        }
        setLoading(false)
      } catch {
        setError("Error al cargar el fixture");
      } finally {
        setLoading(false);
      }
    };
    loadFixture();
    return () => {
      mounted = false;
    };
  }, [fixtureId]);

  const goals = useMemo(
    () =>
      (match?.events || []).filter(
        (e) =>
          (e.type || "").toLowerCase() === "goal" ||
          (e.detail || "").toLowerCase().includes("goal")
      ),
    [match]
  );

  if (loading)
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {/* Banner final del partido */}
      <MatchPostBanner
        homeTeam={{
          id: match?.teams.home.id.toString() ?? "",
          title: match?.teams.home.name ?? "",
          img: match?.teams.home.logo ?? "",
          pathTo: "",
        }}
        awayTeam={{
          id: match?.teams.away.id.toString() ?? "",
          title: match?.teams.away.name ?? "",
          img: match?.teams.away.logo ?? "",
          pathTo: "",
        }}
        datetime={match?.fixture.date.toString() ?? ""}
        stadium={match?.fixture.venue.name ?? ""}
        referee={match?.fixture.referee ?? ""}
        tournament={match?.league.name ?? ""}
        tournamentId={match?.league.id.toString() ?? ""}
        result={`${match?.goals.home ?? 0} - ${match?.goals.away ?? 0}`}
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
        <MatchPostStats stats={match?.statistics!} />
      )}

      {selectedItem.name === "Calificaciones" && (
        <>
            <Text style={styles.placeholder}>
            📊 Calificaciones de jugadores
            </Text>
            <FixtureLineups fixtureId={fixtureId} events={match?.events} />
        </>
      )}

      {selectedItem.name === "Análisis del partido" && <MatchAnalysisPost />}

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
                      <Text style={styles.playerName}>{g.player?.name}</Text>
                    </View>

                    {g.assist?.name ? (
                      <Text style={styles.assistText}>
                        Asistencia: {g.assist.name}
                      </Text>
                    ) : null}

                    <Text style={styles.teamText}>{g.team?.name}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {selectedItem.name === "Resumen jugadas" && (
        <ScrollView style={{ flex: 1 }}>
          {mockVideos.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => setSelectedVideo(Number(v.id))}
            >
              <View style={styles.videoCard}>
                <Text style={styles.videoTitle}>{v.title}</Text>
                <Video
                  source={{ uri: v.videoUrl }}
                  style={styles.videoThumbnail}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Modal tipo TikTok / YouTube */}
      <Modal
        visible={selectedVideo !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            pagingEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ height: height * mockVideos.length }}
          >
            {mockVideos.map((v, index) => (
              <View key={v.id} style={{ height, justifyContent: "center" }}>
                <Video
                  source={{ uri: v.videoUrl }}
                  style={styles.fullVideo}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={selectedVideo === Number(v.id)}
                />
                <Text style={styles.modalTitle}>{v.title}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            onPress={() => setSelectedVideo(null)}
            style={styles.closeButton}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
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
