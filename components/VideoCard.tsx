import { WeeklyGoalVideo } from "@/types";
import { Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableWithoutFeedback, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

const { height } = Dimensions.get("window");

export default function VideoCard({
  video,
  mode,
}: {
  video: WeeklyGoalVideo;
  mode: "view" | "vote";
}) {
  const ref = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hearts, setHearts] = useState(video.favorites);
  const [userVotes, setUserVotes] = useState(0);

  useEffect(() => {
    ref.current?.playAsync();
  }, []);

  const togglePlay = async () => {
    if (isPlaying) {
      await ref.current?.pauseAsync();
    } else {
      await ref.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVote = () => {
    if (mode === "vote" && userVotes < 3) {
      setHearts((prev) => prev + 1);
      setUserVotes((prev) => prev + 1);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={togglePlay}>
      <View style={{ height, backgroundColor: "black" }}>
        <Video
          ref={ref}
          source={{ uri: video.video }}
          shouldPlay
          isLooping
          isMuted={isMuted}
          style={{ width: "100%", height: "100%" }}
        />

        {/* Overlay con info */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 20,
            right: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            {video.fixture.teamA} ⚽ {video.fixture.teamB}
          </Text>
          <Text style={{ color: "white", fontSize: 14 }}>
            Subido por {video.user?.name ?? ''}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <IconButton
              icon="heart"
              iconColor={mode === "vote" ? "red" : "white"}
              onPress={handleVote}
            />
            <Text style={{ color: "white" }}>{hearts}</Text>
            <Text style={{ color: "white", marginLeft: 10 }}>👁️ {video.views}</Text>
            <IconButton
              icon={isMuted ? "volume-off" : "volume-high"}
              iconColor="white"
              onPress={() => setIsMuted(!isMuted)}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}