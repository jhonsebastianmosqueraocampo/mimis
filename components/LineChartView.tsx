import { LineChartData } from "@/types";
import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

type BarChartViewProps = Omit<LineChartData, "id">;

export const LineChartView = ({ title, points, labels }: BarChartViewProps) => {
  return (
    <LineChart
      data={{
        labels: labels ?? [],
        datasets: [{ data: points }],
      }}
      width={Dimensions.get("window").width - 30}
      height={240}
      chartConfig={{
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: () => "#0FA958",
      }}
      bezier
      style={{ marginVertical: 8, borderRadius: 16 }}
    />
  );
};
