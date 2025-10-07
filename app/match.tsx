import MatchLive from "@/components/MatchLive";
import MatchPreview from "@/components/MatchPreview";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Chip, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

type MatchState = "preview" | "live" | "finished";

const items: MatchState[] = ["preview", "live", "finished"];

type TeamScreenRouteProp = RouteProp<RootStackParamList, "match">;

export default function Match() {
  const [matchState, setMatchState] = useState<MatchState>("preview");
  const route = useRoute<TeamScreenRouteProp>();
  const { id } = route.params;

  return (
    <PrivateLayout>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          gap: 8,
        }}
      >
        {items.map((item) => (
          <Chip
            key={item}
            onPress={() => setMatchState(item)}
            mode={matchState === item ? "flat" : "outlined"}
            style={{
              backgroundColor: matchState === item ? "#1DB954" : "transparent",
              borderColor: "#1DB954",
            }}
            textStyle={{
              color: matchState === item ? "#fff" : "#000",
              fontWeight: "bold",
            }}
          >
            {item.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      <View style={{ padding: 16 }}>
        {matchState === "preview" && <MatchPreview fixtureId={id}/>}
        {matchState === "live" && <MatchLive fixtureId={id}/>}
        {matchState === "finished" && (
          <Text variant="bodyMedium">El partido ha finalizado.</Text>
        )}
      </View>
    </PrivateLayout>
  );
}
