import { useFootball } from "@/hooks/FootballContext";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { Modal, Portal, useTheme } from "react-native-paper";

type Props = {
  visible: boolean;
};

export default function Loading({ visible }: Props) {
  const { facts, matchesToday } = useFootball();
  const theme = useTheme();

  const [index, setIndex] = useState(0);
  const [isFact, setIsFact] = useState(true);
  const [progress, setProgress] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  // alternar contenido
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      setIsFact((prev) => !prev);
      setIndex((prev) => prev + 1);
      setProgress((prev) => (prev + 1) % 10);
    }, 2500);

    return () => clearInterval(interval);
  }, [visible]);

  // pulso del logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const fact = facts[index % facts.length];
  const match = matchesToday[index % matchesToday.length];
  const fixture = match
    ? {
        home: match.teams.home.name,
        away: match.teams.away.name,
        league: match.league.name,
        time: match.fixture.status.elapsed,
      }
    : null;

  const messages = [
    "Preparando el estadio...",
    "Calentando jugadores...",
    "Revisando el VAR...",
    "Cargando estadísticas...",
    "El partido está por comenzar...",
  ];

  const message = messages[index % messages.length];

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.modalWrap}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.elevation.level2,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          {/* Logo */}
          <Animated.View style={{ transform: [{ scale: logoPulse }] }}>
            <Image
              source={require("@/assets/logo/mimis-logo.png")}
              style={styles.logo}
            />
          </Animated.View>

          <Text style={[styles.brand, { color: theme.colors.primary }]}>
            MIMIS
          </Text>

          {/* CONTENT */}
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {isFact ? (
              <>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  ¿Sabías que?
                </Text>
                <Text style={[styles.fact, { color: theme.colors.onSurface }]}>
                  {fact.text}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  Partido de hoy ⚽
                </Text>
                <Text
                  style={[styles.fixture, { color: theme.colors.onSurface }]}
                >
                  {fixture?.home} vs {fixture?.away}
                </Text>
                <Text
                  style={[
                    styles.fixtureSub,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {fixture?.time} • {fixture?.league}
                </Text>
              </>
            )}
          </Animated.View>

          {/* PROGRESS */}
          <View style={styles.progressRow}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.block,
                  {
                    backgroundColor:
                      i <= progress
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                  },
                ]}
              />
            ))}

            {/* balón */}
            <Text style={[styles.ball, { left: progress * 20 + 2 }]}>⚽</Text>
          </View>

          <Text
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {message}
          </Text>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalWrap: { padding: 20 },

  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    alignItems: "center",
    elevation: 10,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },

  brand: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
  },

  content: {
    alignItems: "center",
    marginVertical: 12,
    minHeight: 80,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },

  fact: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  fixture: {
    fontSize: 16,
    fontWeight: "800",
  },

  fixtureSub: {
    fontSize: 12,
    marginTop: 2,
  },

  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    position: "relative",
  },

  block: {
    width: 16,
    height: 8,
    borderRadius: 3,
  },

  ball: {
    position: "absolute",
    top: -14,
    fontSize: 16,
  },

  message: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
  },
});
