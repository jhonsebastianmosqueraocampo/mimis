import * as Haptics from "expo-haptics";
import React, { useMemo, useRef, useState } from "react";
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

export default function PenaltyGameSwipe() {
  const MAX_SHOTS = 5;

  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState("");
  const [shooting, setShooting] = useState(false);
  const [keeperDir, setKeeperDir] = useState<Dir>("center");

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
      duration: 260,
      useNativeDriver: true,
    }).start();

    // Anima balón (x depende del swipe, y sube fijo; potencia afecta un poquito)
    const ballToX = clamp(dx / 2, -110, 110);
    const ballToY = -220 - power01 * 20;

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
        setMessage("🧤 ¡Atajada del portero!");
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        ).catch(() => {});
      } else {
        setScore((prev) => prev + 1);
        setMessage("⚽ ¡GOOOOL!");
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }

      // Reset para siguiente tiro
      setTimeout(() => {
        resetPositions();
        setShooting(false);
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
    [shooting, shots]
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

  return (
    <Card style={styles.container}>
      <Card.Content style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          ⚽ Tanda de Penales
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
            source={{ uri: "https://i.imgur.com/wR9EJmV.png" }}
            style={styles.goal}
          />

          {/* Portero */}
          <Animated.Image
            source={{ uri: "https://i.imgur.com/Z3A7mSh.png" }}
            style={[styles.keeper, { transform: [{ translateX: keeperX }] }]}
          />

          {/* Balón (con gesto) */}
          <View style={styles.ballTouchArea} {...panResponder.panHandlers}>
            <Animated.Image
              source={{ uri: "https://i.imgur.com/jcF5u8J.png" }}
              style={[
                styles.ball,
                { transform: ballXY.getTranslateTransform() },
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
        </View>

        {!!message && <Text style={styles.message}>{message}</Text>}

        {gameOver ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              {win ? "🏆 ¡Ganaste la tanda!" : "😢 Perdiste la tanda"}
            </Text>
            <Button mode="contained" onPress={resetGame} style={styles.btn}>
              Reintentar
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
  },
  goal: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    position: "absolute",
    opacity: 0.95,
  },
  keeper: {
    width: 84,
    height: 84,
    resizeMode: "contain",
    position: "absolute",
    top: 78,
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
    width: 44,
    height: 44,
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
});
