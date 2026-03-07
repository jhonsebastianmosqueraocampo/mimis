import ShortsCommentsDrawer from "@/components/ShortsCommentsDrawer";
import { useAuth } from "@/hooks/AuthContext";
import { useFetch } from "@/hooks/FetchContext";
import { showInterstitial } from "@/services/ads/interstitial";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { ShortItem } from "@/types";
import { ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Modal,
  Portal,
  Text,
} from "react-native-paper";

const { height } = Dimensions.get("window");

type Props = {
  item: ShortItem;
  shorts: ShortItem[];
  setShorts: React.Dispatch<React.SetStateAction<ShortItem[]>>;
  onClose: () => void;
  limitAdsPerDay: number;
  setLimitAdsPerDay: React.Dispatch<React.SetStateAction<number>>;
};

export default function ShortsFull({
  item,
  shorts,
  setShorts,
  onClose,
  limitAdsPerDay,
  setLimitAdsPerDay,
}: Props) {
  const { likeShort, sendComment, descountLimitAdsPerDayAndAddPoint } =
    useFetch();
  const { setUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(
    shorts.findIndex((s) => s.id === item.id),
  );

  const videoRef = useRef<any>(null);
  const isSwiping = useRef(false);
  const nextVideoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [highlightReward, setHighlightReward] = useState(false);
  const viewCounter = useRef(0);
  const isSeeking = useRef(false);

  useEffect(() => {
    loadRewardedAd();
  }, []);

  useEffect(() => {
    setControlsVisible(true);
    setPaused(false);

    setProgress(0);
    setCurrentTime(0);

    videoRef.current?.playAsync();
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
        if (showComments) return false;

        return Math.abs(g.dy) > 40 && Math.abs(g.dx) < 40;
      },

      onPanResponderRelease: (_, g) => {
        if (isSwiping.current) return;

        if (g.dy < -80) {
          goNext();
        } else if (g.dy > 80) {
          goPrev();
        }
      },
    }),
  ).current;

  const toggleLike = async () => {
    if (likeLoading) return;

    setLikeLoading(true);

    setShorts((prev) =>
      prev.map((s, index) => {
        if (index !== currentIndex) return s;

        const liked = !s.liked;

        return {
          ...s,
          liked,
          favoritos: liked ? s.favoritos + 1 : Math.max(0, s.favoritos - 1),
        };
      }),
    );

    try {
      await likeShort(currentShort.id);
    } catch (e) {
      // 🔙 rollback si falla
      setShorts((prev) =>
        prev.map((s, index) => {
          if (index !== currentIndex) return s;
          return currentShort;
        }),
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const togglePause = () => {
    setPaused((p) => !p);
    setControlsVisible(true);
  };

  const handleProgress = (status: any) => {
    if (!status.isLoaded) return;

    if (!isSeeking.current && status.durationMillis) {
      setProgress(status.positionMillis / status.durationMillis);
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis);
    }

    if (
      status.durationMillis &&
      status.positionMillis >= status.durationMillis - 200 &&
      !paused &&
      !isSwiping.current
    ) {
      goNext();
    }
  };

  const goNext = () => {
    if (isSwiping.current) return;
    videoRef.current?.pauseAsync();
    isSwiping.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex((i) => {
      if (i >= shorts.length - 1) return i;

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

    setTimeout(() => {
      isSwiping.current = false;
    }, 400);
  };

  const goPrev = () => {
    if (isSwiping.current) return;
    videoRef.current?.pauseAsync();
    isSwiping.current = true;

    setCurrentIndex((i) => Math.max(0, i - 1));

    setTimeout(() => {
      isSwiping.current = false;
    }, 400);
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
        const { success, limit, points, xp, message } =
          await descountLimitAdsPerDayAndAddPoint();
        if (success) {
          setLimitAdsPerDay(limit);
          setUser((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              points: points ?? prev.points,
              xp: xp ?? prev.xp,
            };
          });
        }
      } catch (error) {
        console.log("Error al obtener recompensa:", error);
      }
    });
  };

  const currentShort = shorts[currentIndex];

  return (
    <Portal>
      <Modal visible={true} contentContainerStyle={styles.fullModal}>
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

            {shorts.length > currentIndex + 1 && (
              <Video
                ref={nextVideoRef}
                source={{ uri: shorts[currentIndex + 1].video }}
                style={{ width: 0, height: 0 }}
                shouldPlay={false}
                isMuted
              />
            )}

            {/* Botón cerrar */}
            <View style={styles.closeBtnContainer}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <IconButton icon="close" size={22} iconColor="white" />
              </TouchableOpacity>
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

            {/* Texto y Likes */}
            <View style={styles.sidePanel}>
              <TouchableOpacity
                style={styles.likeBtn}
                onPress={toggleLike}
                disabled={likeLoading}
              >
                {likeLoading ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <IconButton
                    icon={currentShort.liked ? "heart" : "heart-outline"}
                    size={26}
                    iconColor={
                      currentShort.liked ? colors.primary : colors.textOnPrimary
                    }
                  />
                )}
              </TouchableOpacity>

              <IconButton
                icon="comment"
                size={26}
                iconColor="white"
                onPress={() => setShowComments(true)}
              />

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
                      ? colors.primary
                      : colors.info,
                    padding: 6,
                    borderRadius: 30,
                  }}
                  onPress={handleReward}
                >
                  <IconButton
                    icon="gift"
                    size={24}
                    iconColor={colors.textOnPrimary}
                  />
                  <Text
                    style={{
                      color: colors.textOnPrimary,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    Gana pts
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Fecha y descripción */}
            <View style={styles.bottomInfo}>
              <Text style={styles.date}>{currentShort.fecha}</Text>
              <Text style={styles.desc}>{currentShort.descripcion}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Drawer comentarios */}
        <ShortsCommentsDrawer
          visible={showComments}
          onClose={() => setShowComments(false)}
          shortId={currentShort.id}
          comments={currentShort.comentarios}
          sendComment={sendComment}
          setShorts={setShorts}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },

  video: {
    height: height,
    width: "100%",
  },

  controls: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },

  progressBar: {
    height: 3,
    backgroundColor: colors.textOnPrimary,
    position: "absolute",
    bottom: 0,
  },

  sidePanel: {
    position: "absolute",
    right: spacing.sm,
    bottom: 120,
    alignItems: "center",
    gap: spacing.lg,
  },

  likeBtn: {
    alignItems: "center",
  },

  bottomInfo: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },

  date: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  desc: {
    ...typography.subtitle,
    color: colors.textOnPrimary,
  },

  closeBtnContainer: {
    position: "absolute",
    top: 40,
    right: spacing.md,
  },

  closeBtn: {
    backgroundColor: colors.textOnPrimary,
    borderRadius: radius.round,
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
    backgroundColor: colors.primary,
  },

  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
  },

  timeContainer: {
    position: "absolute",
    bottom: 26,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },

  timeText: {
    ...typography.small,
    color: colors.textOnPrimary,
  },

  fullModal: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
});
