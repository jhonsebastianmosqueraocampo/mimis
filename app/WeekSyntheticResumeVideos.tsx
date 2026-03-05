import Loading from "@/components/Loading";
import WeeklyVideoFeed from "@/components/WeeklyVideoFeed";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadInterstitial } from "@/services/ads/interstitial";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { WeeklyGoalVideo } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Chip, Divider, Menu, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PrivateLayout from "./privateLayout";

export default function WeekSyntheticResumeVideos() {
  const { getSyntheticVideo, getLimitAdsPerDay } = useFetch();
  const [mode, setMode] = useState<"view" | "vote">("view");
  const [openFeed, setOpenFeed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WeeklyGoalVideo | null>(
    null,
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [videosWeek, setVideosWeek] = useState<WeeklyGoalVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [limitAdsPerDay, setLimitAdsPerDay] = useState(20);

  useEffect(() => {
    loadInterstitial();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadAdsLimitPerDay = async () => {
      setLoading(true);
      try {
        const { success, limit, message } = await getLimitAdsPerDay();
        if (!isMounted) return;

        if (success) {
          setLimitAdsPerDay(limit);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar los equipos favoritos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAdsLimitPerDay();

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    const week = getLastSunday();
    setSelectedWeek(week);
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

  const handleSelectVideo = (video: WeeklyGoalVideo) => {
    setSelectedVideo(video);
    setOpenFeed(true);
  };

  const allWeeks = useMemo(
    () =>
      Array.from(new Set(videosWeek.map((v) => v.week))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [],
  );

  const filtered =
    selectedWeek === null
      ? videosWeek
      : videosWeek.filter((v) => v.week === selectedWeek);

  return (
    <PrivateLayout>
      <View style={{ flex: 1, padding: spacing.lg }}>
        <Text
          variant="titleLarge"
          style={{
            ...typography.titleLarge,
            marginBottom: spacing.sm,
            color: colors.textPrimary,
          }}
        >
          🏆 Top 10 Goles Semanales Sintética
        </Text>

        {/* Chips de modo */}
        <View
          style={{
            flexDirection: "row",
            gap: spacing.xs,
            marginBottom: spacing.sm,
          }}
        >
          <Chip
            selected={mode === "view"}
            onPress={() => setMode("view")}
            icon="star"
          >
            Mejores goles
          </Chip>
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

        <Divider style={{ marginVertical: spacing.sm }} />

        {/* GRID - dos columnas con scroll */}
        {loading ? (
          <Loading
            visible={loading}
            title="Cargando"
            subtitle="Pronto tendrás la información"
          />
        ) : filtered.length === 0 ? (
          <Text>No hay videos para esta semana</Text>
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: spacing.sm,
            }}
          >
            {filtered.map((item) => {
              const isWinner =
                mode === "view" &&
                item.favorites ===
                  Math.max(...videosWeek.map((v) => v.favorites));

              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    width: "48%",
                    marginBottom: spacing.sm,
                    borderRadius: radius.md,
                    overflow: "hidden",
                    borderWidth: isWinner ? 3 : 0,
                    borderColor: isWinner ? colors.warning : colors.textPrimary,
                  }}
                  onPress={() => handleSelectVideo(item)}
                >
                  <Image
                    source={{
                      uri: item.thumbail,
                    }}
                    style={{
                      width: "100%",
                      height: 180,
                      backgroundColor: colors.surface,
                    }}
                  />

                  {/* 👁️ Badges de vistas y likes */}
                  {/* 👁️ Views */}
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      backgroundColor: colors.background,
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        ...typography.small,
                        color: colors.textOnPrimary,
                      }}
                    >
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
                      color={
                        item.isFavorite ? colors.error : colors.textOnPrimary
                      }
                    />
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {item.favorites}
                    </Text>
                  </View>

                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      backgroundColor: colors.background,
                      width: "100%",
                      paddingVertical: 4,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        ...typography.body,
                        color: colors.textOnPrimary,
                      }}
                    >
                      {item.user?.name ?? ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={{ marginVertical: spacing.sm }}>
          <AdBanner />
        </View>

        {/* Modal del feed */}
        {openFeed && selectedVideo && (
          <WeeklyVideoFeed
            videos={filtered}
            mode={mode}
            item={selectedVideo}
            onClose={() => setOpenFeed(false)}
            setVideosWeek={setVideosWeek}
            limitAdsPerDay={limitAdsPerDay}
            setLimitAdsPerDay={setLimitAdsPerDay}
          />
        )}

        {message ? (
          <Text
            style={{
              color: colors.warning ?? "orange",
              marginTop: spacing.sm,
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </PrivateLayout>
  );
}
