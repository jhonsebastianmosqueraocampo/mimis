import React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Card, Chip, Paragraph, Title } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

const dummyResponseFromModel = {
  keyPlayers: ["Juan Pérez", "Carlos Díaz", "Mauro Silva"],
  playingStyle:
    "El equipo juega con un enfoque vertical, utilizando transiciones rápidas y presión alta.",
  offensiveWeapon:
    "La principal arma ofensiva ha sido el contragolpe por el sector derecho, con centros aéreos a Juan Pérez.",
  weaknesses:
    "Defensivamente sufre ante equipos que dominan la posesión. Además, los laterales suelen quedar mal posicionados.",
  projection:
    "Si mantiene este rendimiento, finalizará entre los primeros 3 puestos del campeonato.",
  historicalComparison:
    "Comparado con la temporada pasada, el equipo ha mejorado en goles marcados (+25%) y precisión de pases (+8%).",
  recentResults: [
    { jornada: "1", resultado: "2-0 vs Team B" },
    { jornada: "2", resultado: "1-1 vs Team C" },
    { jornada: "3", resultado: "0-3 vs Team D" },
  ],
  trendData: [
    { jornada: "1", puntos: 3 },
    { jornada: "2", puntos: 4 },
    { jornada: "3", puntos: 4 },
    { jornada: "4", puntos: 7 },
    { jornada: "5", puntos: 10 },
  ],
  possessionComparison: [
    { torneo: "Actual", posesion: 56 },
    { torneo: "Anterior", posesion: 48 },
  ],
};

export default function SeasonAnalysis() {
  const {
    keyPlayers,
    playingStyle,
    offensiveWeapon,
    weaknesses,
    projection,
    historicalComparison,
    recentResults,
    trendData,
    possessionComparison,
  } = dummyResponseFromModel;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Análisis de la temporada
      </Text>

      {/* Jugadores Clave */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Jugadores más determinantes</Title>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
          >
            {keyPlayers.map((player) => (
              <Chip key={player} style={{ marginRight: 6, marginBottom: 6 }}>
                {player}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Estilo de juego */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Estilo de juego</Title>
          <Paragraph>{playingStyle}</Paragraph>
        </Card.Content>
      </Card>

      {/* Arma ofensiva */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Principal arma ofensiva</Title>
          <Paragraph>{offensiveWeapon}</Paragraph>
        </Card.Content>
      </Card>

      {/* Debilidades */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Debilidades del equipo</Title>
          <Paragraph>{weaknesses}</Paragraph>
        </Card.Content>
      </Card>

      {/* Proyección */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Proyección de rendimiento</Title>
          <Paragraph>{projection}</Paragraph>
        </Card.Content>
      </Card>

      {/* Comparativa histórica */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Comparativa histórica</Title>
          <Paragraph>{historicalComparison}</Paragraph>
        </Card.Content>
      </Card>

      {/* Resultados recientes */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Últimos resultados</Title>
          {recentResults.map((r) => (
            <Paragraph
              key={r.jornada}
            >{`Jornada ${r.jornada}: ${r.resultado}`}</Paragraph>
          ))}
        </Card.Content>
      </Card>

      {/* Tendencia de puntos */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Tendencia de puntos</Title>
          <LineChart
            data={{
              labels: trendData.map((d) => d.jornada),
              datasets: [
                {
                  data: trendData.map((d) => d.puntos),
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 185, 84, ${opacity})`,
              labelColor: () => "#333",
              style: { borderRadius: 8 },
            }}
            style={{ marginVertical: 8, borderRadius: 8 }}
          />
        </Card.Content>
      </Card>

      {/* Comparativa de posesión */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Comparativa de posesión (%)</Title>
          <BarChart
            data={{
              labels: possessionComparison.map((p) => p.torneo),
              datasets: [
                {
                  data: possessionComparison.map((p) => p.posesion),
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 185, 84, ${opacity})`,
              labelColor: () => "#333",
              style: { borderRadius: 8 },
            }}
            style={{ marginVertical: 8, borderRadius: 8 }}
            yAxisLabel={""}
            yAxisSuffix={""}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
