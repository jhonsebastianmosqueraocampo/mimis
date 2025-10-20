import { useFetch } from "@/hooks/FetchContext";
import { PredictionOddsItem } from "@/types";
import React, { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Text,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

/** Normaliza la forma de predicciones:
 *  - pred: detalle (winner, percent, goals, under_over, win_or_draw…)
 *  - h2h: array de enfrentamientos
 *  - comparison: objeto con form, att, def, etc.
 *  Soporta:
 *    A) { predictions: { ... }, comparison: {...}, h2h: [...] }
 *    B) { ...camposDePred } (plano)
 */
function normalizePredictions(raw: any) {
  const base = raw ?? {};
  const hasWrapper =
    typeof base === "object" &&
    (base.predictions || base.comparison || base.h2h);

  const pred =
    (hasWrapper ? base.predictions : base) ||
    null; // detalle (winner, goals, under_over, percent…)

  const h2h =
    (hasWrapper ? base.h2h : base.h2h) ||
    []; // siempre array

  const comparison =
    (hasWrapper ? base.comparison : base.comparison) ||
    null;

  return { pred, h2h, comparison };
}

export default function PredictionsFull() {
  const { getPredictionOdds } = useFetch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictionOdds, setPredictionOdds] = useState<PredictionOddsItem[]>([]);
  const [error, setError] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPredictionOdds();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (error || predictionOdds.length === 0) {
    return (
      <PrivateLayout>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            variant="bodyLarge"
            style={{ textAlign: "center", opacity: 0.8, marginBottom: 10 }}
          >
            {error ||
              "No se ha cargado la información. Intenta nuevamente más tarde."}
          </Text>
          <Button mode="contained" onPress={loadPredictionOdds}>
            Reintentar
          </Button>
        </View>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView
        style={{ padding: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {predictionOdds.map((item) => {
          const { fixture, predictions, odds } = item;

          // 🔧 Normalización: saca pred (detalle), h2h y comparison del wrapper
          const { pred, h2h, comparison } = normalizePredictions(predictions);

          const matchDate = new Date(fixture?.date || "");
          const isLive = ["1H", "2H", "HT", "ET"].includes(
            fixture?.status?.short || ""
          );
          const elapsed = fixture?.status?.elapsed;

          return (
            <Card
              key={fixture?.fixtureId || Math.random()}
              style={{
                marginBottom: 20,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <Card.Title
                title={`${fixture?.teams?.home?.name ?? "Equipo local"} vs ${
                  fixture?.teams?.away?.name ?? "Equipo visitante"
                }`}
                subtitle={`${fixture?.league?.name ?? "Liga desconocida"} · ${
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
                {/* INFO PARTIDO */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text variant="bodyMedium">
                    🕒{" "}
                    {matchDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text variant="bodyMedium">
                    📍 {fixture?.venue?.city || ""}
                  </Text>
                </View>
                <Text variant="bodySmall">
                  Estadio: {fixture?.venue?.name || "Por definir"}
                </Text>
                <Text variant="bodySmall">
                  Árbitro: {fixture?.referee || "No asignado"}
                </Text>

                {isLive ? (
                  <Chip
                    style={{ marginTop: 6, backgroundColor: "#E53935" }}
                    textStyle={{ color: "white" }}
                  >
                    EN VIVO · {elapsed ?? ""}′
                  </Chip>
                ) : (
                  <Text
                    variant="bodySmall"
                    style={{ marginTop: 6, color: "#666" }}
                  >
                    {fixture?.status?.long || "Sin información del estado"}
                  </Text>
                )}

                <Divider style={{ marginVertical: 10 }} />

                {/* 💵 CUOTAS (mismo front que tu página actual) */}
                <Card style={{ marginBottom: 16 }}>
                  <Card.Title title="Cuotas disponibles" />
                  <Card.Content>
                    {!odds?.length || !odds[0]?.bookmakers?.length ? (
                      <Text>No hay cuotas disponibles para este partido.</Text>
                    ) : (
                      <List.Section>
                        {odds[0].bookmakers.map((bm: any) => {
                          // Filtrar solo los bets que interesan
                          const filteredBets = (bm.bets || []).filter(
                            (b: any) => {
                              const name = (b?.name || "").toLowerCase();
                              return (
                                name.includes("match winner") || // 1X2
                                name.includes("over/under") || // total goles
                                name.includes("correct score") // marcador exacto
                              );
                            }
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
                                      marginBottom: 6,
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
                                      (v: any, i: number) => (
                                        <Chip
                                          key={i}
                                          selected={
                                            selectedHouse ===
                                            `${bm.name}-${bet.name}-${v.value}`
                                          }
                                          onPress={() =>
                                            setSelectedHouse(
                                              selectedHouse ===
                                                `${bm.name}-${bet.name}-${v.value}`
                                                ? null
                                                : `${bm.name}-${bet.name}-${v.value}`
                                            )
                                          }
                                          style={{ margin: 4 }}
                                        >
                                          {v.value}: {v.odd}
                                        </Chip>
                                      )
                                    )}
                                  </View>
                                </View>
                              ))}
                            </List.Accordion>
                          );
                        })}
                      </List.Section>
                    )}
                  </Card.Content>
                </Card>

                {/* 📊 PREDICCIONES */}
                <Card style={{ marginBottom: 16 }}>
                  <Card.Title title="Predicciones" />
                  <Card.Content>
                    {pred ? (
                      <>
                        {pred.winner?.name && (
                          <Text>Favorito: {pred.winner.name}</Text>
                        )}
                        {pred.goals?.advice && (
                          <Text>Consejo: {pred.goals.advice}</Text>
                        )}
                        {pred.win_or_draw !== undefined && (
                          <Text>
                            ¿Empate posible?: {pred.win_or_draw ? "Sí" : "No"}
                          </Text>
                        )}
                        {pred.under_over && (
                          <Text>Under/Over sugerido: {pred.under_over}</Text>
                        )}
                        {pred.percent && (
                          <Text>
                            Probabilidades → Local: {pred.percent.home} | Empate:{" "}
                            {pred.percent.draw} | Visitante: {pred.percent.away}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text>Sin predicción disponible</Text>
                    )}
                  </Card.Content>
                </Card>

                {/* 🤝 H2H (del wrapper, NO de pred) */}
                <Card style={{ marginBottom: 16 }}>
                  <Card.Title title="Historial de enfrentamientos (H2H)" />
                  <Card.Content>
                    {Array.isArray(h2h) && h2h.length > 0 ? (
                      h2h.slice(0, 5).map((match: any, i: number) => (
                        <View
                          key={i}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <Text>
                            {match?.teams?.home?.name} {match?.goals?.home} -{" "}
                            {match?.goals?.away} {match?.teams?.away?.name}
                          </Text>
                          <Text style={{ color: "gray" }}>
                            {match?.fixture?.date
                              ? new Date(
                                  match.fixture.date
                                ).toLocaleDateString()
                              : ""}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text>No hay historial disponible</Text>
                    )}
                  </Card.Content>
                </Card>

                {/* ⚖️ COMPARACIÓN (del wrapper, NO de pred) */}
                <Card style={{ marginBottom: 16 }}>
                  <Card.Title title="Comparación de equipos" />
                  <Card.Content>
                    {comparison ? (
                      Object.entries(comparison).map(
                        ([key, val]: [string, any]) => (
                          <View
                            key={key}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{ flex: 1, textTransform: "capitalize" }}
                            >
                              {key.replaceAll("_", " ")}
                            </Text>
                            <Text style={{ flex: 1, textAlign: "center" }}>
                              {val?.home}
                            </Text>
                            <Text style={{ flex: 1, textAlign: "right" }}>
                              {val?.away}
                            </Text>
                          </View>
                        )
                      )
                    ) : (
                      <Text>No hay datos de comparación</Text>
                    )}
                  </Card.Content>
                </Card>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </PrivateLayout>
  );
}