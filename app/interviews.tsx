import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { swiperItem } from "@/types";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Linking, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  Text,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

const { width } = Dimensions.get("window");

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

type FilterType = "favorites" | "general";

export default function Interviews() {
  const { getFavorites, getVideoFromYoutube } = useFetch();
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [videosEquipos, setVideosEquipos] = useState<Record<string, Video[]>>(
    {},
  );
  const [videosJugadores, setVideosJugadores] = useState<
    Record<string, Video[]>
  >({});
  const [videosGenerales, setVideosGenerales] = useState<Video[]>([]);
  const [filter, setFilter] = useState<FilterType>("favorites");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapYoutubeToVideo = (yt: VideoYoutube): Video => ({
    id: yt.videoId,
    title: yt.title,
    thumbnail: yt.thumbnail,
    url: `https://www.youtube.com/watch?v=${yt.videoId}`,
  });

  const openYoutubeApp = async (videoId: string) => {
    const appUrl = `vnd.youtube://${videoId}`;
    const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl); // 📱 Abre app YouTube
      } else {
        await Linking.openURL(webUrl); // 🌐 Fallback navegador
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el video");
    }
  };

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
          const year = new Date().getFullYear();
          for (const team of teams) {
            const query = `${team.title} entrevista post partido declaraciones rueda de prensa ${year} fútbol`;
            const { success, videos } = await getVideoFromYoutube(query);
            eqVideos[team.title] = success ? videos.map(mapYoutubeToVideo) : [];
          }
          setVideosEquipos(eqVideos);

          // 🔹 Videos por jugador
          const plVideos: Record<string, Video[]> = {};
          for (const player of players) {
            const query = `${player.title} entrevista post partido declaraciones rueda de prensa ${year} fútbol`;
            const { success, videos } = await getVideoFromYoutube(query);
            plVideos[player.title] = success
              ? videos.map(mapYoutubeToVideo)
              : [];
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

  if (loading) {
    return (
      <PrivateLayout>
        <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <Loading
        visible={loading}
        title="Cargando entrevistas"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <Chip
            selected={filter === "favorites"}
            onPress={() => setFilter("favorites")}
            style={{ marginRight: 8 }}
            compact
          >
            ⭐ Favoritos
          </Chip>

          <Chip
            selected={filter === "general"}
            onPress={() => setFilter("general")}
            compact
          >
            🌍 General
          </Chip>
        </ScrollView>
        {filter === "favorites" && (
          <>
            {/* 🔹 Sección entrevistas de equipos */}
            {equipos.map((team) => (
              <View key={team.id} style={{ marginBottom: 20 }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                  {team.title} - Entrevistas
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {videosEquipos[team.title]?.map((video) => (
                    <Card
                      key={video.id}
                      style={{
                        width: width * 0.6,
                        marginRight: 12,
                        borderRadius: 12,
                      }}
                      onPress={() => openYoutubeApp(video.id)}
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {videosJugadores[player.title]?.map((video) => (
                    <Card
                      key={video.id}
                      style={{
                        width: width * 0.6,
                        marginRight: 12,
                        borderRadius: 12,
                      }}
                      onPress={() => openYoutubeApp(video.id)}
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
          </>
        )}

        {/* 🔹 Entrevistas generales */}
        {filter === "general" && (
          <>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Entrevistas en general
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videosGenerales.map((video) => (
                <Card
                  key={video.id}
                  style={{
                    width: width * 0.6,
                    marginRight: 12,
                    borderRadius: 12,
                  }}
                  onPress={() => openYoutubeApp(video.id)}
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
          </>
        )}
        <View style={{ marginVertical: 24, alignItems: "center" }}>
          <AdBanner />
        </View>
      </ScrollView>
    </PrivateLayout>
  );
}
