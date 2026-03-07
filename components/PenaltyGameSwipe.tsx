import { useAuth } from "@/hooks/AuthContext";
import { useFetch } from "@/hooks/FetchContext";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, ProgressBar, Text } from "react-native-paper";

const { width } = Dimensions.get("window");

type Dir = "left" | "center" | "right";
const GOAL_HEIGHT = 220;
const GOAL_LINE_Y = -GOAL_HEIGHT + 90;

export default function PenaltyGameSwipe() {
  const { user, setUser } = useAuth();
  const { descountLimitAdsPerDayAndAddPoint } = useFetch();
  useEffect(() => {
    loadRewardedAd();
  }, []);

  const MAX_SHOTS = 5;

  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState("");
  const [shooting, setShooting] = useState(false);
  const [keeperDir, setKeeperDir] = useState<Dir>("center");
  const [overlay, setOverlay] = useState<"goal" | "save" | null>(null);
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (shooting) return;

      const randomDir =
        directions[Math.floor(Math.random() * directions.length)];

      Animated.timing(keeperX, {
        toValue: keeperTargetX(randomDir),
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 1800);

    return () => clearInterval(interval);
  }, [shooting]);

  // Animated values (RN core)
  const ballXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const keeperX = useRef(new Animated.Value(0)).current;

  const directions: Dir[] = useMemo(() => ["left", "center", "right"], []);

  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  const dirFromDx = (dx: number): Dir =>
    dx < -30 ? "left" : dx > 30 ? "right" : "center";

  const keeperTargetX = (dir: Dir) => {
    if (dir === "left") return -85;
    if (dir === "right") return 85;
    return 0;
  };

  const resetPositions = () => {
    Animated.parallel([
      Animated.spring(ballXY, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
      Animated.spring(keeperX, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
    ]).start();
  };

  const resolveShot = (shotDir: Dir, keeperDirNow: Dir, power01: number) => {
    // power01: 0..1, tiros más fuertes = más prob de gol
    // Probabilidades ajustadas:
    // - si adivina el lado: más chance de atajar, pero disminuye con potencia
    // - si no adivina: chance baja de atajar, y aún más baja con potencia
    const sameSide = keeperDirNow === shotDir;

    const saveChance = sameSide
      ? clamp(0.78 - power01 * 0.35, 0.35, 0.78) // fuerte => menos ataja
      : clamp(0.18 - power01 * 0.1, 0.05, 0.18);

    const saved = Math.random() < saveChance;
    return saved;
  };

  const shoot = (dx: number, dy: number) => {
    if (shooting || shots >= MAX_SHOTS) return;

    setShooting(true);
    setMessage("");

    const shotDir = dirFromDx(dx);

    // “Potencia” basada en cuánto arrastró hacia arriba
    // (más negativo = más fuerte)
    const pullUp = clamp(-dy, 0, 240);
    const power01 = clamp(pullUp / 240, 0, 1);

    // Elegir portero ANTES de animar para evitar estado async
    const keeperChoice =
      directions[Math.floor(Math.random() * directions.length)];
    setKeeperDir(keeperChoice);

    // Mueve portero
    Animated.timing(keeperX, {
      toValue: keeperTargetX(keeperChoice),
      duration: 180,
      useNativeDriver: true,
    }).start();

    // Anima balón (x depende del swipe, y sube fijo; potencia afecta un poquito)
    const GOAL_WIDTH = 200;
    const ballToX = clamp(dx / 2, -GOAL_WIDTH / 2, GOAL_WIDTH / 2);
    const ballToY = GOAL_LINE_Y - power01 * 10;

    Animated.timing(ballXY, {
      toValue: { x: ballToX, y: ballToY },
      duration: 520,
      useNativeDriver: true,
    }).start();

    // Resolver resultado
    setShots((prev) => prev + 1);

    setTimeout(() => {
      const saved = resolveShot(shotDir, keeperChoice, power01);

      if (saved) {
        setOverlay("save");
        setMessage("🧤 ¡Atajada del portero!");
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
      } else {
        setScore((prev) => prev + 1);
        setOverlay("goal");
        setMessage("⚽ ¡GOOOOL!");
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }

      // Reset para siguiente tiro
      setTimeout(() => {
        resetPositions();
        setShooting(false);
        setOverlay(null);
      }, 650);
    }, 560);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !shooting && shots < MAX_SHOTS,
        onMoveShouldSetPanResponder: () => !shooting && shots < MAX_SHOTS,
        onPanResponderMove: (_, gesture) => {
          if (shooting || shots >= MAX_SHOTS) return;

          // Movemos ligeramente el balón con el dedo (preview)
          const x = clamp(gesture.dx, -140, 140);
          const y = clamp(gesture.dy, -120, 60);
          ballXY.setValue({ x: x * 0.25, y: y * 0.25 });
        },
        onPanResponderRelease: (_, gesture) => {
          // Disparo al soltar
          shoot(gesture.dx, gesture.dy);
        },
        onPanResponderTerminate: () => {
          // Si el gesto se cancela
          if (!shooting) resetPositions();
        },
      }),
    [shooting, shots],
  );

  const resetGame = () => {
    setScore(0);
    setShots(0);
    setMessage("");
    setKeeperDir("center");
    setShooting(false);
    resetPositions();
  };

  const progress = shots / MAX_SHOTS;

  const gameOver = shots >= MAX_SHOTS;
  const win = score >= 3;
  const ballScale = ballXY.y.interpolate({
    inputRange: [GOAL_LINE_Y, 0],
    outputRange: [0.55, 1],
    extrapolate: "clamp",
  });

  const handleReward = () => {
    showRewardedAd(async () => {
      try {
        const { success, points, xp, fromGame } =
          await descountLimitAdsPerDayAndAddPoint("game");
        if (success) {
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              points: points ?? prev.points,
              xp: xp ?? prev.xp,
              fromGame: fromGame ?? prev.fromGame,
            };
          });
        }
      } catch (error) {
        return;
      } finally {
        loadRewardedAd();
      }
    });
  };

  return (
    <Card style={styles.container}>
      {user?.fromGame ? (
        <View style={styles.alreadyPlayedBox}>
          <Text style={styles.alreadyPlayedTitle}>⚽ Tanda ya jugada</Text>

          <Text style={styles.alreadyPlayedText}>
            Ya reclamaste la recompensa del mini-juego hoy.
          </Text>

          <Text style={styles.alreadyPlayedHint}>
            Vuelve mañana para jugar otra vez y ganar más puntos.
          </Text>
        </View>
      ) : (
        <Card.Content style={styles.content}>
          <Text variant="titleLarge" style={styles.title}>
            ⚽ Tanda de Penales
          </Text>
          <Text style={styles.rewardInfo}>
            🎮 Gracias por jugar. Al finalizar la tanda recibirás **1 punto de
            recompensa**.
          </Text>

          <View style={styles.topRow}>
            <View style={styles.scorePill}>
              <Text style={styles.scoreText}>Goles</Text>
              <Text style={styles.scoreValue}>
                {score} / {shots}
              </Text>
            </View>

            <View style={styles.scorePill}>
              <Text style={styles.scoreText}>Portero</Text>
              <Text style={styles.scoreValue}>
                {keeperDir === "left"
                  ? "⬅️"
                  : keeperDir === "right"
                    ? "➡️"
                    : "⏺️"}
              </Text>
            </View>
          </View>

          <ProgressBar progress={progress} style={styles.progress} />

          <View style={styles.goalArea}>
            <Image
              source={require("@/assets/game/field.png")}
              style={styles.goal}
            />

            {/* Portero */}
            <Animated.Image
              source={require("@/assets/game/goalkeeper.png")}
              style={[styles.keeper, { transform: [{ translateX: keeperX }] }]}
            />

            {/* Balón (con gesto) */}
            <View style={styles.ballTouchArea} {...panResponder.panHandlers}>
              <Animated.Image
                source={require("@/assets/game/ball.png")}
                style={[
                  styles.ball,
                  {
                    transform: [
                      ...ballXY.getTranslateTransform(),
                      { scale: ballScale },
                    ],
                  },
                ]}
              />
              <Text style={styles.hint}>
                {gameOver
                  ? "Fin de la tanda"
                  : shooting
                    ? "Disparando..."
                    : "Desliza para patear (izq/centro/der) ↑ potencia"}
              </Text>
            </View>
            {overlay && (
              <View style={styles.overlay}>
                <Text
                  style={overlay === "goal" ? styles.goalText : styles.saveText}
                >
                  {overlay === "goal" ? "GOOOL!" : "ATAJADA"}
                </Text>
              </View>
            )}
          </View>

          {!!message && <Text style={styles.message}>{message}</Text>}

          {gameOver ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>
                {win ? "🏆 ¡Gran tanda!" : "👏 Buen intento"}
              </Text>

              <Text style={styles.rewardMessage}>
                🎁 Reclama tu recompensa viendo un video.
              </Text>

              <Button
                mode="contained"
                onPress={handleReward}
                style={styles.rewardBtn}
              >
                Reclamar recompensa
              </Button>
            </View>
          ) : (
            <Button
              mode="outlined"
              disabled={shooting}
              onPress={resetGame}
              style={styles.btnSecondary}
            >
              Reiniciar
            </Button>
          )}
        </Card.Content>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 6,
  },
  alreadyPlayedBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
  },

  alreadyPlayedTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },

  alreadyPlayedText: {
    fontSize: 13,
    opacity: 0.8,
  },

  alreadyPlayedHint: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.6,
  },
  content: {
    alignItems: "center",
    paddingBottom: 18,
  },
  title: {
    marginBottom: 10,
    fontWeight: "800",
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scorePill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  scoreText: {
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  progress: {
    width: "100%",
    height: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalArea: {
    width: Math.min(width * 0.9, 420),
    height: 280,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
    overflow: "hidden",
  },
  goal: {
    width: "100%",
    height: GOAL_HEIGHT,
    resizeMode: "contain",
    position: "absolute",
    top: 0,
  },
  keeper: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    position: "absolute",
    top: GOAL_HEIGHT * 0.25,
  },
  ballTouchArea: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  ball: {
    width: 50,
    height: 50,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.65,
  },
  message: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
  },
  resultBox: {
    width: "100%",
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    gap: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  btn: {
    width: "100%",
    borderRadius: 14,
  },
  btnSecondary: {
    width: "100%",
    borderRadius: 14,
    marginTop: 10,
  },
  rewardInfo: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.75,
    marginBottom: 10,
  },
  rewardMessage: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  goalText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#4CAF50",
    textShadowColor: "black",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  saveText: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FF5252",
    textShadowColor: "black",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  rewardBtn: {
    marginTop: 10,
    width: "100%",
    borderRadius: 14,
  },
});
