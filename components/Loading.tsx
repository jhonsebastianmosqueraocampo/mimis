import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Modal, Portal, useTheme } from "react-native-paper";

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
};

export default function Loading({
  visible,
  title = "Cargando…",
  subtitle = "Estamos organizando la alineación ideal",
}: Props) {
  const theme = useTheme();

  // Animación suave del “progress bar”
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    progress.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [visible, progress]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["18%", "92%"],
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.modalWrap}
      >
        {/* Backdrop “card” */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.elevation.level2,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View
              style={[
                styles.logoWrap,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Image
                source={require("@/assets/field.jpg")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                {title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          {/* Indicator */}
          <View style={styles.indicatorRow}>
            <ActivityIndicator animating size="small" />
            <Text
              style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
            >
              Procesando…
            </Text>
          </View>

          {/* Progress bar fake */}
          <View
            style={[
              styles.track,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Animated.View
              style={[
                styles.bar,
                {
                  width: widthInterpolate,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>

          <Text
            style={[styles.micro, { color: theme.colors.onSurfaceVariant }]}
          >
            Esto puede tardar unos segundos.
          </Text>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalWrap: {
    padding: 18,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    // sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    // sombra Android
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logoWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  hint: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },
  bar: {
    height: "100%",
    borderRadius: 999,
  },
  micro: {
    marginTop: 10,
    fontSize: 11,
    opacity: 0.8,
    fontWeight: "500",
  },
});
