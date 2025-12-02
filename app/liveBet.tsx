import { useFetch } from "@/hooks/FetchContext";
import { BetInfo, LiveMatch, RootStackParamList, setBet, UserBet } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  List,
  Text,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

type liveBetRouteProp = RouteProp<RootStackParamList, "liveBet">;

export default function LiveBetScreen() {
  const route = useRoute<liveBetRouteProp>();
  const betId = route.params?.id as string | undefined;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { getBetAndPredictionOddsByBetId, getLiveMatch, betSetResults } = useFetch();

  const [betInfo, setBetInfo] = useState<BetInfo | null>(null);
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1) Carga inicial: obtener la apuesta SOLO UNA VEZ
  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      if (!betId) return;
      try {
        setLoading(true);
        const { success, betInfo } = await getBetAndPredictionOddsByBetId(
          betId
        ); // ✅ SOLO UNA VEZ
        if (mounted && success && betInfo) {
          setBetInfo(betInfo);
          // Cargar live del fixture inicial
          const { live } = await getLiveMatch(betInfo.bet.fixtureId);
          if (!mounted) return;
          setLiveMatch(live);
          if (isFinished(live!)) setFinished(true);
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
  }, [betId, getBetAndPredictionOddsByBetId, getLiveMatch]);

  // 2) Polling cada 30s: SOLO actualiza el liveMatch
  useEffect(() => {
    if (!betInfo?.bet.fixtureId || finished) return;

    const tick = async () => {
      try {
        const { live } = await getLiveMatch(betInfo.bet.fixtureId);
        setLiveMatch(live);

        if (isFinished(live!)) {
          const results: setBet[] = betInfo.bet.users.map((u) => ({
            userId: u.userId ?? "",
            winner: evaluateUserBet(u, live!) === "WIN",
          }));

          const { success } = await betSetResults(betId!, results);

          if(success){
            setFinished(true);
          }

          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (e) {
        console.error("❌ Error en polling live:", e);
      }
    };

    tick();
    pollRef.current = setInterval(tick, 30000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [betInfo?.bet.fixtureId, finished, getLiveMatch]);

  if (loading || !betInfo || !liveMatch) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  const { bet } = betInfo;
  const fixture = liveMatch;

  // --- Lógica de evaluación ---
  const evaluateUserBet = (
    u: UserBet,
    f: LiveMatch
  ): "WIN" | "LOSE" | "PENDING" => {
    switch (u.selection.market) {
      case "RESULT_1X2": {
        const currentResult =
          f.goals.home > f.goals.away
            ? "LOCAL"
            : f.goals.home < f.goals.away
            ? "AWAY"
            : "DRAW";
        return u.selection.pick === currentResult ? "WIN" : "LOSE";
      }
      case "EXACT_SCORE": {
        return u.selection.home === f.goals.home &&
          u.selection.away === f.goals.away
          ? "WIN"
          : "LOSE";
      }
      case "OVER_UNDER": {
        const totalGoals = f.goals.home + f.goals.away;
        const condition =
          u.selection.side === "OVER"
            ? totalGoals > u.selection.line
            : totalGoals < u.selection.line;
        return condition ? "WIN" : "LOSE";
      }
      default:
        return "PENDING";
    }
  };

  const winners = useMemo(
    () =>
      finished
        ? bet.users.filter((u) => evaluateUserBet(u, fixture) === "WIN")
        : [],
    [finished, bet.users, fixture]
  );

  const actionMatch = (id: string) => navigation.navigate("match", { id });

  return (
    <PrivateLayout>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* ENCABEZADO */}
        <Card style={{ marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => actionMatch(fixture.fixtureId.toString())}
          >
            <Card.Title
              title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
              subtitle={
                isFinished(fixture)
                  ? "Finalizado"
                  : `Min ${fixture.status.elapsed ?? 0} | ${
                      fixture.status.long
                    }`
              }
            />
          </TouchableOpacity>
          <Card.Content>
            <Text
              style={{ fontSize: 22, fontWeight: "bold", textAlign: "center" }}
            >
              {fixture.goals.home} - {fixture.goals.away}
            </Text>
            <Text style={{ textAlign: "center", marginTop: 4 }}>
              Tipo de apuesta: {bet.betType} | Stake: {bet.stake}
            </Text>
          </Card.Content>
        </Card>

        {/* EN VIVO o RESUMEN */}
        {!finished ? (
          <Card>
            <Card.Title title="Usuarios en la mesa" />
            <Card.Content>
              {bet.users.map((u, idx) => {
                const status = evaluateUserBet(u, fixture);
                return (
                  <List.Item
                    key={idx}
                    title={u.name}
                    description={`Selección: ${formatSelection(u.selection)}`}
                    right={() => (
                      <Text
                        style={{
                          color: status === "WIN" ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {status === "WIN" ? `Ganando` : "Perdiendo"}
                      </Text>
                    )}
                    left={() => (
                      <Text style={{ marginRight: 10 }}>
                        {status === "WIN" ? "🏆" : "❌"}
                      </Text>
                    )}
                  />
                );
              })}
            </Card.Content>
          </Card>
        ) : (
          <Card>
            <Card.Title title="🏁 Resultado final de la apuesta" />
            <Card.Content>
              {winners.length > 0 ? (
                <>
                  {winners.map((w, i) => (
                    <List.Item
                      key={i}
                      title={w.name}
                      description={`Ganó ${bet.stake} puntos`}
                      left={() => <Text style={{ marginRight: 10 }}>🥇</Text>}
                    />
                  ))}
                  <Text style={{ textAlign: "center", marginTop: 8 }}>
                    ¡Felicidades a los ganadores!
                  </Text>
                </>
              ) : (
                <Text style={{ textAlign: "center" }}>
                  Nadie acertó esta vez 😅
                </Text>
              )}

              <Button
                mode="contained"
                style={{ marginTop: 10 }}
                onPress={() => actionMatch(String(fixture.fixtureId))}
              >
                Ver detalles del partido
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </PrivateLayout>
  );
}

/** Helpers */
function isFinished(f: LiveMatch) {
  return (
    f.status?.short === "FT" || f.status?.long?.toLowerCase().includes("final")
  );
}

function formatSelection(sel: any): string {
  if (!sel) return "-";
  if (sel.pick) return sel.pick;
  if (sel.home !== undefined && sel.away !== undefined)
    return `${sel.home}-${sel.away}`;
  if (sel.side) return `${sel.side} ${sel.line}`;
  return JSON.stringify(sel);
}
