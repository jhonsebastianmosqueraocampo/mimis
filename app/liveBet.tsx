import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
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
     CARGA INICIAL
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

        // Intentamos cargar liveMatch (puede ser null si no ha empezado)
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
      } catch (e) {
        console.error("❌ Error inicial:", e);
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
      } catch (e) {
        console.error("❌ Polling error:", e);
      }
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
     EVALUACIÓN SEGURA
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

  /* =========================
     CÁLCULOS PROTEGIDOS
  ========================= */
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
        title="Cargando"
        subtitle="Estamos preparando la apuesta"
      />
    );
  }

  if (!bet) return null;

  /* =========================
     CASO: PARTIDO NO INICIADO
  ========================= */
  if (!fixture) {
    return (
      <PrivateLayout>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Card style={{ borderRadius: 18, marginBottom: 16 }}>
            <Card.Content style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                🕒 El partido aún no comienza
              </Text>

              <Text
                style={{ marginTop: 6, color: "#666", textAlign: "center" }}
              >
                La apuesta está lista. Cuando el partido inicie, aquí verás el
                marcador en vivo.
              </Text>

              <Text style={{ marginTop: 14 }}>🎯 {bet.betType}</Text>

              <Text style={{ marginTop: 6, fontWeight: "bold" }}>
                💰 Stake: {Number(bet.stake ?? 0).toLocaleString()} pts
              </Text>
            </Card.Content>
          </Card>

          <Card style={{ borderRadius: 18 }}>
            <Card.Title title="Usuarios inscritos" />
            <Card.Content>
              {(bet.users ?? []).map((u, idx) => (
                <Card
                  key={idx}
                  style={{
                    marginBottom: 10,
                    borderRadius: 14,
                    elevation: 2,
                  }}
                >
                  <Card.Content>
                    <Text style={{ fontWeight: "600" }}>
                      {u?.name ?? "Usuario"}
                    </Text>

                    <Text style={{ marginTop: 4, color: "#666" }}>
                      🎯 {formatSelection(u?.selection)}
                    </Text>

                    <Text
                      style={{
                        marginTop: 6,
                        fontWeight: "bold",
                        color: "#FFA000",
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
     PARTIDO EN VIVO / FINALIZADO
  ========================= */
  return (
    <PrivateLayout>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Card style={{ borderRadius: 18, marginBottom: 16 }}>
          <Card.Content>
            <Text style={{ textAlign: "center", color: "#777" }}>
              {fixture?.league?.name ?? ""}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 12,
              }}
            >
              <Text numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
                {fixture?.teams?.home?.name ?? "-"}
              </Text>

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {fixture?.goals?.home ?? 0} - {fixture?.goals?.away ?? 0}
              </Text>

              <Text numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
                {fixture?.teams?.away?.name ?? "-"}
              </Text>
            </View>

            <Text style={{ textAlign: "center", color: "#666" }}>
              {isFinished(fixture)
                ? "Finalizado"
                : `Min ${fixture?.status?.elapsed ?? 0}`}
            </Text>

            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              💰 Bote: {totalPot.toLocaleString()} pts
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ borderRadius: 18 }}>
          <Card.Title title="Usuarios en la mesa" />
          <Card.Content>
            {(bet.users ?? []).map((u, idx) => {
              const status = evaluateUserBet(u, fixture);

              return (
                <Card
                  key={idx}
                  style={{
                    marginBottom: 12,
                    borderRadius: 16,
                    elevation: 2,
                  }}
                >
                  <Card.Content>
                    <Text style={{ fontWeight: "600" }}>
                      {u?.name ?? "Usuario"}
                    </Text>

                    <Text style={{ marginTop: 4, color: "#666" }}>
                      🎯 {formatSelection(u?.selection)}
                    </Text>

                    {status === "WIN" && (
                      <Text
                        style={{
                          marginTop: 6,
                          fontWeight: "bold",
                          color: "#1DB954",
                        }}
                      >
                        🟢 Va ganando: {prizePerWinner.toLocaleString()} pts
                      </Text>
                    )}

                    {status === "LOSE" && (
                      <Text
                        style={{
                          marginTop: 6,
                          fontWeight: "bold",
                          color: "#E53935",
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
            style={{ marginTop: 16 }}
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

/* =========================
   HELPERS
========================= */
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
