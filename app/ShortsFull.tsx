import ShortsCommentsDrawer from "@/components/ShortsCommentsDrawer";
import { useFetch } from "@/hooks/FetchContext";
import { ShortItem } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";

const { height } = Dimensions.get("window");

type Props = {
  item: ShortItem;
  shorts: ShortItem[];
  onClose: () => void;
};

export default function ShortsFull({ item, shorts, onClose }: Props) {
  const { likeShort, sendComment } = useFetch();
  const [currentIndex, setCurrentIndex] = useState(
    shorts.findIndex((s) => s.id === item.id)
  );

  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setControlsVisible(true);
    setPaused(false);
    videoRef.current?.playAsync();
  }, [currentIndex]);

  useEffect(() => setProgress(0), [currentIndex]);

  const currentShort = shorts[currentIndex];

  // Ocultar controles después de 3 segundos
  useEffect(() => {
    const t = setTimeout(() => setControlsVisible(false), 3000);
    return () => clearTimeout(t);
  }, [controlsVisible]);

  // Swipe para navegar shorts
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -70 && currentIndex < shorts.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
        if (gesture.dy > 70 && currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
        }
      },
    })
  ).current;

  const toggleLike = async () => {
    setLikeLoading(true);
    await likeShort(currentShort.id);
    setLikeLoading(false);
  };

  const togglePause = () => {
    setPaused((p) => !p);
    setControlsVisible(true);
  };

  const handleProgress = (status: any) => {
    if (status.isLoaded && status.durationMillis) {
      setProgress(status.positionMillis / status.durationMillis);
    }
  };

  return (
    <Modal visible animationType="slide">
      <View style={styles.container} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setControlsVisible((v) => !v)}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={{ uri: currentShort.video }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={!paused}
            isLooping
            onPlaybackStatusUpdate={handleProgress}
          />

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

          {/* Barra de progreso */}
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />

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
                <IconButton icon="heart" size={26} iconColor="white" />
              )}
            </TouchableOpacity>

            <IconButton
              icon="comment"
              size={26}
              iconColor="white"
              onPress={() => setShowComments(true)}
            />

            <IconButton
              icon="close"
              size={26}
              iconColor="white"
              onPress={onClose}
            />
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
        comments={currentShort.comentarios.map((c) => c.comment)}
        sendComment={sendComment}
      />
    </Modal>
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
});
