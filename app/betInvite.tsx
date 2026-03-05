import Loading from "@/components/Loading";
import { betTypes } from "@/data/betTypes";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";
import { BetInfo, RootStackParamList, SelectionBet } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import {
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
  const [betId, setBetId] = useState(route.params?.id ?? "");
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
              style={sx({ m: 4 }) as any}
              selectedColor={colors.primary}
            >
              {fixture.teams.home.name}
            </Chip>
            <Chip
              selected={selectedBet === "DRAW"}
              onPress={() => setSelectedBet("DRAW")}
              style={sx({ m: 4 }) as any}
              selectedColor={colors.primary}
            >
              Empate
            </Chip>
            <Chip
              selected={selectedBet === "AWAY"}
              onPress={() => setSelectedBet("AWAY")}
              style={sx({ m: 4 }) as any}
              selectedColor={colors.primary}
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
                style={sx({ m: 4 }) as any}
                selectedColor={colors.primary}
              >
                Más (Over)
              </Chip>
              <Chip
                selected={ouSide === "UNDER"}
                onPress={() => setOuSide("UNDER")}
                style={sx({ m: 4 }) as any}
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
                  selectedColor={colors.primary}
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

    const betType = betInfo.bet.betType;
    let selection: SelectionBet | null = null;

    switch (betType) {
      case "RESULT_1X2":
        if (!selectedBet) {
          return;
        }

        selection = {
          pick: selectedBet as "LOCAL" | "DRAW" | "AWAY",
        };
        break;

      case "EXACT_SCORE": {
        const h = toNumber(exactScore.home);
        const a = toNumber(exactScore.away);

        if (Number.isNaN(h) || Number.isNaN(a)) {
          return;
        }

        selection = {
          home: h,
          away: a,
        };
        break;
      }

      case "OVER_UNDER":
        if (!ouSide || ouLine === undefined) {
          return;
        }

        selection = {
          side: ouSide,
          line: ouLine ?? undefined,
        };
        break;

      default:
        console.log("⚠️ Tipo de apuesta no soportado:", betType);
        return;
    }

    if (!selection) return;

    setLoading(true);

    try {
      const { success, message } = await joinBet(betId, selection);

      if (success) {
        navigation.navigate("liveBet", { id: betId });
      } else {
        setError(message || "Error al registrar la apuesta");
      }
    } catch (err) {
      setError("Error al registrar la apuesta");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Loading
        visible={loading}
        title="Cargando apuestas"
        subtitle="Estamos trabajando en las apuestas"
      />
    );
  if (error) {
    return (
      <PrivateLayout>
        <Card
          style={[
            sx({
              m: 16,
              p: 20,
            }) as any,
            { borderRadius: radius.lg },
          ]}
        >
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

  const handleFixture = (id: string) => {
    navigation.navigate("match", { id });
  };

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
        {!joined ? (
          <Card
            style={[
              sx({
                mb: 16,
                p: 20,
                bg: colors.card,
              }) as any,
              { borderRadius: radius.lg },
            ]}
          >
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
                buttonColor={colors.primary}
                style={sx({ mt: 16 }) as any}
                onPress={handleValidateCode}
              >
                Unirse
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Fixture */}
            <Card
              style={[sx({ mb: 16 }) as any, { borderRadius: radius.lg }]}
              onPress={() => handleFixture(fixture.fixtureId)}
            >
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
                  <Text
                    style={[
                      g.titleLarge,
                      {
                        fontWeight: "800",
                      },
                    ]}
                  >
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
                <Text style={[sx({ mt: 8, center: true }) as any]}>
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
                              <Text style={[g.subtitle]}>{bet.name}</Text>
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
                                          : `${bm.name}-${bet.name}-${v.value}`,
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
            <Card style={[sx({ mb: 16 }) as any, { borderRadius: radius.lg }]}>
              <Card.Title title="Predicciones" />
              <Card.Content>
                {pred ? (
                  <>
                    {pred.winner?.name && (
                      <Text style={g.body}>Favorito: {pred.winner.name}</Text>
                    )}
                    {pred.goals?.advice && (
                      <Text style={g.body}>Consejo: {pred.goals.advice}</Text>
                    )}
                    {pred.win_or_draw !== undefined && (
                      <Text style={g.body}>
                        ¿Empate posible?: {pred.win_or_draw ? "Sí" : "No"}
                      </Text>
                    )}
                    {pred.under_over && (
                      <Text style={g.body}>
                        Under/Over sugerido: {pred.under_over}
                      </Text>
                    )}
                    {pred.percent && (
                      <Text style={g.body}>
                        Probabilidades → Local: {pred.percent.home}% | Empate:{" "}
                        {pred.percent.draw}% | Visitante: {pred.percent.away}%
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={g.body}>Sin predicción disponible</Text>
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
                        style={[
                          sx({
                            row: true,
                            mb: 6,
                          }) as any,
                          {
                            justifyContent: "space-between",
                          },
                        ]}
                      >
                        <Text>
                          {match.teams.home.name} {match.goals.home} -{" "}
                          {match.goals.away} {match.teams.away.name}
                        </Text>
                        <Text style={[{ color: colors.textSecondary }]}>
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
                        <Text
                          style={[
                            g.body,
                            {
                              flex: 1,
                              textTransform: "capitalize",
                            },
                          ]}
                        >
                          {key}
                        </Text>
                        <Text style={{ flex: 1, textAlign: "center" }}>
                          {val.home}
                        </Text>
                        <Text style={{ flex: 1, textAlign: "right" }}>
                          {val.away}
                        </Text>
                      </View>
                    ),
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
                        bet.betType,
                      )}`}
                    />
                  ))}
                </List.Section>
              </Card.Content>
            </Card>

            {/* Selección */}
            <Card
              style={[
                {
                  marginBottom: 16,
                },
              ]}
            >
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

            <View
              style={[
                sx({
                  center: true,
                  py: 10,
                  px: 18,
                }) as any,
                {
                  borderRadius: radius.xl,
                  backgroundColor: colors.card,
                  alignSelf: "center",
                  elevation: 3,
                },
              ]}
            >
              <Text
                style={[
                  g.small,
                  {
                    color: colors.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  },
                ]}
              >
                Cuota de la apuesta
              </Text>
              <Text
                style={[
                  g.titleLarge,
                  {
                    color: colors.primary,
                    fontWeight: "800",
                  },
                ]}
              >
                {bet.stake}
              </Text>
            </View>

            <Button
              mode="contained"
              buttonColor={colors.primary}
              style={sx({ mt: 20, mb: 20 }) as any}
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
