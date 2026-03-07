import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { shadows } from "@/theme/shadows";
import { VideoYoutube } from "@/types";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import Loading from "./Loading";

const { width } = Dimensions.get("window");

type MatchPostVideosProps = {
  teamA: string;
  teamB: string;
  query: string;
  season: string;
};

export default function MatchPostVideos({
  teamA,
  teamB,
  query,
  season,
}: MatchPostVideosProps) {
  const { getVideoMatchFromYoutube } = useFetch();
  const [videos, setVideos] = useState<VideoYoutube[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadFixture = async () => {
      try {
        const { success, videos, message } = await getVideoMatchFromYoutube(
          teamA,
          teamB,
          season,
          query,
        );
        if (mounted) {
          if (success) {
            setVideos(videos!);
          } else setError(message!);
        }
        setLoading(false);
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
  }, []);

  if (loading) return <Loading visible={loading} />;

  const openVideo = (id: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {teamA} vs {teamB}
      </Text>

      {/* Galería de videos */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.grid}>
          {videos.length === 0 ? (
            <Text style={styles.emptyText}>No hay videos disponibles.</Text>
          ) : (
            videos.map((item) => (
              <TouchableOpacity
                key={item.videoId}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => openVideo(item.videoId)}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumbnail}
                />
                <Text numberOfLines={2} style={styles.videoTitle}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={styles.channelTitle}>
                  {item.channelTitle}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const cardWidth = (width - 48) / 2; // dos columnas con margen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  activeTabText: {
    color: colors.textOnPrimary,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: colors.background,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: shadows.sm.shadowColor,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  channelTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 60,
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
