import { betTypes } from "@/data/betTypes";
import { useFetch } from "@/hooks/FetchContext";
import { BetInfo, RootStackParamList, SelectionBet } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  HelperText,
  List,
  Text,
  TextInput,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

const chipRow: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

const numericOnly = (s: string) => s.replace(/[^\d]/g, "");
const toNumber = (s: string) => (s === "" ? NaN : Number(s));

type BetInviteRouteProp = RouteProp<RootStackParamList, "betInvite">;

export default function JoinBetScreen() {
  const {
    getBetAndPredictionOddsByBetId,
    getBetAndPredictionOddsByCode,
    joinBet,
  } = useFetch();
  const route = useRoute<BetInviteRouteProp>();

  // Estado fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [betInfo, setBetInfo] = useState<BetInfo | null>(null);

  // Estado unión a mesa
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);

  // Estado de selección
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [exactScore, setExactScore] = useState({ home: "", away: "" });
  const [ouSide, setOuSide] = useState<"OVER" | "UNDER" | null>(null);
  const [ouLine, setOuLine] = useState<number | null>(2.5);
  const [betId, setBetId] = useState(route.params?.id ?? '');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { success, betInfo, message, alreadyBet } =
          await getBetAndPredictionOddsByBetId(betId!);

        if (!isMounted) return;

        if (success && betInfo) {
          if (alreadyBet) {
            navigation.navigate("liveBet", { id: betId });
          }
          setBetInfo(betInfo);
        } else {
          setError(message || "Error al cargar la apuesta");
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar la apuesta");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (betId) {
      setJoined(true);
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [betId]);

  const handleValidateCode = async () => {
    setLoading(true);
    try {
      const { success, betInfo, message, alreadyBet } =
        await getBetAndPredictionOddsByCode(code);

      if (success && betInfo) {
        if (alreadyBet) {
          navigation.navigate("liveBet", { id: betId });
        }
        setBetId(betInfo.bet._id);
        setBetInfo(betInfo);
        setJoined(true);
      } else {
        setError(message || "Error al cargar la apuesta");
      }
    } catch (err) {
      setError("Error al validar código");
    } finally {
      setLoading(false);
    }
  };

  const renderBetOptions = (market: string) => {
    if (!betInfo) return null;
    const fixture = betInfo.predictionOdds.fixture;

    switch (market) {
      case "RESULT_1X2":
        return (
          <View style={chipRow}>
            <Chip
              selected={selectedBet === "LOCAL"}
              onPress={() => setSelectedBet("LOCAL")}
              style={{ margin: 4 }}
            >
              {fixture.teams.home.name}
            </Chip>
            <Chip
              selected={selectedBet === "DRAW"}
              onPress={() => setSelectedBet("DRAW")}
              style={{ margin: 4 }}
            >
              Empate
            </Chip>
            <Chip
              selected={selectedBet === "AWAY"}
              onPress={() => setSelectedBet("AWAY")}
              style={{ margin: 4 }}
            >
              {fixture.teams.away.name}
            </Chip>
          </View>
        );

      case "EXACT_SCORE":
        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              mode="outlined"
              label={fixture.teams.home.name}
              value={exactScore.home}
              onChangeText={(t) =>
                setExactScore({ ...exactScore, home: numericOnly(t) })
              }
              keyboardType="number-pad"
              style={{ flex: 1, marginRight: 8 }}
              maxLength={2}
            />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}> - </Text>
            <TextInput
              mode="outlined"
              label={fixture.teams.away.name}
              value={exactScore.away}
              onChangeText={(t) =>
                setExactScore({ ...exactScore, away: numericOnly(t) })
              }
              keyboardType="number-pad"
              style={{ flex: 1, marginLeft: 8 }}
              maxLength={2}
            />
          </View>
        );

      case "OVER_UNDER":
        return (
          <View>
            <View style={chipRow}>
              <Chip
                selected={ouSide === "OVER"}
                onPress={() => setOuSide("OVER")}
                style={{ margin: 4 }}
              >
                Más (Over)
              </Chip>
              <Chip
                selected={ouSide === "UNDER"}
                onPress={() => setOuSide("UNDER")}
                style={{ margin: 4 }}
              >
                Menos (Under)
              </Chip>
            </View>
            <View style={chipRow}>
              {[0.5, 1.5, 2.5, 3.5].map((l) => (
                <Chip
                  key={l}
                  selected={ouLine === l}
                  onPress={() => setOuLine(l)}
                  style={{ margin: 4 }}
                >
                  {l.toFixed(1)}
                </Chip>
              ))}
            </View>
          </View>
        );

      default:
        return <Text>No hay opciones configuradas.</Text>;
    }
  };

  const formatUserSelection = (selection: any, market: string) => {
    if (!selection) return "Sin selección";

    switch (market) {
      case "RESULT_1X2":
        if (selection.pick === "LOCAL") return "Ganador: Local";
        if (selection.pick === "DRAW") return "Empate";
        if (selection.pick === "AWAY") return "Ganador: Visitante";
        return selection.pick;

      case "EXACT_SCORE":
        return `Marcador exacto: ${selection.home}-${selection.away}`;

      case "OVER_UNDER":
        return `Total goles: ${selection.side} ${selection.line}`;

      default:
        return JSON.stringify(selection);
    }
  };

  const handleBet = async () => {
    if (!betInfo) return;
    const market = betInfo.bet.betType as SelectionBet["market"];
    let selection: SelectionBet | null = null;

    switch (market) {
      case "RESULT_1X2":
        if (!selectedBet)
          return console.log("⚠️ Selecciona Local/Empate/Visitante");
        selection = {
          market,
          pick: selectedBet as "LOCAL" | "DRAW" | "AWAY",
        };
        break;

      case "EXACT_SCORE":
        const h = toNumber(exactScore.home);
        const a = toNumber(exactScore.away);
        if (Number.isNaN(h) || Number.isNaN(a))
          return console.log("⚠️ Marcador inválido");
        selection = {
          market,
          home: h,
          away: a,
        };
        break;

      case "OVER_UNDER":
        if (!ouSide || !ouLine)
          return console.log("⚠️ Selecciona lado y línea");
        selection = {
          market,
          side: ouSide,
          line: ouLine,
        };
        break;

      default:
        return console.log("⚠️ Tipo de apuesta no soportado:", market);
    }

    if (!selection) return;

    setLoading(true);
    try {
      const { success, message } = await joinBet(betId, selection);

      if (success) {
        navigation.navigate("liveBet", { id: betId });
      } else {
        setError(message || "Error al cargar la apuesta");
      }
    } catch (err) {
      setError("Error al validar código");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  if (error) {
    return (
      <PrivateLayout>
        <Card style={{ margin: 16, padding: 20 }}>
          <Card.Title title="Error" />
          <Card.Content>
            <Text>{error}</Text>
          </Card.Content>
        </Card>
      </PrivateLayout>
    );
  }
  if (!betInfo) return null;

  const { bet, predictionOdds } = betInfo;
  const fixture = predictionOdds.fixture;
  const pred = predictionOdds?.predictions?.predictions;

  return (
    <PrivateLayout>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {!joined ? (
          <Card style={{ padding: 20, marginBottom: 16 }}>
            <Card.Title
              title="Unirse a la mesa"
              subtitle="Ingresa el código de acceso"
            />
            <Card.Content>
              <TextInput
                label="Código"
                value={code}
                onChangeText={setCode}
                mode="outlined"
              />
              {error && <HelperText type="error">Código incorrecto</HelperText>}
              <Button
                mode="contained"
                buttonColor="#1DB954"
                style={{ marginTop: 16 }}
                onPress={handleValidateCode}
              >
                Unirse
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Fixture */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Title
                title="Partido"
                subtitle={`${fixture.venue.name}, ${fixture.venue.city}`}
              />
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Avatar.Image
                      size={60}
                      source={{ uri: fixture.teams.home.logo }}
                    />
                    <Text>{fixture.teams.home.name}</Text>
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    {fixture.goals.home} - {fixture.goals.away}
                  </Text>
                  <View style={{ alignItems: "center" }}>
                    <Avatar.Image
                      size={60}
                      source={{ uri: fixture.teams.away.logo }}
                    />
                    <Text>{fixture.teams.away.name}</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 8, textAlign: "center" }}>
                  Min {fixture.status.elapsed} ({fixture.status.short})
                </Text>
              </Card.Content>
            </Card>

            {/* Odds */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Title title="Cuotas disponibles" />
              <Card.Content>
                {predictionOdds.odds.length === 0 ? (
                  <Text>No hay cuotas disponibles para este partido.</Text>
                ) : (
                  <List.Section>
                    {predictionOdds.odds[0].bookmakers.map((bm: any) => {
                      // Filtrar solo los bets que nos interesan
                      const filteredBets = bm.bets.filter((b: any) => {
                        const name = b.name.toLowerCase();
                        return (
                          name.includes("match winner") || // Resultado 1X2
                          name.includes("over/under") || // Total de goles
                          name.includes("correct score") // Marcador exacto
                        );
                      });

                      return (
                        <List.Accordion
                          key={bm.id}
                          title={bm.name}
                          left={(props) => <List.Icon {...props} icon="cash" />}
                        >
                          {filteredBets.map((bet: any) => (
                            <View key={bet.id} style={{ marginBottom: 12 }}>
                              <Text
                                style={{ fontWeight: "bold", marginBottom: 6 }}
                              >
                                {bet.name}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                }}
                              >
                                {bet.values.map((v: any, i: number) => (
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
                                ))}
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

            {/* Predictions */}
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
                        Probabilidades → Local: {pred.percent.home}% | Empate:{" "}
                        {pred.percent.draw}% | Visitante: {pred.percent.away}%
                      </Text>
                    )}
                  </>
                ) : (
                  <Text>Sin predicción disponible</Text>
                )}
              </Card.Content>
            </Card>

            {/* H2H */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Title title="Historial de enfrentamientos (H2H)" />
              <Card.Content>
                {predictionOdds?.predictions?.h2h?.length ? (
                  predictionOdds.predictions.h2h
                    .slice(0, 5)
                    .map((match: any, i: number) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <Text>
                          {match.teams.home.name} {match.goals.home} -{" "}
                          {match.goals.away} {match.teams.away.name}
                        </Text>
                        <Text style={{ color: "gray" }}>
                          {new Date(match.fixture.date).toLocaleDateString()}
                        </Text>
                      </View>
                    ))
                ) : (
                  <Text>No hay historial disponible</Text>
                )}
              </Card.Content>
            </Card>

            {/* Comparación */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Title title="Comparación de equipos" />
              <Card.Content>
                {predictionOdds?.predictions?.comparison ? (
                  Object.entries(predictionOdds.predictions.comparison).map(
                    ([key, val]: [string, any]) => (
                      <View
                        key={key}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ flex: 1, textTransform: "capitalize" }}>
                          {key}
                        </Text>
                        <Text style={{ flex: 1, textAlign: "center" }}>
                          {val.home}
                        </Text>
                        <Text style={{ flex: 1, textAlign: "right" }}>
                          {val.away}
                        </Text>
                      </View>
                    )
                  )
                ) : (
                  <Text>No hay datos de comparación</Text>
                )}
              </Card.Content>
            </Card>

            {/* Usuarios */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Title title="Usuarios en la mesa" />
              <Card.Content>
                <List.Section>
                  {bet.users?.map((u: any, i: number) => (
                    <List.Item
                      key={i}
                      title={u.name}
                      description={`Apostó: ${formatUserSelection(
                        u.selection,
                        bet.betType
                      )}`}
                    />
                  ))}
                </List.Section>
              </Card.Content>
            </Card>

            {/* Selección */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Title title="Elige tu apuesta" />
              <Card.Content>
                {(() => {
                  const type = betTypes.find((t) => t.key === bet.betType);
                  if (!type) return null;
                  return (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontWeight: "bold" }}>{type.label}</Text>
                      <Text style={{ color: "gray", marginBottom: 8 }}>
                        {type.desc}
                      </Text>
                    </View>
                  );
                })()}
                {renderBetOptions(bet.betType)}
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              buttonColor="#1DB954"
              style={{ marginVertical: 20 }}
              onPress={handleBet}
            >
              Apostar
            </Button>
          </>
        )}
      </ScrollView>
    </PrivateLayout>
  );
}
