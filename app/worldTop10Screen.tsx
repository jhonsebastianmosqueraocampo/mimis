import WorldVideoFeed from "@/components/worldVideoFeed";
import { useFetch } from "@/hooks/FetchContext";
import { WeeklyWorldTopVideo } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Menu, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function WorldTop10Screen() {
  const { getVideosWorldTop10 } = useFetch();
  const [videos, setVideos] = useState<WeeklyWorldTopVideo[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [openFeed, setOpenFeed] = useState(false);
  const [initialVideo, setInitialVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const getVideos = async () => {
      setLoading(true);
      try {
        const { videos, success, message } = await getVideosWorldTop10();
        if (!isMounted) return;

        if (success) {
          setVideos(videos);
        } else {
          setMessage(message!);
        }
      } catch (err) {
        if (isMounted) setMessage("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const allWeeks = useMemo(
    () =>
      Array.from(new Set(videos.map((v) => v.week))).sort((a, b) =>
        b.localeCompare(a)
      ),
    []
  );

  const filtered =
    selectedWeek === null
      ? videos
      : videos.filter((v) => v.week === selectedWeek);

  return (
    <PrivateLayout>
      <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 10 }}>
          🌍 Top 10 Goles del Mundo
        </Text>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="calendar"
            >
              {selectedWeek ? `Semana: ${selectedWeek}` : "Todas las semanas"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedWeek(null);
              setMenuVisible(false);
            }}
            title="Todas las semanas"
          />
          {allWeeks.map((w) => (
            <Menu.Item
              key={w}
              onPress={() => {
                setSelectedWeek(w);
                setMenuVisible(false);
              }}
              title={w}
            />
          ))}
        </Menu>

        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            paddingTop: 16,
          }}
        >
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                width: "48%",
                borderRadius: 10,
                overflow: "hidden",
              }}
              onPress={() => {
                setInitialVideo(item.id);
                setOpenFeed(true);
              }}
            >
              <Image
                source={{ uri: item.thumbail }}
                style={{ width: "100%", height: 180 }}
              />
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  alignItems: "center",
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: "white" }}>{item.week}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {openFeed && initialVideo && (
          <WorldVideoFeed
            videos={filtered}
            initialVideoId={initialVideo}
            onClose={() => setOpenFeed(false)}
          />
        )}
      </View>
    </PrivateLayout>
  );
}
