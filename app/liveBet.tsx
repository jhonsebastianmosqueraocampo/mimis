import { useFetch } from "@/hooks/FetchContext";
import { BetInfo, LiveMatch, RootStackParamList, UserBet } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { ActivityIndicator, Card, List, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

type liveBetRouteProp = RouteProp<RootStackParamList, "liveBet">;

export default function LiveBetScreen() {
  const route = useRoute<liveBetRouteProp>();
  const betId = route.params?.id; // 👈 directo del route

  const { getBetAndPredictionOddsByBetId, getLiveMatch } = useFetch();

  const [betInfo, setBetInfo] = useState<BetInfo | null>(null);
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!betId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const { success, betInfo } = await getBetAndPredictionOddsByBetId(
          betId
        );
        if (success && betInfo) {
          const { live } = await getLiveMatch(betInfo.bet.fixtureId);
          setBetInfo(betInfo);
          setLiveMatch(live);
        }
      } catch (err) {
        console.error("❌ Error cargando live bet:", err);
      } finally {
        setLoading(false);
      }
    };

    if (betId) {
      loadData();
    }

    let interval: ReturnType<typeof setInterval>;

    interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, [betId]);

  if (loading || !betInfo || !liveMatch) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  const { bet } = betInfo;
  const fixture = liveMatch; // 👈 usar el fixture en vivo

  // Evaluar resultados actuales (tiempo real)
  const evaluateUserBet = (
    u: UserBet,
    fixture: LiveMatch
  ): "WIN" | "LOSE" | "PENDING" => {
    switch (u.selection.market) {
      case "RESULT_1X2": {
        const currentResult =
          fixture.goals.home > fixture.goals.away
            ? "LOCAL"
            : fixture.goals.home < fixture.goals.away
            ? "AWAY"
            : "DRAW";

        return u.selection.pick === currentResult ? "WIN" : "LOSE";
      }

      case "EXACT_SCORE": {
        return u.selection.home === fixture.goals.home &&
          u.selection.away === fixture.goals.away
          ? "WIN"
          : "LOSE";
      }

      case "OVER_UNDER": {
        const totalGoals = fixture.goals.home + fixture.goals.away;
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

  const actionMatch = (id: string) => {
    navigation.navigate("match", { id });
  };

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
                fixture.status.short === "FT"
                  ? "Finalizado"
                  : `Min ${fixture.status.elapsed ?? 0} | ${
                      fixture.status.long
                    }`
              }
            />
          </TouchableOpacity>
          <Card.Content>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}
            >
              {fixture.goals.home} - {fixture.goals.away}
            </Text>
            <Text style={{ textAlign: "center", marginTop: 4 }}>
              Tipo de apuesta: {bet.betType} | Stake: {bet.stake}
            </Text>
          </Card.Content>
        </Card>

        {/* USUARIOS */}
        <Card>
          <Card.Title title="Usuarios en la mesa" />
          <Card.Content>
            {bet.users.map((u, idx) => {
              const liveResult = evaluateUserBet(u, fixture);
              return (
                <List.Item
                  key={idx}
                  title={u.name}
                  description={`Selección: ${formatSelection(u.selection)}`}
                  right={() => (
                    <Text
                      style={{
                        color: liveResult === "WIN" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {liveResult === "WIN"
                        ? `Ganando ${bet.stake} pts`
                        : "Perdiendo"}
                    </Text>
                  )}
                  left={() => (
                    <Text style={{ marginRight: 10 }}>
                      {liveResult === "WIN" ? "🏆" : "❌"}
                    </Text>
                  )}
                />
              );
            })}
          </Card.Content>
        </Card>
      </ScrollView>
    </PrivateLayout>
  );
}

// helper para mostrar selección
function formatSelection(sel: any): string {
  if (!sel) return "-";
  if (sel.pick) return sel.pick;
  if (sel.home !== undefined && sel.away !== undefined)
    return `${sel.home}-${sel.away}`;
  if (sel.side) return `${sel.side} ${sel.line}`;
  return JSON.stringify(sel);
}
