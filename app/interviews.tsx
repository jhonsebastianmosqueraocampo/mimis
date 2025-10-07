import { useFetch } from "@/hooks/FetchContext";
import { swiperItem } from "@/types";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Card,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";
import { WebView } from "react-native-webview";
import PrivateLayout from "./privateLayout";

const { width, height } = Dimensions.get("window");

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};

type VideoYoutube = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnail: string;
};

export default function Interviews() {
  const { getFavorites, getVideoFromYoutube } = useFetch();
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [videosEquipos, setVideosEquipos] = useState<Record<string, Video[]>>({});
  const [videosJugadores, setVideosJugadores] = useState<Record<string, Video[]>>({});
  const [videosGenerales, setVideosGenerales] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalVideos, setModalVideos] = useState<Video[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  const mapYoutubeToVideo = (yt: VideoYoutube): Video => ({
    id: yt.videoId,
    title: yt.title,
    thumbnail: yt.thumbnail,
    url: `https://www.youtube.com/watch?v=${yt.videoId}`,
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const { success, teams, players, message } = await getFavorites();
        if (!isMounted) return;

        if (success) {
          setEquipos(teams);
          setJugadores(players);

          // 🔹 Videos por equipo
          const eqVideos: Record<string, Video[]> = {};
          for (const team of teams) {
            const query = `${team.title} entrevista futbol`;
            const { success, videos } = await getVideoFromYoutube(query);
            eqVideos[team.title] = success ? videos.map(mapYoutubeToVideo) : [];
          }
          setVideosEquipos(eqVideos);

          // 🔹 Videos por jugador
          const plVideos: Record<string, Video[]> = {};
          for (const player of players) {
            const query = `${player.title} entrevista futbol`;
            const { success, videos } = await getVideoFromYoutube(query);
            plVideos[player.title] = success ? videos.map(mapYoutubeToVideo) : [];
          }
          setVideosJugadores(plVideos);

          // 🔹 Generales
          const { success: ok, videos: generalVideos } =
            await getVideoFromYoutube("entrevista futbol jugadores equipos");
          setVideosGenerales(ok ? generalVideos.map(mapYoutubeToVideo) : []);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar videos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenVideo = (videos: Video[], index: number) => {
    setModalVideos(videos);
    setStartIndex(index);
  };

  if (loading) {
    return (
      <PrivateLayout>
        <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <Text style={{ color: "red", margin: 20 }}>{error}</Text>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* 🔹 Sección entrevistas de equipos */}
        {equipos.map((team) => (
          <View key={team.id} style={{ marginBottom: 20 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {team.title} - Entrevistas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {videosEquipos[team.title]?.map((video, idx) => (
                <Card
                  key={video.id}
                  style={{
                    width: width * 0.6,
                    marginRight: 12,
                    borderRadius: 12,
                  }}
                  onPress={() => handleOpenVideo(videosEquipos[team.title], idx)}
                >
                  <Card.Cover source={{ uri: video.thumbnail }} />
                  <Card.Content>
                    <Text variant="bodyMedium" numberOfLines={2}>
                      {video.title}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
            <Divider style={{ marginVertical: 12 }} />
          </View>
        ))}

        {/* 🔹 Sección entrevistas de jugadores */}
        {jugadores.map((player) => (
          <View key={player.id} style={{ marginBottom: 20 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {player.title} - Entrevistas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {videosJugadores[player.title]?.map((video, idx) => (
                <Card
                  key={video.id}
                  style={{
                    width: width * 0.6,
                    marginRight: 12,
                    borderRadius: 12,
                  }}
                  onPress={() => handleOpenVideo(videosJugadores[player.title], idx)}
                >
                  <Card.Cover source={{ uri: video.thumbnail }} />
                  <Card.Content>
                    <Text variant="bodyMedium" numberOfLines={2}>
                      {video.title}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
            <Divider style={{ marginVertical: 12 }} />
          </View>
        ))}

        {/* 🔹 Entrevistas generales */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Entrevistas en general
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {videosGenerales.map((video, idx) => (
            <Card
              key={video.id}
              style={{
                width: width * 0.6,
                marginRight: 12,
                borderRadius: 12,
              }}
              onPress={() => handleOpenVideo(videosGenerales, idx)}
            >
              <Card.Cover source={{ uri: video.thumbnail }} />
              <Card.Content>
                <Text variant="bodyMedium" numberOfLines={2}>
                  {video.title}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </ScrollView>

      {/* 🔹 Modal scroll horizontal con entrevistas */}
      <Modal visible={modalVideos.length > 0} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {/* Cerrar */}
          <View
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: 24,
              padding: 4,
            }}
          >
            <IconButton
              icon="close"
              size={28}
              iconColor="#fff"
              onPress={() => setModalVideos([])}
            />
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: startIndex * width, y: 0 }}
          >
            {modalVideos.map((video) => (
              <View key={video.id} style={{ width, height }}>
                <WebView
                  source={{ uri: `https://www.youtube.com/embed/${video.id}` }}
                  style={{ flex: 1 }}
                  javaScriptEnabled
                  allowsFullscreenVideo
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </PrivateLayout>
  );
}