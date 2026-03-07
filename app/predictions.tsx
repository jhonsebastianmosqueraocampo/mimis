import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { PredictionOddsItem, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, View } from "react-native";
import { Button, Card, Chip, Divider, List, Text } from "react-native-paper";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";

import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

function normalizePredictions(raw: any) {
  const base = raw ?? {};
  const hasWrapper =
    typeof base === "object" &&
    (base.predictions || base.comparison || base.h2h);

  const pred = (hasWrapper ? base.predictions : base) || null;
  const h2h = (hasWrapper ? base.h2h : base.h2h) || [];
  const comparison = (hasWrapper ? base.comparison : base.comparison) || null;

  return { pred, h2h, comparison };
}

export default function PredictionsFull() {
  const { getPredictionOdds } = useFetch();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictionOdds, setPredictionOdds] = useState<PredictionOddsItem[]>(
    [],
  );
  const [error, setError] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadPredictionOdds = async () => {
    try {
      setLoading(true);
      setError("");

      const { success, predictionOdds, message } = await getPredictionOdds();

      if (success && predictionOdds?.length > 0) {
        setPredictionOdds(predictionOdds);
      } else {
        setPredictionOdds([]);
        setError(message || "No se encontró información disponible.");
      }
    } catch (err) {
      setError("Error al cargar las predicciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictionOdds();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPredictionOdds();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <Loading visible={loading} />;
  }

  if (error || predictionOdds.length === 0) {
    return (
      <PrivateLayout>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 56, marginBottom: spacing.md }}>⚽⏳</Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: spacing.sm,
            }}
          >
            No hay partidos para predecir ahora
          </Text>

          <Text
            style={{
              fontSize: 14,
              opacity: 0.7,
              textAlign: "center",
              lineHeight: 20,
              marginBottom: spacing.lg,
            }}
          >
            En los próximos 30 minutos no hay encuentros disponibles para
            predicción. Pero aún puedes seguir ganando puntos y estar al día.
          </Text>

          <View style={{ width: "100%", gap: spacing.sm }}>
            <Button
              mode="contained"
              icon="soccer"
              buttonColor={colors.primary}
              onPress={() => navigation.navigate("index")}
            >
              Ver partidos en vivo
            </Button>

            <Button
              mode="outlined"
              icon="dice-multiple"
              onPress={() => navigation.navigate("bets")}
            >
              Revisar apuestas
            </Button>

            <Button
              mode="outlined"
              icon="play-circle"
              onPress={() => console.log("Ganar puntos viendo videos")}
            >
              Ganar puntos viendo videos
            </Button>
          </View>

          <Text
            style={{
              fontSize: 12,
              opacity: 0.6,
              textAlign: "center",
              marginTop: spacing.md,
            }}
          >
            Tip: revisa antes de que inicie un partido y accede a mejores
            predicciones 🔮
          </Text>
        </View>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView
        style={{ padding: spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {predictionOdds.map((item) => {
          const { fixture, predictions, odds } = item;

          const { pred, h2h, comparison } = normalizePredictions(predictions);

          const matchDate = new Date(fixture?.date || "");

          const isLive = ["1H", "2H", "HT", "ET"].includes(
            fixture?.status?.short || "",
          );

          const elapsed = fixture?.status?.elapsed;

          return (
            <Card
              key={fixture?.fixtureId || Math.random()}
              style={{ marginBottom: spacing.lg, borderRadius: radius.md }}
            >
              <Card.Title
                title={`${fixture?.teams?.home?.name ?? "Equipo local"} vs ${
                  fixture?.teams?.away?.name ?? "Equipo visitante"
                }`}
                subtitle={`${fixture?.league?.name ?? "Liga"} · ${
                  fixture?.league?.round || ""
                }`}
                left={() =>
                  fixture?.league?.logo ? (
                    <Image
                      source={{ uri: fixture.league.logo }}
                      style={{ width: 40, height: 40 }}
                    />
                  ) : null
                }
              />

              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>
                    🕒{" "}
                    {matchDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>

                  <Text>📍 {fixture?.venue?.city || ""}</Text>
                </View>

                <Text>Estadio: {fixture?.venue?.name || "Por definir"}</Text>
                <Text>Árbitro: {fixture?.referee || "No asignado"}</Text>

                {isLive ? (
                  <Chip
                    style={{
                      marginTop: spacing.xs,
                      backgroundColor: "#E53935",
                    }}
                    textStyle={{ color: "#fff" }}
                  >
                    EN VIVO · {elapsed ?? ""}′
                  </Chip>
                ) : (
                  <Text style={{ marginTop: spacing.xs, opacity: 0.6 }}>
                    {fixture?.status?.long || "Sin información del estado"}
                  </Text>
                )}

                <Divider style={{ marginVertical: spacing.sm }} />

                {/* CUOTAS */}

                <View style={[g.card, { marginBottom: spacing.md }]}>
                  <Text style={{ fontWeight: "700", marginBottom: spacing.sm }}>
                    Cuotas disponibles
                  </Text>

                  {!odds?.length || !odds[0]?.bookmakers?.length ? (
                    <Text>No hay cuotas disponibles para este partido.</Text>
                  ) : (
                    <List.Section>
                      {odds[0].bookmakers.map((bm: any) => {
                        const filteredBets = (bm.bets || []).filter(
                          (b: any) => {
                            const name = (b?.name || "").toLowerCase();
                            return (
                              name.includes("match winner") ||
                              name.includes("over/under") ||
                              name.includes("correct score")
                            );
                          },
                        );

                        return (
                          <List.Accordion
                            key={bm.id}
                            title={bm.name}
                            left={(props) => (
                              <List.Icon {...props} icon="cash" />
                            )}
                          >
                            {filteredBets.map((bet: any) => (
                              <View key={bet.id} style={{ marginBottom: 12 }}>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    marginBottom: spacing.xs,
                                  }}
                                >
                                  {bet.name}
                                </Text>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {(bet.values || []).map(
                                    (v: any, i: number) => {
                                      const active =
                                        selectedHouse ===
                                        `${bm.name}-${bet.name}-${v.value}`;

                                      return (
                                        <Chip
                                          key={i}
                                          selected={active}
                                          onPress={() =>
                                            setSelectedHouse(
                                              active
                                                ? null
                                                : `${bm.name}-${bet.name}-${v.value}`,
                                            )
                                          }
                                          style={{
                                            margin: 4,
                                            backgroundColor: active
                                              ? colors.primary
                                              : colors.border,
                                          }}
                                          textStyle={{
                                            color: active
                                              ? "#fff"
                                              : colors.textSecondary,
                                          }}
                                        >
                                          {v.value}: {v.odd}
                                        </Chip>
                                      );
                                    },
                                  )}
                                </View>
                              </View>
                            ))}
                          </List.Accordion>
                        );
                      })}
                    </List.Section>
                  )}
                </View>

                <View
                  style={{ marginVertical: spacing.sm, alignItems: "center" }}
                >
                  <AdBanner />
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </PrivateLayout>
  );
}
