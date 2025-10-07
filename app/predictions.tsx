import { useFetch } from "@/hooks/FetchContext";
import { PredictionOddsItem } from "@/types";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  List,
  Text
} from "react-native-paper";

export default function PredictionsFull() {
  const { getPredictionOdds } = useFetch()
  const [loading, setLoading] = useState(true);
  const [predictionOdds, setPredictionOdds] = useState<PredictionOddsItem[]>([]);
  const [ error, setError ] = useState('');

  useEffect(() => {
      let isMounted = true;
      const predictionOdds = async () => {
        setLoading(true);
        try {
          const { success, predictionOdds, message } = await getPredictionOdds();
  
          if (!isMounted) return;
  
          if (success) {
            setPredictionOdds(predictionOdds!);
          } else {
            setError(message!);
          }
        } catch (err) {
          if (isMounted) setError("Error al cargar el predictionOdds");
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      predictionOdds();
  
      return () => {
        isMounted = false;
      };
    }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {predictionOdds.map((item) => {
        const { fixture, predictions, odds } = item;
        const matchDate = new Date(fixture.date);
        const isLive = ["1H", "2H", "HT", "ET"].includes(fixture!.status!.short);
        const elapsed = fixture.status.elapsed;

        return (
          <Card key={fixture.fixtureId} style={{ marginBottom: 20 }}>
            {/* Encabezado */}
            <Card.Title
              title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
              subtitle={`${fixture.league.name} · ${fixture.league.round || ""}`}
              left={() => (
                <Image
                  source={{ uri: fixture.league.logo }}
                  style={{ width: 40, height: 40 }}
                />
              )}
            />
            <Card.Content>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">
                  🕒 {matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <Text variant="bodyMedium">📍 {fixture.venue?.city || ""}</Text>
              </View>
              <Text variant="bodySmall">Estadio: {fixture.venue?.name || "Por definir"}</Text>
              <Text variant="bodySmall">Árbitro: {fixture.referee || "No asignado"}</Text>

              {isLive ? (
                <Chip
                  style={{ marginTop: 6 }}
                  textStyle={{ color: "white" }}
                >
                  EN VIVO · {elapsed ?? ""}′
                </Chip>
              ) : (
                <Text variant="bodySmall" style={{ marginTop: 6 }}>
                  {fixture.status.long}
                </Text>
              )}

              <Divider style={{ marginVertical: 10 }} />

              {/* Secciones colapsables */}
              <List.Section>
                {/* Predicciones */}
                <List.Accordion title="📊 Predicción general" id={`pred-${fixture.fixtureId}`}>
                  {predictions ? (
                    <View style={{ paddingLeft: 10, paddingVertical: 5 }}>
                      <Text>Ganador esperado: {predictions.winner?.name}</Text>
                      <Text>Consejo: {predictions.advice}</Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 6 }}>
                        <Chip>🏠 {predictions.percent?.home}</Chip>
                        <Chip>🤝 {predictions.percent?.draw}</Chip>
                        <Chip>🚩 {predictions.percent?.away}</Chip>
                      </View>
                      {predictions.win_or_draw && (
                        <Text>Opción segura: Win or Draw</Text>
                      )}
                      {predictions.goals && (
                        <Text>Predicción de goles → Home: {predictions.goals.home} | Away: {predictions.goals.away}</Text>
                      )}
                    </View>
                  ) : (
                    <Text>No hay predicciones disponibles</Text>
                  )}
                </List.Accordion>

                {/* Forma reciente */}
                <List.Accordion title="📝 Forma reciente" id={`form-${fixture.fixtureId}`}>
                  {predictions?.teams?.home?.last_5 && predictions?.teams?.away?.last_5 ? (
                    <View style={{ paddingLeft: 10, paddingVertical: 5 }}>
                      <Text>{fixture.teams.home.name} – {predictions.teams.home.last_5.form}</Text>
                      <Text>Ataque: {predictions.teams.home.last_5.att} · Defensa: {predictions.teams.home.last_5.def}</Text>
                      <Text>Goles: {predictions.teams.home.last_5.goals.for.total} / {predictions.teams.home.last_5.goals.against.total}</Text>
                      <Divider style={{ marginVertical: 6 }} />
                      <Text>{fixture.teams.away.name} – {predictions.teams.away.last_5.form}</Text>
                      <Text>Ataque: {predictions.teams.away.last_5.att} · Defensa: {predictions.teams.away.last_5.def}</Text>
                      <Text>Goles: {predictions.teams.away.last_5.goals.for.total} / {predictions.teams.away.last_5.goals.against.total}</Text>
                    </View>
                  ) : (
                    <Text>No hay datos de forma reciente</Text>
                  )}
                </List.Accordion>

                {/* Goles por minuto */}
                <List.Accordion title="⏱ Distribución de goles" id={`goals-${fixture.fixtureId}`}>
                  {predictions?.teams?.home?.league?.goals?.for?.minute &&
                  Object.entries(predictions.teams.home.league.goals.for.minute).map(([range, stats]: any) => (
                    <Text key={range}>
                      {fixture.teams.home.name} {range}: {stats.total ?? 0} goles ({stats.percentage || "0%"})
                    </Text>
                  ))}
                  <Divider style={{ marginVertical: 6 }} />
                  {predictions?.teams?.away?.league?.goals?.for?.minute &&
                  Object.entries(predictions.teams.away.league.goals.for.minute).map(([range, stats]: any) => (
                    <Text key={range}>
                      {fixture.teams.away.name} {range}: {stats.total ?? 0} goles ({stats.percentage || "0%"})
                    </Text>
                  ))}
                </List.Accordion>

                {/* Under/Over */}
                <List.Accordion title="⚖️ Under / Over" id={`uo-${fixture.fixtureId}`}>
                  {predictions?.teams?.home?.league?.goals?.for?.under_over &&
                  Object.entries(predictions.teams.home.league.goals.for.under_over).map(([key, val]: any) => (
                    <Text key={key}>
                      {fixture.teams.home.name} +{key}: Over {val.over} / Under {val.under}
                    </Text>
                  ))}
                  <Divider style={{ marginVertical: 6 }} />
                  {predictions?.teams?.away?.league?.goals?.for?.under_over &&
                  Object.entries(predictions.teams.away.league.goals.for.under_over).map(([key, val]: any) => (
                    <Text key={key}>
                      {fixture.teams.away.name} +{key}: Over {val.over} / Under {val.under}
                    </Text>
                  ))}
                </List.Accordion>

                {/* Odds */}
                <List.Accordion title="💵 Odds (casas de apuestas)" id={`odds-${fixture.fixtureId}`}>
                  {odds?.bookmakers?.length > 0 ? (
                    odds.bookmakers.slice(0, 5).map((bm: any) => (
                      <View key={bm.id} style={{ marginBottom: 10 }}>
                        <Text variant="titleSmall">🏦 {bm.name}</Text>
                        {bm.bets.slice(0, 3).map((bet: any) => (
                          <View key={bet.id} style={{ marginLeft: 10 }}>
                            <Text variant="bodyMedium">{bet.name}</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                              {bet.values.map((v: any, i: number) => (
                                <Chip key={i} style={{ margin: 2 }}>
                                  {v.value}: {v.odd}
                                </Chip>
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>
                    ))
                  ) : (
                    <Text>No hay odds disponibles</Text>
                  )}
                </List.Accordion>
              </List.Section>
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
}