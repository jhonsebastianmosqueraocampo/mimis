import { GoalEvent, PreMatchStats, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, Card, Divider, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type MatchHistoryPreviewProps = { stats: PreMatchStats };

export default function MatchHistoryPreview({
  stats,
}: MatchHistoryPreviewProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const orderedMatches = useMemo(() => {
    if (!stats?.headToHead) return [];
    return [...stats.headToHead].sort(
      (a, b) =>
        new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime(),
    );
  }, [stats]);

  const handleFixture = (id: string) => {
    navigation.navigate("match", { id });
  };

  const GoalRow = ({ goal, isHome }: { goal: GoalEvent; isHome: boolean }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: isHome ? "flex-start" : "flex-end",
        marginBottom: 6,
      }}
    >
      {isHome && (
        <>
          <Text
            style={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 11,
              marginRight: 6,
            }}
          >
            {goal.minute}'
          </Text>
          <Text style={{ fontSize: 13, flexShrink: 1 }}>
            {goal.scorer}
            {goal.assist ? ` (asist. ${goal.assist})` : ""}
          </Text>
        </>
      )}
      {!isHome && (
        <>
          <Text style={{ fontSize: 13, flexShrink: 1, textAlign: "right" }}>
            {goal.scorer}
            {goal.assist ? ` (asist. ${goal.assist})` : ""}
          </Text>
          <Text
            style={{
              backgroundColor: "#e3f2fd",
              color: "#1565c0",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 11,
              marginLeft: 6,
            }}
          >
            {goal.minute}'
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Card style={{ margin: 10, borderRadius: 12, elevation: 2 }}>
      <Card.Title
        title="Historial de Enfrentamientos"
        titleVariant="titleMedium"
      />
      <Card.Content>
        {orderedMatches.map((match, i) => (
          <View key={i} style={{ marginBottom: 20 }}>
            {/* ---- Encabezado torneo y fecha ---- */}
            <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
              {match.league.name} • {match.league.season}
            </Text>
            <Text style={{ fontSize: 12, color: "gray", marginBottom: 6 }}>
              {new Date(match.fixture.date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>

            {/* ---- Equipos y marcador ---- */}
            <TouchableOpacity
              onPress={() => handleFixture(match.fixture.id.toString())}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, alignItems: "center" }}>
                <Avatar.Image
                  size={36}
                  source={{ uri: match.teams.home.logo }}
                />
                <Text style={{ fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                  {match.teams.home.name}
                </Text>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, marginTop: 2 }}
                >
                  {match.goals.home ?? "-"}
                </Text>
              </View>

              <Text style={{ fontWeight: "bold", fontSize: 14 }}>vs</Text>

              <View style={{ flex: 1, alignItems: "center" }}>
                <Avatar.Image
                  size={36}
                  source={{ uri: match.teams.away.logo }}
                />
                <Text style={{ fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                  {match.teams.away.name}
                </Text>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, marginTop: 2 }}
                >
                  {match.goals.away ?? "-"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* ---- Goleadores ---- */}
            {match.goalscorers.length > 0 ? (
              <View>
                <Divider style={{ marginVertical: 6 }} />
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                  Goleadores
                </Text>
                {match.goalscorers.map((goal, j) => (
                  <GoalRow
                    key={j}
                    goal={goal}
                    isHome={goal.teamId === match.teams.home.id}
                  />
                ))}
              </View>
            ) : (
              <Text
                style={{ fontSize: 12, fontStyle: "italic", color: "gray" }}
              >
                Sin goles registrados
              </Text>
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}
