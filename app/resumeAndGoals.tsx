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
      } catch (err) {
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
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  const openVideo = (id: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Text style={styles.header}>🎥 Videos de tus favoritos</Text>

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

        {/* Galería de videos */}
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
                {/* Nombre del equipo o jugador */}
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
          <View style={{ marginVertical: 10, alignItems: "center" }}>
            <AdBanner />
          </View>
        </ScrollView>
      </View>
    </PrivateLayout>
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
    color: "#1e1e1e",
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
    backgroundColor: "#e6e6e6",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    color: "#333",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
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
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
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
    color: "#1e1e1e",
    paddingHorizontal: 8,
    marginTop: 6,
  },
  channelTitle: {
    fontSize: 12,
    color: "#777",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 60,
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  groupContainer: {
    marginBottom: 24,
  },

  groupTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1e1e1e",
  },

  cardContent: {
    padding: 8,
  },

  noVideosText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
    fontStyle: "italic",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
