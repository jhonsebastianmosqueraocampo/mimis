import React from "react";
import { Dimensions, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import Svg, { Circle, Line, Rect } from "react-native-svg";

const { width } = Dimensions.get("window");
const FIELD_WIDTH = width - 40;
const FIELD_HEIGHT = (FIELD_WIDTH * 2) / 3; // proporción 3:2

type Player = {
  id: number;
  name: string;
  number: number;
  grid: string; // ej: "1:3"
};

type FootballFieldProps = {
  players: Player[];
};

const PlayerMarker = ({ name, number }: { name: string; number: number }) => (
  <View style={{ alignItems: "center", marginHorizontal: 4 }}>
    <Avatar.Text size={36} label={String(number)} style={{ backgroundColor: "#2e7d32" }} />
    <Text style={{ fontSize: 10, marginTop: 2, maxWidth: 60 }} numberOfLines={1}>
      {name}
    </Text>
  </View>
);

export default function FootballField({ players }: FootballFieldProps) {
  // La API usa filas: 1-6 y columnas: 1-6 (grid)
  const rows = 6;
  const cols = 6;

  return (
    <View style={{ alignItems: "center", marginVertical: 10 }}>
      {/* 🎨 SVG del campo */}
      <Svg
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        style={{ backgroundColor: "#388e3c", borderRadius: 10 }}
      >
        {/* Límites */}
        <Rect
          x="2"
          y="2"
          width={FIELD_WIDTH - 4}
          height={FIELD_HEIGHT - 4}
          stroke="white"
          strokeWidth="2"
          fill="none"
          rx="10"
        />
        {/* Línea central */}
        <Line
          x1={FIELD_WIDTH / 2}
          y1={0}
          x2={FIELD_WIDTH / 2}
          y2={FIELD_HEIGHT}
          stroke="white"
          strokeWidth="2"
        />
        {/* Círculo central */}
        <Circle
          cx={FIELD_WIDTH / 2}
          cy={FIELD_HEIGHT / 2}
          r={30}
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Punto central */}
        <Circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r={3} fill="white" />
      </Svg>

      {/* Jugadores superpuestos */}
      <View
        style={{
          position: "absolute",
          width: FIELD_WIDTH,
          height: FIELD_HEIGHT,
          padding: 8,
        }}
      >
        {players.map((p) => {
          const [row, col] = p.grid.split(":").map(Number);

          // Calcular posición relativa
          const x = (col / (cols + 1)) * FIELD_WIDTH;
          const y = (row / (rows + 1)) * FIELD_HEIGHT;

          return (
            <View
              key={p.id}
              style={{
                position: "absolute",
                left: x - 20, // centrar
                top: y - 20,
                alignItems: "center",
              }}
            >
              <Avatar.Text
                size={36}
                label={String(p.number)}
                style={{ backgroundColor: "#1b5e20" }}
              />
              <Text style={{ fontSize: 10, marginTop: 2, color: "white" }} numberOfLines={1}>
                {p.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}