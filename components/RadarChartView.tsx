import { RadarChartData } from "@/types";
import React from "react";
import { View } from "react-native";
import { Circle, Line, Polygon, Svg, Text as SvgText } from "react-native-svg";

type BarChartViewProps = Omit<RadarChartData, "id">;

export const RadarChartView = ({ axes, values, title }: BarChartViewProps) => {
  const size = 260;
  const center = size / 2;
  const radius = 90;
  const angleStep = (Math.PI * 2) / axes.length;

  const points = values
    .map((v, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (v / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    })
    .join(" ");

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {/* círculos */}
        {[30, 60, 90].map((r, i) => (
          <Circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            stroke="#ccc"
            strokeWidth={1}
            fill="none"
          />
        ))}

        {/* ejes */}
        {axes.map((a, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <Line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#ccc" />
          );
        })}

        {/* labels */}
        {axes.map((a, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + (radius + 20) * Math.cos(angle);
          const y = center + (radius + 20) * Math.sin(angle);
          return (
            <SvgText
              key={i}
              x={x}
              y={y}
              fill="#333"
              fontSize="12"
              textAnchor="middle"
            >
              {a}
            </SvgText>
          );
        })}

        {/* polygon */}
        <Polygon
          points={points}
          stroke="#0FA958"
          fill="rgba(15,169,88,0.3)"
          strokeWidth={2}
        />

        <SvgText
          x={center}
          y={20}
          textAnchor="middle"
          fontSize="16"
          fill="#000"
        >
          {title}
        </SvgText>
      </Svg>
    </View>
  );
};
