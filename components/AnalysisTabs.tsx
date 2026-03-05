import { colors } from "@/theme/colors";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

type AnalysisTabsProps = {
  textView: React.ReactNode;
  summaryView: React.ReactNode;
  // chartsView: React.ReactNode;
};

export default function AnalysisTabs({
  textView,
  summaryView,
  // chartsView,
}: AnalysisTabsProps) {
  const [tab, setTab] = useState("text");

  return (
    <View style={styles.container}>
      {/* TAB BUTTONS */}
      <View style={styles.tabs}>
        <Button
          mode={tab === "text" ? "contained" : "outlined"}
          onPress={() => setTab("text")}
          buttonColor={tab === "text" ? colors.primary : colors.border}
          textColor={tab === "text" ? colors.textOnPrimary : colors.textPrimary}
        >
          Análisis
        </Button>

        <Button
          mode={tab === "summary" ? "contained" : "outlined"}
          onPress={() => setTab("summary")}
          buttonColor={tab === "summary" ? colors.primary : colors.border}
          textColor={
            tab === "summary" ? colors.textOnPrimary : colors.textPrimary
          }
        >
          Resumen
        </Button>
        {/* <Button
          mode={tab === "charts" ? "contained" : "outlined"}
          onPress={() => setTab("charts")}
        >
          Gráficas
        </Button> */}
      </View>

      {/* TAB CONTENT */}
      <ScrollView style={{ flex: 1 }}>
        {tab === "text" && <>{textView}</>}
        {tab === "summary" && <>{summaryView}</>}
        {/* {tab === "charts" && <>{chartsView}</>} */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    marginBottom: 5,
  },
});
