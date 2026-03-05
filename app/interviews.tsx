import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { swiperItem } from "@/types";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip, Divider, Text } from "react-native-paper";
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
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Alert.alert("Error", "No se pudo abrir el video");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const { success, teams, players } = await getFavorites();

        if (!isMounted) return;

        if (success) {
          setEquipos(teams);
          setJugadores(players);

          const year = new Date().getFullYear();

          const eqVideos: Record<string, Video[]> = {};

          for (const team of teams) {
            const query = `${team.title} entrevista rueda de prensa ${year} futbol`;

            const { success, videos } = await getVideoFromYoutube(query);

            eqVideos[team.title] = success ? videos.map(mapYoutubeToVideo) : [];
          }

          setVideosEquipos(eqVideos);

          const plVideos: Record<string, Video[]> = {};

          for (const player of players) {
            const query = `${player.title} entrevista futbol ${year}`;

            const { success, videos } = await getVideoFromYoutube(query);

            plVideos[player.title] = success
              ? videos.map(mapYoutubeToVideo)
              : [];
          }

          setVideosJugadores(plVideos);

          const { success: ok, videos } = await getVideoFromYoutube(
            "entrevistas futbol jugadores",
          );

          setVideosGenerales(ok ? videos.map(mapYoutubeToVideo) : []);
        }
      } catch {}

      if (isMounted) setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Loading
        visible
        title="Cargando entrevistas"
        subtitle="Buscando contenido para ti"
      />
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {/* filtros */}

        <View style={styles.filters}>
          <Chip
            selected={filter === "favorites"}
            onPress={() => setFilter("favorites")}
            style={[styles.chip, filter === "favorites" && styles.chipActive]}
            textStyle={styles.chipText}
          >
            ⭐ Favoritos
          </Chip>

          <Chip
            selected={filter === "general"}
            onPress={() => setFilter("general")}
            style={[styles.chip, filter === "general" && styles.chipActive]}
            textStyle={styles.chipText}
          >
            🌍 General
          </Chip>
        </View>

        {/* FAVORITOS */}

        {filter === "favorites" && (
          <>
            {equipos.map((team) => (
              <View key={team.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{team.title}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {videosEquipos[team.title]?.map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      onPress={() => openYoutubeApp(video.id)}
                    >
                      <Card style={styles.videoCard}>
                        <Card.Cover
                          source={{ uri: video.thumbnail }}
                          style={styles.thumbnail}
                        />

                        <Card.Content>
                          <Text numberOfLines={2} style={styles.videoTitle}>
                            {video.title}
                          </Text>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Divider style={styles.divider} />
              </View>
            ))}

            {jugadores.map((player) => (
              <View key={player.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{player.title}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {videosJugadores[player.title]?.map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      onPress={() => openYoutubeApp(video.id)}
                    >
                      <Card style={styles.videoCard}>
                        <Card.Cover
                          source={{ uri: video.thumbnail }}
                          style={styles.thumbnail}
                        />

                        <Card.Content>
                          <Text numberOfLines={2} style={styles.videoTitle}>
                            {video.title}
                          </Text>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Divider style={styles.divider} />
              </View>
            ))}
          </>
        )}

        {/* GENERAL */}

        {filter === "general" && (
          <>
            <Text style={styles.sectionTitle}>Entrevistas destacadas</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videosGenerales.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onPress={() => openYoutubeApp(video.id)}
                >
                  <Card style={styles.videoCard}>
                    <Card.Cover
                      source={{ uri: video.thumbnail }}
                      style={styles.thumbnail}
                    />

                    <Card.Content>
                      <Text numberOfLines={2} style={styles.videoTitle}>
                        {video.title}
                      </Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.banner}>
          <AdBanner />
        </View>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },

  filters: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },

  chip: {
    marginRight: spacing.sm,
    backgroundColor: "#1A1A1A",
  },

  chipActive: {
    backgroundColor: colors.primary,
  },

  chipText: {
    color: "#fff",
    fontWeight: "600",
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },

  videoCard: {
    width: width * 0.65,
    marginRight: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "#1C1C1C",
    overflow: "hidden",
  },

  thumbnail: {
    height: 150,
  },

  videoTitle: {
    color: "#fff",
    marginTop: 6,
  },

  divider: {
    marginTop: spacing.md,
    opacity: 0.2,
  },

  banner: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
});
