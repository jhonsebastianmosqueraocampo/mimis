import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { swiperItem } from "@/types";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Linking, ScrollView, View } from "react-native";
import { ActivityIndicator, Card, Divider, Text } from "react-native-paper";
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

export default function Training() {
  const { getFavorites, getVideoFromYoutube } = useFetch();
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [videosFavoritos, setVideosFavoritos] = useState<
    Record<string, Video[]>
  >({});
  const [videosGenerales, setVideosGenerales] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            favVideos[team.title] = success
              ? videos.map(mapYoutubeToVideo)
              : [];
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

  const openYoutubeApp = async (videoId: string) => {
    const appUrl = `vnd.youtube://${videoId}`;
    const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);

      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el video");
    }
  };

  if (loading) {
    return (
      <PrivateLayout>
        <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />
      </PrivateLayout>
    );
  }

  if (error) {
    return <Loading visible={loading} />;
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

        {/* Generales */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Entrenamientos en general
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
      </ScrollView>
      <View style={{ marginVertical: 10, alignItems: "center" }}>
        <AdBanner />
      </View>
    </PrivateLayout>
  );
}
