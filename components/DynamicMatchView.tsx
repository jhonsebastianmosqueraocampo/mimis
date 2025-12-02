import { LiveEvent, LiveMatch } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Text, View } from "react-native";
import FixtureLineups from "./FixtureLineups";

const { width } = Dimensions.get("window");
const FIELD_WIDTH = width - 40;
const FIELD_HEIGHT = (FIELD_WIDTH * 3) / 2;

type DynamicMatchViewProps = {
  fixtureId: string;
  live: LiveMatch;
};

export default function DynamicMatchView({ fixtureId, live }: DynamicMatchViewProps) {
  // ⚽ posición del balón
  const ballX = useRef(new Animated.Value(FIELD_WIDTH / 2)).current;
  const ballY = useRef(new Animated.Value(FIELD_HEIGHT / 2)).current;

  // 💬 animación del banner de evento
  const eventOpacity = useRef(new Animated.Value(0)).current;
  const [eventMessage, setEventMessage] = useState<string>("");

  // 🆕 Último evento recordado
  const lastEventRef = useRef<LiveEvent | null>(null);

  // 🧠 Detectar nuevo evento en vivo
  useEffect(() => {
    if (!live?.events || live.events.length === 0) return;

    const latest = live.events[live.events.length - 1];

    // Si el último evento es nuevo, dispara la animación
    if (
      !lastEventRef.current ||
      latest.time.elapsed !== lastEventRef.current.time.elapsed ||
      latest.player?.id !== lastEventRef.current.player?.id
    ) {
      lastEventRef.current = latest;
      triggerEventAnimation(latest);
      animateBall(latest, live);
    }
  }, [live.events]);

  // 🎬 Mover el balón según el evento
  const animateBall = (event: LiveEvent, live: LiveMatch | null) => {
    const isHome = event.team?.id === live?.teams.home.id;
    const toX = isHome ? FIELD_WIDTH * 0.3 : FIELD_WIDTH * 0.7;
    const toY =
      Math.random() * (FIELD_HEIGHT * 0.8 - FIELD_HEIGHT * 0.2) +
      FIELD_HEIGHT * 0.2;

    Animated.sequence([
      Animated.timing(ballX, {
        toValue: toX,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(ballY, {
        toValue: toY,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // 💬 Mostrar banner animado de evento
  const triggerEventAnimation = (event: LiveEvent) => {
    let message = "";

    switch (event.type) {
      case "Goal":
        message = `⚽ ¡Gol de ${event.player?.name || "Jugador"}! (${
          event.team?.name
        })`;
        break;
      case "Card":
        if (event.detail?.includes("Yellow"))
          message = `🟨 Tarjeta amarilla para ${event.player?.name}`;
        else if (event.detail?.includes("Red"))
          message = `🟥 Tarjeta roja para ${event.player?.name}`;
        break;
      case "Substitution":
        message = `🔄 Cambio en ${event.team?.name}: entra ${event.assist?.name}, sale ${event.player?.name}`;
        break;
      default:
        message = `${event.type} - ${event.team?.name}`;
    }

    setEventMessage(message);
    eventOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(eventOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(eventOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={{ marginTop: 10 }}>
      {/* 🟩 Cancha */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          overflow: "hidden",
          height: FIELD_HEIGHT,
          backgroundColor: "#0b6623",
        }}
      >
        {live && (
          <FixtureLineups
            fixtureId={fixtureId}
            events={live.events}
            status={live.status}
          />
        )}

        {/* ⚽ Balón animado */}
        <Animated.View
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#333",
            justifyContent: "center",
            alignItems: "center",
            transform: [{ translateX: ballX }, { translateY: ballY }],
          }}
        >
          <Text style={{ fontSize: 10 }}>⚽</Text>
        </Animated.View>

        {/* 💬 Banner animado */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 16,
            alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.75)",
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 10,
            opacity: eventOpacity,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {eventMessage}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}