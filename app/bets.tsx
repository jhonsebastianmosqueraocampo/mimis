import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";
import { Bet, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, List, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function Bets() {
  const { myBets } = useFetch();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { success, bets } = await myBets();
        if (success) {
          setBets(bets);
        }
      } catch (err) {
        return;
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
    return (
      <Loading
        visible={loading}
        title="Cargando apuestas"
        subtitle="Estamos trabajando en las apuestas"
      />
    );
  }

  const activeBets = (bets ?? []).filter((b) => {
    const status = b?.liveMatch?.status?.short;
    return status && status !== "FT";
  });

  const finishedBets = (bets ?? []).filter((b) => {
    const status = b?.liveMatch?.status?.short;
    return status === "FT";
  });

  return (
    <PrivateLayout>
      <ScrollView
        style={
          sx({
            flex: 1,
            bg: colors.background,
          }) as any
        }
        contentContainerStyle={
          sx({
            p: 16,
          }) as any
        }
      >
        {/* BOTÓN UNIRME */}
        <Button
          mode="contained"
          buttonColor={colors.primary}
          style={[sx({ mb: 16 }) as any, { borderRadius: radius.md }]}
          labelStyle={g.subtitle}
          onPress={() => navigation.navigate("betInvite")}
        >
          Unirme a la apuesta
        </Button>

        <View style={sx({ mb: 16 }) as any}>
          <AdBanner />
        </View>

        {/* ACTIVAS */}
        <Card
          style={[
            sx({ mb: 16 }) as any,
            {
              borderRadius: radius.lg,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Card.Title title="Apuestas activas" />
          <Card.Content>
            {activeBets.length === 0 ? (
              <Text>No tienes apuestas activas.</Text>
            ) : (
              activeBets.map((bet) => {
                const match = bet.liveMatch;

                return (
                  <List.Item
                    key={bet._id}
                    onPress={() =>
                      navigation.navigate("liveBet", { id: bet._id })
                    }
                    title={`${match?.teams?.home?.name ?? "-"} vs ${
                      match?.teams?.away?.name ?? "-"
                    }`}
                    description={`Tipo: ${bet.betType} | Cuota: x${bet.stake}`}
                    titleStyle={g.subtitle}
                    descriptionStyle={[
                      g.small,
                      { color: colors.textSecondary },
                    ]}
                    right={() => (
                      <Text style={[g.small, { color: colors.textSecondary }]}>
                        {match?.status?.short ?? "-"}{" "}
                        {match?.status?.elapsed
                          ? `- ${match.status.elapsed}'`
                          : ""}
                      </Text>
                    )}
                  />
                );
              })
            )}
          </Card.Content>
        </Card>

        {/* FINALIZADAS */}
        <Card
          style={[
            sx({ mb: 16 }) as any,
            {
              borderRadius: radius.lg,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Card.Title title="Apuestas finalizadas" />
          <Card.Content>
            {finishedBets.length === 0 ? (
              <Text>No tienes apuestas finalizadas.</Text>
            ) : (
              finishedBets.map((bet) => {
                const match = bet.liveMatch;
                const totalPot =
                  (Number(bet.stake) ?? 0) * (bet.users?.length ?? 0);

                const winnersCount =
                  bet.users?.filter((u) => u.result === "WIN").length ?? 0;

                const prizePerWinner =
                  winnersCount > 0 ? totalPot / winnersCount : 0;
                return (
                  <List.Accordion
                    key={bet._id}
                    title={`${match?.teams?.home?.name ?? "-"} ${
                      match?.goals?.home ?? 0
                    } - ${match?.goals?.away ?? 0} ${
                      match?.teams?.away?.name ?? "-"
                    }`}
                    description={`Tipo: ${bet.betType} | Cuota: x${bet.stake}`}
                    titleStyle={g.subtitle}
                    descriptionStyle={[
                      g.small,
                      { color: colors.textSecondary },
                    ]}
                  >
                    <View style={{ padding: 8 }}>
                      <Text style={g.subtitle}>Resultado final:</Text>

                      <List.Section>
                        {(bet.users ?? []).map((u, idx) => (
                          <List.Item
                            key={idx}
                            title={u?.name ?? "Usuario"}
                            description={() => (
                              <View>
                                <Text>
                                  Selección: {formatSelection(u?.selection)}
                                </Text>
                                <Text>Resultado: {u?.result ?? "-"}</Text>

                                {u?.result === "WIN" && (
                                  <Text
                                    style={[
                                      g.body,
                                      {
                                        fontWeight: "700",
                                        color: colors.success,
                                      },
                                    ]}
                                  >
                                    Ganó: {prizePerWinner.toLocaleString()} pts
                                  </Text>
                                )}
                              </View>
                            )}
                            left={() => (
                              <Text style={[g.body, sx({ mr: 10 }) as any]}>
                                {u?.result === "WIN"
                                  ? "🏆"
                                  : u?.result === "LOSE"
                                    ? "❌"
                                    : "➖"}
                              </Text>
                            )}
                          />
                        ))}
                      </List.Section>
                    </View>
                  </List.Accordion>
                );
              })
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
