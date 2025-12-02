import { useFetch } from "@/hooks/FetchContext";
import { WeeklyGoalVideo } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { height } = Dimensions.get("window");

type WeeklyVideoFeedProps = {
  videos: WeeklyGoalVideo[];
  mode: "view" | "vote";
  initialVideoId: string;
  onClose: () => void;
};

export default function WeeklyVideoFeed({
  videos,
  initialVideoId,
  onClose,
}: WeeklyVideoFeedProps) {
  const { toggleFavoriteVideo } = useFetch();

  const [index, setIndex] = useState(
    videos.findIndex((v) => v.id === initialVideoId)
  );

  const [localVideos, setLocalVideos] = useState(videos);
  const [votesUsed, setVotesUsed] = useState(() => {
    return videos.filter((v) => v.isFavorite).length;
  });

  const scrollRef = useRef<ScrollView>(null);
  const videoRefs = useRef<Video[]>([]);
  const [likeAnim] = useState(new Animated.Value(0));

  // 🔄 Ubicar el video inicial
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: index * height, animated: false });
  }, []);

  // 🔄 Reproducir / Pausar al cambiar index
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) v.playAsync();
      else v.pauseAsync();
    });
  }, [index]);

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
      return alert("Solo puedes votar 3 videos por semana");
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
          : v
      )
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
            : v
          )
      );
      return;
    }

    setVotesUsed(r.votesUsed);
  };

  return (
    <Modal visible animationType="slide">
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
        <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
          {votesUsed}/3 votos
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.y / height);
          setIndex(newIndex);
        }}
        scrollEventThrottle={16}
      >
        {localVideos.map((item, itemIndex) => (
          <View key={item.id} style={{ height, backgroundColor: "black" }}>
            {/* VIDEO */}
            <Video
              ref={(ref) => {
                if (ref) videoRefs.current[itemIndex] = ref;
              }}
              source={{ uri: item.video }}
              style={{ width: "100%", height: "100%" }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={itemIndex === index}
              isLooping
              volume={1.0}
            />

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

            {/* Información inferior */}
            <View
              style={{
                position: "absolute",
                bottom: 30,
                left: 15,
                right: 15,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                {item.user?.name ?? ""}
              </Text>
              <Text style={{ color: "#fff", fontSize: 14 }}>
                {item.fixture.teamA} ⚽ {item.fixture.teamB}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón cerrar */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            position: "absolute",
            top: 40,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>✖</Text>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}