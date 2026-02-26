import { Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

type PieChartViewProps = {
  title: string;
  slices: {
    label: string;
    value: number;
  }[];
};

const COLORS = ["#0FA958", "#1976D2", "#FBC02D", "#D32F2F"];

export const PieChartView = ({ slices, title }: PieChartViewProps) => {
  // 🛡️ Guard clause
  if (!Array.isArray(slices) || slices.length === 0) {
    return null;
  }

  const data = slices
    .filter((s) => typeof s.value === "number")
    .map((slice, index) => ({
      name: slice.label,
      population: slice.value,
      color: "#0FA958",
      legendFontColor: "#333",
      legendFontSize: 14,
    }));

  // 🛡️ Segundo guard
  if (data.length === 0) return null;
  console.log("PieChartView data:", data);

  return (
    <PieChart
      data={data}
      width={Dimensions.get("window").width - 20}
      height={240}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="10"
      absolute
      hasLegend
    />
  );
};
