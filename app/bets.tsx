import { useFetch } from "@/hooks/FetchContext";
import { BetInfo, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    List,
    Text,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function Bets() {
  const { myBets } = useFetch();
  const [bets, setBets] = useState<BetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { success, bets } = await myBets();
        if (mounted && success && bets) setBets(bets);
      } catch (err) {
        console.log("❌ Error cargando apuestas", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const activeBets = bets.filter(
    (b) => b.predictionOdds.fixture.status.short !== "FT"
  );
  const finishedBets = bets.filter(
    (b) => b.predictionOdds.fixture.status.short === "FT"
  );

  return (
    <PrivateLayout>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* BOTÓN UNIRME */}
        <Button
          mode="contained"
          style={{ marginBottom: 16, borderRadius: 8 }}
          onPress={() => navigation.navigate("betInvite")}
        >
          Unirme a la apuesta
        </Button>

        {/* ACTIVAS */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Apuestas activas" />
          <Card.Content>
            {activeBets.length === 0 ? (
              <Text>No tienes apuestas activas.</Text>
            ) : (
              activeBets.map((info) => (
                <List.Item
                  onPress={() => navigation.navigate("liveBet", { id: info.bet._id })}
                  key={info.bet._id}
                  title={`${info.predictionOdds.fixture.teams.home.name} vs ${info.predictionOdds.fixture.teams.away.name}`}
                  description={`Tipo: ${info.bet.betType} | Stake: ${info.bet.stake}`}
                  right={() => (
                    <Text>
                      {info.predictionOdds.fixture.status.short} - Min{" "}
                      {info.predictionOdds.fixture.status.elapsed}
                    </Text>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* FINALIZADAS */}
        <Card>
          <Card.Title title="Apuestas finalizadas" />
          <Card.Content>
            {finishedBets.length === 0 ? (
              <Text>No tienes apuestas finalizadas.</Text>
            ) : (
              finishedBets.map((info) => (
                <List.Accordion
                  key={info.bet._id}
                  title={`${info.predictionOdds.fixture.teams.home.name} ${info.predictionOdds.fixture.goals.home} - ${info.predictionOdds.fixture.goals.away} ${info.predictionOdds.fixture.teams.away.name}`}
                  description={`Tipo: ${info.bet.betType} | Stake: ${info.bet.stake}`}
                >
                  <View style={{ padding: 8 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      Resultado final: {info.predictionOdds.fixture.teams.home.name}{" "}
                      {info.predictionOdds.fixture.goals.home} -{" "}
                      {info.predictionOdds.fixture.goals.away}{" "}
                      {info.predictionOdds.fixture.teams.away.name}
                    </Text>
                    <Text>
                      Apuesta: {info.bet.betType} | Cuota:{" "}
                      {info.bet.users?.length > 0
                        ? info.predictionOdds.odds ?? "-"
                        : "-"}
                    </Text>

                    <List.Section>
                      {info.bet.users.map((u, idx) => (
                        <List.Item
                          key={idx}
                          title={u.name}
                          description={() => (
                            <View>
                              <Text>
                                Selección: {formatSelection(u.selection)}
                              </Text>
                              <Text>Resultado: {u.result}</Text>
                              {u.result === "WIN" && (
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    color: "green",
                                  }}
                                >
                                  Ganó:{" "}
                                  {Number(info.bet.stake) *
                                    (info.predictionOdds.odds ?? 1)}{" "}
                                  pts
                                </Text>
                              )}
                            </View>
                          )}
                          left={() => (
                            <Text style={{ marginRight: 10 }}>
                              {u.result === "WIN"
                                ? "🏆"
                                : u.result === "LOSE"
                                ? "❌"
                                : "➖"}
                            </Text>
                          )}
                        />
                      ))}
                    </List.Section>
                  </View>
                </List.Accordion>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </PrivateLayout>
  );
}

// Helper para mostrar selección en texto humano
function formatSelection(sel: any): string {
  if (!sel) return "-";
  if (sel.pick) return sel.pick; // RESULT_1X2
  if (sel.home !== undefined && sel.away !== undefined)
    return `${sel.home}-${sel.away}`;
  if (sel.side) return `${sel.side} ${sel.line}`;
  return JSON.stringify(sel);
}