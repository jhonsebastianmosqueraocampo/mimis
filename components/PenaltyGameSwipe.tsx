import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    View,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Button, Card, Text } from "react-native-paper";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function PenaltyGameSwipe() {
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState("");
  const [keeperPos, setKeeperPos] = useState("center");
  const [shooting, setShooting] = useState(false);

  const ballX = useSharedValue(0);
  const ballY = useSharedValue(0);
  const keeperX = useSharedValue(0);

  const directions = ["left", "center", "right"];

  const keeperStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: keeperX.value }],
  }));

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ballX.value },
      { translateY: ballY.value },
    ],
  }));

  const resetPositions = () => {
    ballX.value = withTiming(0, { duration: 400 });
    ballY.value = withTiming(0, { duration: 400 });
    keeperX.value = withTiming(0, { duration: 400 });
  };

  const moveKeeper = () => {
    const random = directions[Math.floor(Math.random() * 3)];
    setKeeperPos(random);
    let targetX = 0;
    if (random === "left") targetX = -80;
    else if (random === "right") targetX = 80;
    keeperX.value = withTiming(targetX, { duration: 400 });
  };

  const shoot = (dx: number, dy: number) => {
    if (shooting || shots >= 5) return;
    setShooting(true);
    setShots((prev) => prev + 1);
    setMessage("");
    moveKeeper();

    const dir =
      dx < -30 ? "left" : dx > 30 ? "right" : "center";

    // Animar el balón hacia arriba
    ballX.value = withTiming(dx / 2, { duration: 600 });
    ballY.value = withTiming(-220, { duration: 600 });

    // Resolver el resultado después del tiro
    setTimeout(() => {
      const saved =
        (keeperPos === dir && Math.random() < 0.8) ||
        (keeperPos !== dir && Math.random() < 0.2);

      if (saved) {
        runOnJS(setMessage)("🧤 ¡Atajada del portero!");
      } else {
        runOnJS(setScore)((prev) => prev + 1);
        runOnJS(setMessage)("⚽ ¡GOOOOL!");
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Success
        );
      }

      // Reiniciar
      setTimeout(() => {
        runOnJS(resetPositions)();
        runOnJS(setShooting)(false);
      }, 800);
    }, 700);
  };

  const onGesture = (event: any) => {
    const { translationX, translationY, state } = event.nativeEvent;
    if (state === 5) {
      // END
      shoot(translationX, translationY);
    }
  };

  const resetGame = () => {
    setScore(0);
    setShots(0);
    setMessage("");
  };

  return (
    <Card style={styles.container}>
      <Card.Content style={{ alignItems: "center" }}>
        <Text variant="titleLarge" style={{ marginBottom: 10 }}>
          ⚽ Tanda de Penales
        </Text>
        <Text>
          Goles: {score} / {shots}
        </Text>

        <View style={styles.goalArea}>
          <Image
            source={{ uri: "https://i.imgur.com/wR9EJmV.png" }}
            style={styles.goal}
          />

          {/* Portero */}
          <Animated.Image
            source={{ uri: "https://i.imgur.com/Z3A7mSh.png" }}
            style={[styles.keeper, keeperStyle]}
          />

          {/* Balón con gesto */}
          <PanGestureHandler onHandlerStateChange={onGesture}>
            <Animated.View style={[styles.ballContainer]}>
              <Animated.Image
                source={{ uri: "https://i.imgur.com/jcF5u8J.png" }}
                style={[styles.ball, ballStyle]}
              />
            </Animated.View>
          </PanGestureHandler>
        </View>

        <Text style={{ marginTop: 10 }}>{message}</Text>

        {shots >= 5 && (
          <>
            <Text style={{ marginTop: 15, fontWeight: "bold" }}>
              {score >= 3 ? "🏆 ¡Ganaste la tanda!" : "😢 Perdiste la tanda"}
            </Text>
            <Button
              mode="contained"
              style={{ marginTop: 10 }}
              onPress={resetGame}
            >
              Reintentar
            </Button>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 20,
    elevation: 5,
  },
  goalArea: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: 20,
    width: width * 0.8,
    height: 250,
  },
  goal: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    position: "absolute",
  },
  keeper: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: 70,
  },
  ballContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  ball: {
    width: 40,
    height: 40,
  },
});