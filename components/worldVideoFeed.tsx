import { WeeklyWorldTopVideo } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Modal, Text, TouchableWithoutFeedback, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const { height } = Dimensions.get("window");

type Props = {
  videos: WeeklyWorldTopVideo[];
  initialVideoId: string;
  onClose: () => void;
};

export default function WorldVideoFeed({ videos, initialVideoId, onClose }: Props) {
  const [index, setIndex] = useState(videos.findIndex((v) => v.id === initialVideoId));
  const translateY = useSharedValue(0);
  const ref = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    ref.current?.playAsync();
  }, [index]);

  const goTo = (dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= videos.length) {
      translateY.value = withTiming(0);
      return;
    }
    translateY.value = withTiming(dir * -height, {}, () => {
      runOnJS(setIndex)(next);
      translateY.value = 0;
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const threshold = height * 0.15;
      if (e.translationY < -threshold) runOnJS(goTo)(1);
      else if (e.translationY > threshold) runOnJS(goTo)(-1);
      translateY.value = withTiming(0);
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const current = videos[index];

  const togglePlay = async () => {
    if (isPlaying) await ref.current?.pauseAsync();
    else await ref.current?.playAsync();
    setIsPlaying(!isPlaying);
  };

  return (
    <Modal visible animationType="fade">
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ height, backgroundColor: "black" }, containerStyle]}>
          <TouchableWithoutFeedback onPress={togglePlay}>
            <View style={{ flex: 1 }}>
              <Video
                ref={ref}
                source={{ uri: current.video }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                style={{ width: "100%", height: "100%" }}
              />
              {!isPlaying && (
                <View
                  style={{
                    position: "absolute",
                    alignSelf: "center",
                    top: "45%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: 10,
                    borderRadius: 50,
                  }}
                >
                  <Text style={{ color: "white" }}>Pausado</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </GestureDetector>

      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            position: "absolute",
            top: 40,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
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