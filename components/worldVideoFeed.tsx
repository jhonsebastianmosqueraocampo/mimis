import { useFetch } from "@/hooks/FetchContext";
import { showInterstitial } from "@/services/ads/interstitial";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import { WeeklyWorldTopVideo } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Modal, Portal, Text } from "react-native-paper";

const { height } = Dimensions.get("window");

type Props = {
  item: WeeklyWorldTopVideo;
  videos: WeeklyWorldTopVideo[];
  onClose: () => void;
  limitAdsPerDay: number;
  setLimitAdsPerDay: React.Dispatch<React.SetStateAction<number>>;
};

export default function WorldVideoFeed({
  item,
  videos,
  onClose,
  limitAdsPerDay,
  setLimitAdsPerDay,
}: Props) {
  const { descountLimitAdsPerDayAndAddPoint } = useFetch();
  const [currentIndex, setCurrentIndex] = useState(
    videos.findIndex((s) => s.id === item.id),
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

  useEffect(() => {
    loadRewardedAd();
  }, []);

  useEffect(() => {
    setControlsVisible(true);
    setPaused(false);
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
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  video: {
    width: "100%",
    height: height,
  },

  /* ▶️ CONTROLES PLAY / PAUSE */
  controls: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 40,
    padding: 10,
  },

  /* ❌ BOTÓN CERRAR */
  closeBtnContainer: {
    position: "absolute",
    top: 42,
    right: 18,
  },

  closeBtn: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  /* 🔊 PANEL LATERAL */
  sidePanel: {
    position: "absolute",
    right: 14,
    bottom: 120,
    alignItems: "center",
    gap: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 30,
  },

  /* ⏱ TIEMPO */
  timeContainer: {
    position: "absolute",
    bottom: 56,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  timeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ▶️ PROGRESS */
  progressContainer: {
    position: "absolute",
    bottom: 22,
    width: "100%",
    paddingHorizontal: 16,
  },

  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: 4,
    backgroundColor: "#1DB954",
    borderRadius: 3,
  },

  /* 🖤 OVERLAY INFERIOR (da profundidad) */
  bottomGradientFake: {
    position: "absolute",
    bottom: 0,
    height: 140,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  /* MODAL */
  fullModal: {
    flex: 1,
    backgroundColor: "black",
  },
});
