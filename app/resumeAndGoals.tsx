import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { videosTypeYoutube } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
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
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { typography } from "@/theme/typography";

const { width } = Dimensions.get("window");

export default function ResumeAndGoal() {
  const { getFavoritesVideos } = useFetch();

  const [equipos, setEquipos] = useState<videosTypeYoutube[]>([]);
  const [jugadores, setJugadores] = useState<videosTypeYoutube[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"equipos" | "jugadores">(
    "equipos",
  );

  useEffect(() => {
    let isMounted = true;

    const getFavoriteList = async () => {
      setLoading(true);

      try {
        const { success, videosTeams, videosPlayers, message } =
          await getFavoritesVideos();

        if (!isMounted) return;

        if (success) {
          setEquipos(videosTeams);
          setJugadores(videosPlayers);
        } else {
          setError(message!);
        }
      } catch {
        if (isMounted) setError("Error al cargar los videos favoritos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getFavoriteList();

    return () => {
      isMounted = false;
    };
  }, []);

  const videosToShow = useMemo(() => {
    return activeTab === "equipos" ? equipos : jugadores;
  }, [activeTab, equipos, jugadores]);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  const openVideo = (id: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Text style={g.titleLarge}>🎥 Videos de tus favoritos</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "equipos" && styles.activeTab]}
            onPress={() => setActiveTab("equipos")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "equipos" && styles.activeTabText,
              ]}
            >
              Equipos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "jugadores" && styles.activeTab]}
            onPress={() => setActiveTab("jugadores")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "jugadores" && styles.activeTabText,
              ]}
            >
              Jugadores
            </Text>
          </TouchableOpacity>
        </View>

        {/* Galería */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {videosToShow.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {activeTab === "equipos"
                  ? "⚽ No tienes equipos favoritos"
                  : "👤 No tienes jugadores favoritos"}
              </Text>

              <Text style={styles.emptySubtitle}>
                Agrega favoritos para ver sus videos aquí.
              </Text>
            </View>
          ) : (
            videosToShow.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.name}</Text>

                {group.videos.length === 0 ? (
                  <Text style={styles.noVideosText}>
                    No hay videos recientes disponibles.
                  </Text>
                ) : (
                  <View style={styles.grid}>
                    {group.videos.map((video) => (
                      <TouchableOpacity
                        key={video.videoId}
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => openVideo(video.videoId)}
                      >
                        <Image
                          source={{ uri: video.thumbnail }}
                          style={styles.thumbnail}
                        />

                        <View style={styles.cardContent}>
                          <Text numberOfLines={2} style={styles.videoTitle}>
                            {video.title}
                          </Text>

                          <Text numberOfLines={1} style={styles.channelTitle}>
                            {video.channelTitle}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          <View style={{ marginVertical: spacing.sm, alignItems: "center" }}>
            <AdBanner />
          </View>
        </ScrollView>
      </View>
    </PrivateLayout>
  );
}

const cardWidth = (width - spacing.lg * 3) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  tab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceVariant,
  },

  activeTab: {
    backgroundColor: colors.primary,
  },

  tabText: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },

  activeTabText: {
    color: colors.textOnPrimary,
  },

  scrollContainer: {
    paddingBottom: spacing.xxl,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: cardWidth,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },

  thumbnail: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },

  videoTitle: {
    ...typography.body,
  },

  channelTitle: {
    ...typography.small,
  },

  cardContent: {
    padding: spacing.sm,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  groupContainer: {
    marginBottom: spacing.xl,
  },

  groupTitle: {
    ...typography.title,
    marginBottom: spacing.md,
  },

  noVideosText: {
    ...typography.bodySecondary,
    marginBottom: spacing.sm,
    fontStyle: "italic",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },

  emptyTitle: {
    ...typography.title,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...typography.bodySecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
