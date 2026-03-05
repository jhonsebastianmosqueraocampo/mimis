import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { Bet, LiveMatch, RootStackParamList, setBet, UserBet } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

type liveBetRouteProp = RouteProp<RootStackParamList, "liveBet">;

export default function LiveBetScreen() {
  const route = useRoute<liveBetRouteProp>();
  const betId = route.params?.id as string | undefined;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { getLiveBetId, getLiveMatch, betSetResults } = useFetch();

  const [betInfo, setBetInfo] = useState<Bet | null>(null);
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* =========================
     LOAD
  ========================= */

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!betId) return;

      try {
        setLoading(true);

        const { success, bet } = await getLiveBetId(betId);

        if (!success || !mounted) return;

        setBetInfo(bet);

        try {
          const { live } = await getLiveMatch(bet?.fixtureId!);

          if (!mounted) return;

          setLiveMatch(live ?? null);

          if (live && isFinished(live)) {
            setFinished(true);
          }
        } catch {
          setLiveMatch(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [betId]);

  /* =========================
     POLLING
  ========================= */

  useEffect(() => {
    if (!betInfo?.fixtureId || finished) return;

    const tick = async () => {
      try {
        const { live } = await getLiveMatch(betInfo.fixtureId);

        if (!live) {
          setLiveMatch(null);
          return;
        }

        setLiveMatch(live);

        if (isFinished(live)) {
          const results: setBet[] =
            betInfo?.users?.map((u) => ({
              userId: u?.userId ?? "",
              winner: evaluateUserBet(u, live) === "WIN",
            })) ?? [];

          await betSetResults(betId!, results);
          setFinished(true);

          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {}
    };

    tick();

    pollRef.current = setInterval(tick, 30000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [betInfo?.fixtureId, finished]);

  const bet = betInfo;
  const fixture = liveMatch;

  /* =========================
     EVALUATION
  ========================= */

  const evaluateUserBet = (
    u: UserBet,
    f: LiveMatch,
  ): "WIN" | "LOSE" | "PENDING" => {
    if (!bet || !f?.goals) return "PENDING";

    const home = f.goals?.home ?? 0;
    const away = f.goals?.away ?? 0;

    switch (bet.betType) {
      case "RESULT_1X2": {
        const current = home > away ? "LOCAL" : home < away ? "AWAY" : "DRAW";
        return u?.selection?.pick === current ? "WIN" : "LOSE";
      }

      case "EXACT_SCORE": {
        if (
          u?.selection?.home === undefined ||
          u?.selection?.away === undefined
        )
          return "PENDING";

        return u.selection.home === home && u.selection.away === away
          ? "WIN"
          : "LOSE";
      }

      case "OVER_UNDER": {
        if (!u?.selection?.side || u?.selection?.line === undefined)
          return "PENDING";

        const total = home + away;

        const condition =
          u.selection.side === "OVER"
            ? total > u.selection.line
            : total < u.selection.line;

        return condition ? "WIN" : "LOSE";
      }

      default:
        return "PENDING";
    }
  };

  const totalPot = useMemo(() => {
    if (!bet?.users?.length) return 0;
    return Number(bet.stake ?? 0) * bet.users.length;
  }, [bet]);

  const winnersCount = useMemo(() => {
    if (!bet || !fixture) return 0;

    return bet.users.filter((u) => evaluateUserBet(u, fixture) === "WIN")
      .length;
  }, [bet, fixture]);

  const prizePerWinner =
    winnersCount > 0 ? Math.floor(totalPot / winnersCount) : 0;

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <Loading
        visible
        title="Cargando apuesta"
        subtitle="Preparando el partido"
      />
    );
  }

  if (!bet) return null;

  /* =========================
     PARTIDO NO INICIADO
  ========================= */

  if (!fixture) {
    return (
      <PrivateLayout>
        <ScrollView style={{ padding: spacing.md }}>
          <Card
            style={[
              g.card,
              { borderRadius: radius.xl, marginBottom: spacing.md },
            ]}
          >
            <Card.Content style={[g.center]}>
              <Text style={[g.title]}>🕒 Partido aún no inicia</Text>

              <Text style={{ marginTop: spacing.sm, textAlign: "center" }}>
                Cuando el partido empiece verás el marcador en vivo.
              </Text>

              <Text style={{ marginTop: spacing.md }}>🎯 {bet.betType}</Text>

              <Text
                style={{
                  marginTop: spacing.sm,
                  color: colors.primary,
                  fontWeight: "700",
                }}
              >
                💰 Stake {Number(bet.stake ?? 0).toLocaleString()} pts
              </Text>
            </Card.Content>
          </Card>

          <Card style={[g.card]}>
            <Card.Title title="Jugadores en la apuesta" />

            <Card.Content>
              {(bet.users ?? []).map((u, idx) => (
                <Card
                  key={idx}
                  style={[
                    g.card,
                    { marginBottom: spacing.sm, borderRadius: radius.lg },
                  ]}
                >
                  <Card.Content>
                    <Text style={{ fontWeight: "600" }}>
                      {u?.name ?? "Usuario"}
                    </Text>

                    <Text style={{ marginTop: 4 }}>
                      🎯 {formatSelection(u?.selection)}
                    </Text>

                    <Text
                      style={{
                        marginTop: 6,
                        color: "#FFA000",
                        fontWeight: "600",
                      }}
                    >
                      ⏳ En espera
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </Card.Content>
          </Card>
        </ScrollView>
      </PrivateLayout>
    );
  }

  /* =========================
     PARTIDO EN VIVO
  ========================= */

  return (
    <PrivateLayout>
      <ScrollView style={{ padding: spacing.md }}>
        <Card style={[g.card, { marginBottom: spacing.md }]}>
          <Card.Content>
            <Text style={[g.caption, { textAlign: "center" }]}>
              {fixture?.league?.name ?? ""}
            </Text>

            {/* SCOREBOARD */}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: spacing.md,
              }}
            >
              <Text numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
                {fixture?.teams?.home?.name}
              </Text>

              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: colors.primary,
                }}
              >
                {fixture?.goals?.home ?? 0} - {fixture?.goals?.away ?? 0}
              </Text>

              <Text numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
                {fixture?.teams?.away?.name}
              </Text>
            </View>

            <Text style={{ textAlign: "center" }}>
              {isFinished(fixture)
                ? "Finalizado"
                : `Min ${fixture?.status?.elapsed ?? 0}`}
            </Text>

            <Text
              style={{
                marginTop: spacing.md,
                textAlign: "center",
                color: colors.primary,
                fontWeight: "700",
              }}
            >
              💰 Bote {totalPot.toLocaleString()} pts
            </Text>
          </Card.Content>
        </Card>

        <Card style={[g.card]}>
          <Card.Title title="Jugadores en la mesa" />

          <Card.Content>
            {(bet.users ?? []).map((u, idx) => {
              const status = evaluateUserBet(u, fixture);

              return (
                <Card
                  key={idx}
                  style={[
                    g.card,
                    { marginBottom: spacing.sm, borderRadius: radius.lg },
                  ]}
                >
                  <Card.Content>
                    <Text style={{ fontWeight: "600" }}>
                      {u?.name ?? "Usuario"}
                    </Text>

                    <Text style={{ marginTop: 4 }}>
                      🎯 {formatSelection(u?.selection)}
                    </Text>

                    {status === "WIN" && (
                      <Text
                        style={{
                          marginTop: 6,
                          color: colors.primary,
                          fontWeight: "700",
                        }}
                      >
                        🟢 Va ganando {prizePerWinner.toLocaleString()} pts
                      </Text>
                    )}

                    {status === "LOSE" && (
                      <Text
                        style={{
                          marginTop: 6,
                          color: "#E53935",
                          fontWeight: "700",
                        }}
                      >
                        🔴 Va perdiendo
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </Card.Content>
        </Card>

        {finished && (
          <Button
            mode="contained"
            buttonColor={colors.primary}
            style={{ marginTop: spacing.md }}
            onPress={() =>
              navigation.navigate("match", {
                id: String(fixture?.fixtureId ?? ""),
              })
            }
          >
            Ver detalles del partido
          </Button>
        )}
      </ScrollView>
    </PrivateLayout>
  );
}

function isFinished(f: LiveMatch) {
  return (
    f?.status?.short === "FT" ||
    f?.status?.long?.toLowerCase()?.includes("final")
  );
}

function formatSelection(sel: any): string {
  if (!sel) return "-";
  if (sel.pick) return sel.pick;
  if (sel.home !== undefined && sel.away !== undefined)
    return `${sel.home}-${sel.away}`;
  if (sel.side) return `${sel.side} ${sel.line}`;
  return "-";
}
