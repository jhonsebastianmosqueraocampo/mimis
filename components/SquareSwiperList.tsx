import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
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
const CARD_WIDTH = width * 0.7;
const CARD_SPACING = 20;

export default function SquareSwiperList({ list, action }: SwiperListProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  };

  return (
    <View style={{ alignItems: "center", paddingVertical: 16 }}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {list.map((item, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
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
                    transform: [{ scale: Animated.multiply(scale, scaleAnim) }],
                    opacity,
                    marginRight: CARD_SPACING,
                  },
                ]}
              >
                <Image source={{ uri: item.img }} style={styles.image} />

                {/* 🖤 Capa inferior oscura en lugar del degradado */}
                <View style={styles.overlay} />

                {/* 📋 Texto visible sobre el fondo oscuro */}
                <View style={styles.textContainer}>
                  <Text numberOfLines={2} style={styles.title}>
                    {item.title}
                  </Text>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          );
        })}
      </Animated.ScrollView>

      {/* 🔘 Indicadores tipo Spotify */}
      <View style={styles.indicators}>
        {list.map((_, i) => {
          const inputRange = [
            (i - 1) * (CARD_WIDTH + CARD_SPACING),
            i * (CARD_WIDTH + CARD_SPACING),
            (i + 1) * (CARD_WIDTH + CARD_SPACING),
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
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
    shadowColor: shadows.lg.shadowColor,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.surface + "CC", // 🖤 Capa oscura con transparencia
  },

  textContainer: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    alignItems: "center",
  },

  title: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textOnPrimary,
    textAlign: "center",
    textShadowColor: colors.surface + "CC",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
