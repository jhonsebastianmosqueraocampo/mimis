import { BarChartData } from "@/types";
import React from "react";
import { Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

type BarChartViewProps = Omit<BarChartData, "id">;

export const BarChartView = ({ title, xLabels, values }: BarChartViewProps) => {
  return (
    <BarChart
      data={{
        labels: xLabels,
        datasets: [{ data: values }],
      }}
      width={Dimensions.get("window").width - 30}
      height={240}
      chartConfig={{
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: () => "#0FA958",
        barPercentage: 0.5,
      }}
      style={{ marginVertical: 8, borderRadius: 16 }}
      yAxisLabel={""}
      yAxisSuffix={""}
    />
  );
};
