import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { LiveEvent, LiveMatch } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FixtureLineups from "./FixtureLineups";

const { width } = Dimensions.get("window");
const FIELD_WIDTH = width - 40;
const FIELD_HEIGHT = (FIELD_WIDTH * 3) / 2;

type DynamicMatchViewProps = {
  fixtureId: string;
  live: LiveMatch;
};

export default function DynamicMatchView({
  fixtureId,
  live,
}: DynamicMatchViewProps) {
  // ⚽ posición del balón
  const ballX = useRef(new Animated.Value(FIELD_WIDTH / 2)).current;
  const ballY = useRef(new Animated.Value(FIELD_HEIGHT / 2)).current;

  // 💬 animación del banner de evento
  const eventOpacity = useRef(new Animated.Value(0)).current;
  const [eventMessage, setEventMessage] = useState<string>("");

  // 🆕 Último evento recordado
  const lastEventRef = useRef<LiveEvent | null>(null);

  // ✅ NUEVO: “flash” del campo en eventos importantes
  const fieldFlash = useRef(new Animated.Value(0)).current;

  // ✅ NUEVO: control del idle loop
  const idleLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // ✅ NUEVO: helper para Y con sentido (no random puro)
  const getZoneY = (type?: string) => {
    // Valores en pixels dentro del FIELD_HEIGHT
    // Arriba = más ataque / peligro, Medio = disputa, Abajo = transición/repliegue
    if (type === "Goal") return FIELD_HEIGHT * 0.18;
    if (type === "Card") return FIELD_HEIGHT * 0.5;
    if (type === "Substitution") return FIELD_HEIGHT * 0.62;
    return FIELD_HEIGHT * 0.72;
  };

  // ✅ NUEVO: iniciar / detener idle (balón “respira”)
  const startIdle = () => {
    if (idleLoopRef.current) return;

    // Suave, lento, casi imperceptible: da vida sin molestar
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ballY, {
          toValue: FIELD_HEIGHT * 0.46,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(ballY, {
          toValue: FIELD_HEIGHT * 0.54,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    idleLoopRef.current = loop;
    loop.start();
  };

  const stopIdle = () => {
    idleLoopRef.current?.stop?.();
    idleLoopRef.current = null;
  };

  // ✅ NUEVO: flash suave del campo para eventos importantes
  const flashField = (event: LiveEvent) => {
    const isBig =
      event.type === "Goal" ||
      (event.type === "Card" && event.detail?.includes("Red"));
    if (!isBig) return;

    fieldFlash.stopAnimation();
    fieldFlash.setValue(0);

    Animated.sequence([
      Animated.timing(fieldFlash, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(fieldFlash, {
        toValue: 0,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // ✅ NUEVO: inicia idle al montar (para que nunca se vea “muerta”)
  useEffect(() => {
    startIdle();
    return () => stopIdle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // ✅ NUEVO: al haber evento, pausa idle para que el movimiento “tenga sentido”
      stopIdle();

      triggerEventAnimation(latest);
      animateBall(latest, live);

      // ✅ NUEVO: flash en eventos importantes
      flashField(latest);

      // ✅ NUEVO: después de un rato sin acción, vuelve el idle
      // (si llegan eventos seguidos, este timer se “pisa” naturalmente)
      const t = setTimeout(() => startIdle(), 4500);
      return () => clearTimeout(t);
    }
  }, [live.events]); // mantenemos tu dependencia

  // 🎬 Mover el balón según el evento
  const animateBall = (event: LiveEvent, liveMatch: LiveMatch | null) => {
    const isHome = event.team?.id === liveMatch?.teams.home.id;

    // X con sentido: home ataca hacia un lado, away hacia el otro
    const toX = isHome ? FIELD_WIDTH * 0.3 : FIELD_WIDTH * 0.7;

    // ✅ NUEVO: Y con sentido (según tipo) + pequeña variación controlada
    const baseY = getZoneY(event.type);
    const jitter = Math.random() * FIELD_HEIGHT * 0.06 - FIELD_HEIGHT * 0.03; // +/- 3%
    const toY = Math.max(
      FIELD_HEIGHT * 0.12,
      Math.min(FIELD_HEIGHT * 0.88, baseY + jitter),
    );

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
        message = `⚽ ¡Gol de ${event.player?.name || "Jugador"}! (${event.team?.name})`;
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

  // ✅ NUEVO: color del campo con “flash”
  const fieldBg = fieldFlash.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.secondary], // flash suave
  });

  return (
    <View style={{ marginTop: 10 }}>
      {/* 🟩 Cancha */}
      <Animated.View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: fieldBg as any, // Animated color
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
          style={[
            styles.ball,
            {
              transform: [{ translateX: ballX }, { translateY: ballY }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.ballText}>⚽</Text>
        </Animated.View>

        {/* 💬 Banner animado */}
        <Animated.View
          style={[styles.eventBanner, { opacity: eventOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.eventText}>{eventMessage}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },

  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  ball: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    justifyContent: "center",
    alignItems: "center",
  },

  ballText: {
    ...typography.small,
  },

  eventBanner: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    backgroundColor: colors.background + "CC",
    paddingVertical: spacing.xs ?? 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },

  eventText: {
    ...typography.small,
    color: colors.textOnPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
});
