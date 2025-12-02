// ShortsScreen.tsx
import { ShortItem } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";
import ShortsFull from "./ShortsFull";

const { width } = Dimensions.get("window");

type Props = {
  shorts: ShortItem[];
};

export default function Shorts({ shorts }: Props) {
  const [playingIndex, setPlayingIndex] = useState(0);
  const [fullScreenItem, setFullScreenItem] = useState<ShortItem | null>(null);

  const renderShortItem = ({ item, index }: { item: ShortItem; index: number }) => {
    const isFirst = index === 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setFullScreenItem(item)}
        activeOpacity={0.9}
      >
        {/* Si es el primer item, se reproduce ahí mismo */}
        {isFirst ? (
          <Video
            source={{ uri: item.video }}
            style={styles.video}
            shouldPlay
            resizeMode={ResizeMode.COVER}
            isLooping
          />
        ) : (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        )}

        <View style={styles.info}>
          <Text style={styles.fecha}>{item.fecha.slice(0, 10)}</Text>
          <Text numberOfLines={2} style={styles.desc}>
            {item.descripcion}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PrivateLayout>
      <Text variant="headlineMedium" style={styles.header}>
        Shorts
      </Text>

      <FlatList
        data={shorts}
        numColumns={2}
        renderItem={renderShortItem}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
      />

      {fullScreenItem && (
        <ShortsFull
          item={fullScreenItem}
          shorts={shorts}
          onClose={() => setFullScreenItem(null)}
        />
      )}
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  card: {
    width: width * 0.47,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  video: {
    width: "100%",
    height: 220,
  },
  thumbnail: {
    width: "100%",
    height: 220,
  },
  info: { padding: 6 },
  fecha: {
    fontSize: 12,
    opacity: 0.6,
  },
  desc: {
    marginTop: 3,
    color: "white",
  },
});