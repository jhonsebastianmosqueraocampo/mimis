import { SwiperListProps } from "@/types";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CircleSwiperList({ list, action }: SwiperListProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }: any) => (
    <TouchableWithoutFeedback
      onPress={() => action(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={{ uri: item.img }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  return (
    <View style={{ paddingBottom: 15, height: 150 }}>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 20 }}
        snapToInterval={width * 0.35 + 20}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.35,
    alignItems: "center",
  },
  image: {
    height: width * 0.28,
    width: width * 0.28,
    borderRadius: (width * 0.28) / 2,
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginTop: 8,
    textAlign: "center",
  },
});
