import MatchLive from "@/components/MatchLive";
import MatchPost from "@/components/MatchPost";
import MatchPreview from "@/components/MatchPreview";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";
import PrivateLayout from "./privateLayout";

type MatchState = "Previa" | "En vivo" | "Resumen";
const items: MatchState[] = ["Previa", "En vivo", "Resumen"];
type TeamScreenRouteProp = RouteProp<RootStackParamList, "match">;

export default function Match() {
  const [matchState, setMatchState] = useState<MatchState>("Previa");

  const route = useRoute<TeamScreenRouteProp>();
  const { id } = route.params;

  return (
    <PrivateLayout>
      {/* 🔹 Chips de navegación */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {items.map((item) => {
          const active = matchState === item;
          return (
            <Chip
              key={item}
              onPress={() => setMatchState(item)}
              mode={active ? "flat" : "outlined"}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? "#1DB954" : "transparent",
                  borderColor: "#1DB954",
                },
              ]}
              textStyle={{
                color: active ? "#fff" : "#000",
                fontWeight: "bold",
                fontSize: 13,
                lineHeight: 16,
              }}
            >
              {item.toUpperCase()}
            </Chip>
          );
        })}
      </ScrollView>

      {/* 🔹 Contenedor principal */}
      <Animated.View
        style={{
          flex: 1,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        {matchState === "Previa" && (
            <MatchPreview fixtureId={id} />
        )}
        {matchState === "En vivo" && <MatchLive fixtureId={id} />}

        {/* 🏁 Vista final de postpartido */}
        {matchState === "Resumen" && (
          <View style={styles.finishedContainer}>
            <MatchPost fixtureId={id}/>
          </View>
        )}
      </Animated.View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    height: 36,
    justifyContent: "center",
    borderRadius: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  finishedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  finalTitle: {
    textAlign: "center",
    color: "#333",
    marginBottom: 6,
  },
  finalSubtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: "100%",
  },
  summaryTitle: {
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
});
