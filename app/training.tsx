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

export default function Training() {
  const { getFavorites, getVideoFromYoutube } = useFetch();
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [videosFavoritos, setVideosFavoritos] = useState<Record<string, Video[]>>({});
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
        const { success, teams, message } = await getFavorites();
        if (!isMounted) return;

        if (success) {
          setEquipos(teams);

          const favVideos: Record<string, Video[]> = {};
          const year = new Date().getFullYear();
          for (const team of teams) {
            const query = `${team.title} entrenamiento práctica training session preparación ${year} fútbol`;
            const { success, videos } = await getVideoFromYoutube(query);
            favVideos[team.title] = success ? videos.map(mapYoutubeToVideo) : [];
          }
          setVideosFavoritos(favVideos);

          const { success: ok, videos: generalVideos } =
            await getVideoFromYoutube("entrenamiento futbol equipos");
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
        {/* Favoritos */}
        {equipos.map((team) => (
          <View key={team.id} style={{ marginBottom: 20 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {team.title} - Entrenamientos
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videosFavoritos[team.title]?.map((video, idx) => (
                <Card
                  key={video.id}
                  style={{
                    width: width * 0.6,
                    marginRight: 12,
                    borderRadius: 12,
                  }}
                  onPress={() => handleOpenVideo(videosFavoritos[team.title], idx)}
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

        {/* Generales */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Entrenamientos en general
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

      {/* Modal con Scroll de videos */}
      <Modal visible={modalVideos.length > 0} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {/* Botón de cerrar */}
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

          {/* Scroll horizontal con videos */}
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