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

export default function SquareSwiperList({ list, action }: SwiperListProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  return (
    <View style={{ paddingBottom: 15 }}>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
        snapToInterval={width * 0.6 + 16}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.6,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  image: {
    height: 110,
    width: "100%",
  },
  textContainer: {
    padding: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
