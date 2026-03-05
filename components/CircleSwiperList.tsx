import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { SwiperListProps } from "@/types";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width * 0.3;
const SPACING = 20;

export default function CircleSwiperList({ list, action }: SwiperListProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={ITEM_SIZE + SPACING}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: (width - ITEM_SIZE) / 2,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {list.map((item, index) => {
          const inputRange = [
            (index - 1) * (ITEM_SIZE + SPACING),
            index * (ITEM_SIZE + SPACING),
            (index + 1) * (ITEM_SIZE + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <TouchableWithoutFeedback
              key={item.id}
              onPress={() => action(item.id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [
                      { scale: Animated.multiply(scale, pressScale) },
                    ],
                    opacity,
                    marginRight: SPACING,
                  },
                ]}
              >
                {/* Imagen circular */}
                <Image source={{ uri: item.img }} style={styles.image} />

                {/* Overlay sutil (sin gradient) */}
                <View style={styles.overlay} />

                {/* Nombre del item */}
                <Text numberOfLines={1} style={styles.title}>
                  {item.title}
                </Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          );
        })}
      </Animated.ScrollView>

      {/* 🔘 Indicadores */}
      <View style={styles.indicators}>
        {list.map((_, i) => {
          const inputRange = [
            (i - 1) * (ITEM_SIZE + SPACING),
            i * (ITEM_SIZE + SPACING),
            (i + 1) * (ITEM_SIZE + SPACING),
          ];

          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1.2, 0.6],
            extrapolate: "clamp",
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: dotOpacity,
                  transform: [{ scale: dotScale }],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },

  card: {
    width: ITEM_SIZE,
    alignItems: "center",
  },

  image: {
    height: ITEM_SIZE * 0.9,
    width: ITEM_SIZE * 0.9,
    borderRadius: (ITEM_SIZE * 0.9) / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  overlay: {
    position: "absolute",
    bottom: ITEM_SIZE * 0.2,
    left: "25%",
    width: "50%",
    height: 20,
    backgroundColor: colors.background,
    borderRadius: radius.round,
    zIndex: -1,
  },

  title: {
    ...typography.small,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  indicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    gap: spacing.xs ?? 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },
});
