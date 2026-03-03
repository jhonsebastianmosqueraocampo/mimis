import { useFetch } from "@/hooks/FetchContext";
import { showInterstitial } from "@/services/ads/interstitial";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import { WeeklyGoalVideo } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Modal, Portal } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { height } = Dimensions.get("window");

type WeeklyVideoFeedProps = {
  videos: WeeklyGoalVideo[];
  mode: "view" | "vote";
  item: WeeklyGoalVideo;
  onClose: () => void;
  setVideosWeek: React.Dispatch<React.SetStateAction<WeeklyGoalVideo[]>>;
  limitAdsPerDay: number;
  setLimitAdsPerDay: React.Dispatch<React.SetStateAction<number>>;
};

export default function WeeklyVideoFeed({
  videos,
  item,
  onClose,
  setVideosWeek,
  limitAdsPerDay,
  setLimitAdsPerDay,
}: WeeklyVideoFeedProps) {
  const {
    toggleFavoriteVideo,
    registerVideoView,
    descountLimitAdsPerDayAndAddPoint,
  } = useFetch();

  const [localVideos, setLocalVideos] = useState(videos);
  const [votesUsed, setVotesUsed] = useState(() => {
    return videos.filter((v) => v.isFavorite).length;
  });
  const [currentIndex, setCurrentIndex] = useState(
    videos.findIndex((v) => v.id === item.id),
  );
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [highlightReward, setHighlightReward] = useState(false);
  const viewCounter = useRef(0);
  const isSeeking = useRef(false);
  const viewTrackedRef = useRef<string | null>(null);

  const [likeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadRewardedAd();
  }, []);

  useEffect(() => {
    setControlsVisible(true);
    setPaused(false);
    videoRef.current?.playAsync();

    viewTrackedRef.current = null;
  }, [currentIndex]);

  useEffect(() => setProgress(0), [currentIndex]);

  // Ocultar controles después de 3 segundos
  useEffect(() => {
    const t = setTimeout(() => setControlsVisible(false), 3000);
    return () => clearTimeout(t);
  }, [controlsVisible]);

  // Swipe para navegar shorts
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        return Math.abs(g.dy) > 25;
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -100) {
          goNext();
        } else if (g.dy > 100) {
          goPrev();
        }
      },
    }),
  ).current;

  // ❤️ Animación "pop"
  const triggerLikeAnimation = () => {
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ❤️ Manejar favorito real
  const handleLike = async (videoId: string) => {
    const video = localVideos.find((v) => v.id === videoId);
    if (!video) return;

    // 🟥 Regla de 3 votos
    if (!video.isFavorite && votesUsed >= 3) {
      triggerLikeAnimation();
      // return alert("Solo puedes votar 3 videos por semana");
    }

    // UI optimista
    setLocalVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              isFavorite: !v.isFavorite,
              favorites: v.isFavorite ? v.favorites - 1 : v.favorites + 1,
            }
          : v,
      ),
    );

    triggerLikeAnimation();

    // Llamada real al backend
    const r = await toggleFavoriteVideo(videoId);

    if (!r.success || r.canVote === false) {
      alert("Límite de 3 votos por semana alcanzado");

      // revertir
      setLocalVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                isFavorite: video.isFavorite,
                favorites: video.favorites,
              }
            : v,
        ),
      );
      return;
    }

    setVotesUsed(r.votesUsed);
    setVideosWeek((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              isFavorite: !video.isFavorite,
              favorites: v.isFavorite ? v.favorites - 1 : v.favorites + 1,
            }
          : v,
      ),
    );
  };

  const handleView = async (videoId: string) => {
    try {
      const { success, message } = await registerVideoView(videoId);
      if (success) {
        setVideosWeek((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? {
                  ...v,
                  views: v.views + 1,
                }
              : v,
          ),
        );
      } else {
        console.log("Error registrando vista:", message);
      }
    } catch (e) {
      console.log("Error registrando vista", e);
    }
  };
  const togglePause = () => {
    setPaused((p) => !p);
    setControlsVisible(true);
  };

  const handleProgress = (status: any) => {
    if (!status.isLoaded || !status.durationMillis) return;

    if (!isSeeking.current) {
      const percent = status.positionMillis / status.durationMillis;

      setProgress(percent);
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis);

      // 👁️ VISTA REAL AL 50 %
      if (
        percent >= 0.5 &&
        !viewTrackedRef.current // aún no registrada
      ) {
        viewTrackedRef.current = currentShort.id;
        handleView(currentShort.id);
      }
    }

    // ⏭ auto next
    if (
      status.durationMillis &&
      status.positionMillis >= status.durationMillis - 200 &&
      !paused
    ) {
      goNext();
    }
  };

  const goNext = () => {
    setCurrentIndex((i) => {
      if (i >= videos.length - 1) return i;

      viewCounter.current += 1;

      if (viewCounter.current % 5 === 0) {
        setHighlightReward(true);

        setTimeout(() => {
          setHighlightReward(false);
        }, 2500);
      }

      if (viewCounter.current >= 6) {
        showInterstitial();
        viewCounter.current = 0;
      }

      return i + 1;
    });
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleReward = () => {
    showRewardedAd(async () => {
      try {
        const { success, limit, message } =
          await descountLimitAdsPerDayAndAddPoint();
        if (success) {
          setLimitAdsPerDay(limit);
        }
        console.log("Usuario ganó puntos 🎉");
      } catch (error) {
        console.log("Error aplicando recompensa", error);
      }
    });
  };

  const currentShort = videos[currentIndex];

  return (
    <Portal>
      <Modal visible contentContainerStyle={styles.fullModal}>
        <View style={styles.container} {...panResponder.panHandlers}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setControlsVisible((v) => !v)}
            activeOpacity={1}
          >
            <Video
              key={currentShort.id}
              ref={videoRef}
              source={{
                uri: currentShort.video,
              }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={!paused}
              isMuted={muted}
              onPlaybackStatusUpdate={handleProgress}
            />
            <View style={styles.closeBtnContainer}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <IconButton icon="close" size={22} iconColor="white" />
              </TouchableOpacity>
            </View>
            {/* 🟦 CONTADOR DE VOTOS SEMANALES */}
            <View
              style={{
                position: "absolute",
                top: 40,
                left: 20,
                zIndex: 999,
                backgroundColor:
                  votesUsed >= 3 ? "rgba(255,0,0,0.75)" : "rgba(0,0,0,0.6)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 14, fontWeight: "bold" }}
              >
                {votesUsed}/3 votos
              </Text>
            </View>

            {/* Controles */}
            {controlsVisible && (
              <View style={styles.controls}>
                <IconButton
                  icon={paused ? "play" : "pause"}
                  size={42}
                  onPress={togglePause}
                />
              </View>
            )}

            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>

            {/* Barra de progreso */}
            <View
              style={styles.progressContainer}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => {
                isSeeking.current = true;
              }}
              onResponderMove={(e) => {
                const x = e.nativeEvent.locationX;
                const width = Dimensions.get("window").width;
                const percent = Math.max(0, Math.min(1, x / width));

                setProgress(percent);
              }}
              onResponderRelease={async (e) => {
                const x = e.nativeEvent.locationX;
                const width = Dimensions.get("window").width;
                const percent = Math.max(0, Math.min(1, x / width));

                if (videoRef.current && duration) {
                  await videoRef.current.setPositionAsync(percent * duration);
                }

                isSeeking.current = false;
              }}
            >
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>

            <View style={styles.sidePanel}>
              {/* ❤️ Animación central */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: "45%",
                  left: "45%",
                  transform: [
                    {
                      scale: likeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.5],
                      }),
                    },
                  ],
                  opacity: likeAnim,
                }}
              >
                <Text style={{ fontSize: 70, color: "white" }}>❤️</Text>
              </Animated.View>

              {/* PANEL DERECHA */}
              <View
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 80,
                  alignItems: "center",
                }}
              >
                {/* ❤️ Botón Like */}
                <TouchableOpacity onPress={() => handleLike(item.id)}>
                  <Icon
                    name={item.isFavorite ? "heart" : "heart-outline"}
                    size={45}
                    color={item.isFavorite ? "#ff3366" : "#ffffffaa"}
                  />
                </TouchableOpacity>

                {/* Likes count */}
                <Text style={{ color: "white", marginTop: 2 }}>
                  {item.favorites}
                </Text>

                {/* 👁️ Vistas */}
                <Text style={{ fontSize: 30, color: "#fff", marginTop: 15 }}>
                  👁
                </Text>
                <Text style={{ color: "white" }}>{item.views}</Text>
              </View>

              <IconButton
                icon={muted ? "volume-off" : "volume-high"}
                size={26}
                iconColor="white"
                onPress={() => setMuted((m) => !m)}
              />

              {limitAdsPerDay > 0 && (
                <TouchableOpacity
                  style={{
                    alignItems: "center",
                    marginTop: 10,
                    backgroundColor: highlightReward
                      ? "rgba(255,215,0,0.35)"
                      : "rgba(255,215,0,0.15)",
                    padding: 6,
                    borderRadius: 30,
                  }}
                  onPress={handleReward}
                >
                  <IconButton icon="gift" size={24} iconColor="#FFD700" />
                  <Text
                    style={{
                      color: "#FFD700",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    Gana pts
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Información inferior */}
            <View
              style={{
                position: "absolute",
                bottom: 30,
                left: 15,
                right: 15,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {item.user?.name ?? ""}
              </Text>
              <Text style={{ color: "#fff", fontSize: 14 }}>
                {item.fixture.teamA} ⚽ {item.fixture.teamB}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  video: { height: height, width: "100%" },
  controls: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },
  progressBar: {
    height: 3,
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
  },
  sidePanel: {
    position: "absolute",
    right: 10,
    bottom: 120,
    alignItems: "center",
    gap: 20,
  },
  likeBtn: {
    alignItems: "center",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 25,
    left: 15,
    right: 15,
  },
  date: { color: "#eee", marginBottom: 4 },
  desc: { color: "white", fontSize: 16, fontWeight: "500" },
  closeBtnContainer: {
    position: "absolute",
    top: 40,
    right: 16,
  },

  closeBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 24,
    justifyContent: "center",
  },

  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  progressFill: {
    height: 4,
    backgroundColor: "#1DB954",
  },
  timeContainer: {
    position: "absolute",
    bottom: 26,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  timeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  fullModal: {
    flex: 1,
    backgroundColor: "black",
  },
});
