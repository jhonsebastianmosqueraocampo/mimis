import WeeklyVideoFeed from "@/components/WeeklyVideoFeed";
import { useFetch } from "@/hooks/FetchContext";
import { WeeklyGoalVideo } from "@/types";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Chip, Divider, Menu, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PrivateLayout from "./privateLayout";

export default function WeekResumeVideos() {
  const { getSyntheticVideo } = useFetch();
  const [mode, setMode] = useState<"view" | "vote">("view");
  const [openFeed, setOpenFeed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WeeklyGoalVideo | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [videosWeek, setVideosWeek] = useState<WeeklyGoalVideo[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 📅 Calcular último domingo (formato YYYY/MM/DD)
  const getLastSunday = () => {
    const today = new Date();
    const day = today.getDay(); // domingo = 0
    const diff = day === 0 ? 0 : day;
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - diff);
    const y = lastSunday.getFullYear();
    const m = String(lastSunday.getMonth() + 1).padStart(2, "0");
    const d = String(lastSunday.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  };

  // 📅 Generar lista de últimos 6 domingos
  const getLastSundays = (count: number = 6) => {
    const sundays: string[] = [];
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 0 : day;
    let current = new Date(today);
    current.setDate(today.getDate() - diff); // último domingo

    for (let i = 0; i < count; i++) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      sundays.push(`${y}/${m}/${d}`);
      current.setDate(current.getDate() - 7); // restar una semana
    }

    return sundays;
  };

  useEffect(() => {
    const week = getLastSunday();
    setSelectedWeek(week);
    setAvailableWeeks(getLastSundays());
    fetchVideos(week);
  }, []);

  //Obtener videos del backend
  const fetchVideos = async (week: string) => {
    setLoading(true);
    setMessage("");
    try {
      const { videos, success, message } = await getSyntheticVideo(week);
      if (success) {
        setVideosWeek(videos);
      } else {
        setMessage(message || "No se pudieron obtener los videos");
      }
    } catch {
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  //Verificar si la semana está dentro del rango de votación (domingo actual → próximo domingo)
  const isVoteActive = (weekStr: string) => {
    const [y, m, d] = weekStr.split("/").map(Number);
    const sunday = new Date(y, m - 1, d);
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);
    const now = new Date();
    return now >= sunday && now < nextSunday;
  };

  // Ordenar videos si es modo voto
  const sortedVideos =
    mode === "vote"
      ? [...videosWeek].sort((a, b) => b.favorites - a.favorites)
      : videosWeek;

  const handleSelectVideo = (video: WeeklyGoalVideo) => {
    setSelectedVideo(video);
    setOpenFeed(true);
  };

  return (
    <PrivateLayout>
      <View style={{ flex: 1, padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 10 }}>
          🏆 Top 10 Goles Semanales
        </Text>

        {/* Chips de modo */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <Chip
            selected={mode === "view"}
            onPress={() => setMode("view")}
            icon="star"
          >
            Mejores goles
          </Chip>
          {isVoteActive(selectedWeek) && (
            <Chip
              selected={mode === "vote"}
              onPress={() => setMode("vote")}
              icon="heart"
            >
              Votar
            </Chip>
          )}
        </View>

        {/* Selector de semana */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="calendar"
            >
              Semana: {selectedWeek}
            </Button>
          }
        >
          {availableWeeks.map((w) => (
            <Menu.Item
              key={w}
              onPress={() => {
                setSelectedWeek(w);
                fetchVideos(w);
                setMenuVisible(false);
              }}
              title={w}
            />
          ))}
        </Menu>

        <Divider style={{ marginVertical: 10 }} />

        {/* GRID - dos columnas con scroll */}
        {loading ? (
          <Text>Cargando videos...</Text>
        ) : videosWeek.length === 0 ? (
          <Text>No hay videos para esta semana</Text>
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {sortedVideos.map((item) => {
              const videoId = item.video.includes("youtube.com")
                ? item.video.split("v=")[1]
                : "";
              const thumbnail = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : item.thumbail;

              const isWinner =
                mode === "view" &&
                item.favorites ===
                  Math.max(...videosWeek.map((v) => v.favorites));

              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    width: "48%",
                    marginBottom: 12,
                    borderRadius: 10,
                    overflow: "hidden",
                    borderWidth: isWinner ? 3 : 0,
                    borderColor: isWinner ? "#FFD700" : "transparent",
                  }}
                  onPress={() => handleSelectVideo(item)}
                >
                  <Image
                    source={{ uri: thumbnail }}
                    style={{ width: "100%", height: 180 }}
                  />

                  {/* 👁️ Badges de vistas y likes */}
                  {/* 👁️ Views */}
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12 }}>
                      👁 {item.views}
                    </Text>
                  </View>

                  {/* ❤️ Favorite del usuario */}
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon
                      name={item.isFavorite ? "heart" : "heart-outline"}
                      size={18}
                      color={item.isFavorite ? "#ff3366" : "#ffffffaa"}
                    />
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {item.favorites}
                    </Text>
                  </View>

                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      width: "100%",
                      paddingVertical: 4,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 14 }}>
                      {item.user?.name ?? ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Modal del feed */}
        {openFeed && selectedVideo && (
          <WeeklyVideoFeed
            videos={sortedVideos}
            mode={mode}
            initialVideoId={selectedVideo.id}
            onClose={() => setOpenFeed(false)}
          />
        )}

        {message ? (
          <Text style={{ color: "orange", marginTop: 10 }}>{message}</Text>
        ) : null}
      </View>
    </PrivateLayout>
  );
}
