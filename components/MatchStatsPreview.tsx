import { colors } from "@/theme/colors";
import { PreMatchStats, RootStackParamList } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  Avatar,
  Card,
  DataTable,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type MatchStatsPreviewProps = { stats: PreMatchStats };

export default function MatchStatsPreview({ stats }: MatchStatsPreviewProps) {
  const [section, setSection] = useState("h2h");

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const ResultRow = ({
    match,
    teamId, // el id del equipo que estamos analizando (homeTeamId o awayTeamId)
  }: {
    match: any;
    teamId: number;
  }) => {
    // ¿el equipo analizado fue local o visitante en este partido?
    const isTeamHome = match.teams.home.id === teamId;

    const teamGoals = isTeamHome ? match.goals.home : match.goals.away;
    const oppGoals = isTeamHome ? match.goals.away : match.goals.home;

    let isWin = false;
    let isLose = false;

    if (teamGoals > oppGoals) isWin = true;
    else if (teamGoals < oppGoals) isLose = true;

    const bgColor = isWin ? "#e8f5e9" : isLose ? "#ffebee" : "#eeeeee";
    const icon = isWin
      ? "check-circle"
      : isLose
        ? "close-circle"
        : "minus-circle";
    const iconColor = isWin ? "#2e7d32" : isLose ? "#c62828" : "#616161";

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: bgColor,
          borderRadius: 8,
          padding: 8,
          marginBottom: 8,
        }}
      >
        {/* Equipo local */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Avatar.Image size={32} source={{ uri: match.teams.home.logo }} />
          <Text numberOfLines={1} style={{ marginTop: 4 }}>
            {match.teams.home.name}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 14, marginTop: 2 }}>
            {match.goals.home}
          </Text>
        </View>

        <Text style={{ fontWeight: "bold", marginHorizontal: 8 }}>vs</Text>

        {/* Equipo visitante */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Avatar.Image size={32} source={{ uri: match.teams.away.logo }} />
          <Text numberOfLines={1} style={{ marginTop: 4 }}>
            {match.teams.away.name}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 14, marginTop: 2 }}>
            {match.goals.away}
          </Text>
        </View>

        {/* Resultado para el equipo analizado */}
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={iconColor}
          style={{ marginLeft: 8 }}
        />
      </View>
    );
  };

  const actionPlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  const renderSection = () => {
    switch (section) {
      case "h2h":
        return (
          <Card style={{ margin: 10 }}>
            <Card.Title title="Últimos enfrentamientos" />
            <Card.Content>
              {stats &&
                stats.headToHead.slice(0, 5).map((match: any, i: number) => (
                  <Text key={i} style={{ marginVertical: 2 }}>
                    {match.teams.home.name} {match.goals.home} -{" "}
                    {match.goals.away} {match.teams.away.name}
                  </Text>
                ))}
            </Card.Content>
          </Card>
        );

      case "averages":
        return (
          <Card style={{ margin: 10 }}>
            <Card.Title title="Promedios últimos 5 partidos" />
            <Card.Content>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Estadística</DataTable.Title>
                  <DataTable.Title numeric>Local</DataTable.Title>
                  <DataTable.Title numeric>Visitante</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell>Posesión</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {stats && stats.homeAverages.possession}%
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {stats && stats.awayAverages.possession}%
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>Tiros</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {stats && stats.homeAverages.shots}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {stats && stats.awayAverages.shots}
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>Pases</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {stats && stats.homeAverages.passes}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {stats && stats.awayAverages.passes}
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        );

      case "scorers":
        return (
          <Card style={{ margin: 10, borderRadius: 12, elevation: 2 }}>
            {/* --- Goleadores --- */}
            <Card.Title title="Top Goleadores" titleVariant="titleMedium" />
            <Card.Content>
              <View style={{ flexDirection: "row", gap: 16 }}>
                {/* Local */}
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 6 }}>
                    Local
                  </Text>
                  {stats?.topScorers.home.map((p: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => actionPlayer(p.id)}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{ flex: 1, marginRight: 6 }}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontWeight: "bold" }}>{p.value}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Visitante */}
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 6 }}>
                    Visitante
                  </Text>
                  {stats?.topScorers.away.map((p: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => actionPlayer(p.id)}
                    >
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{ flex: 1, marginRight: 6 }}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontWeight: "bold" }}>{p.value}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card.Content>

            {/* Separador */}
            <View
              style={{
                height: 1,
                backgroundColor: colors.background,
                marginVertical: 8,
              }}
            />

            {/* --- Asistentes --- */}
            <Card.Title title="Top Asistentes" titleVariant="titleMedium" />
            <Card.Content>
              <View style={{ flexDirection: "row", gap: 16 }}>
                {/* Local */}
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 6 }}>
                    Local
                  </Text>
                  {stats?.topAssisters.home.map((p: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => actionPlayer(p.id)}
                    >
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{ flex: 1, marginRight: 6 }}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontWeight: "bold" }}>{p.value}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Visitante */}
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 6 }}>
                    Visitante
                  </Text>
                  {stats?.topAssisters.away.map((p: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => actionPlayer(p.id)}
                    >
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{ flex: 1, marginRight: 6 }}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontWeight: "bold" }}>{p.value}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>
        );

      case "recent":
        return (
          <Card style={{ margin: 10, borderRadius: 12, elevation: 2 }}>
            <Card.Title title="Últimos Resultados" titleVariant="titleMedium" />
            <Card.Content>
              {/* ---- Local ---- */}
              <Text variant="titleSmall" style={{ marginBottom: 6 }}>
                Local
              </Text>
              {stats?.homeRecent.map((match: any, i: number) => (
                <ResultRow
                  key={`home-${i}`}
                  match={match}
                  teamId={stats.homeTeamId} // ✅ pasamos el id del equipo local del fixture
                />
              ))}

              {/* ---- Visitante ---- */}
              <Text
                variant="titleSmall"
                style={{ marginTop: 12, marginBottom: 6 }}
              >
                Visitante
              </Text>
              {stats?.awayRecent.map((match: any, i: number) => (
                <ResultRow
                  key={`away-${i}`}
                  match={match}
                  teamId={stats.awayTeamId} // ✅ pasamos el id del equipo visitante del fixture
                />
              ))}
            </Card.Content>
          </Card>
        );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Navegación */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        <SegmentedButtons
          value={section}
          onValueChange={setSection}
          buttons={[
            { value: "h2h", label: "H2H" },
            { value: "averages", label: "Promedios" },
            { value: "scorers", label: "Jugadores" },
            { value: "recent", label: "Últimos" },
          ]}
          style={{ marginBottom: 5 }}
        />
      </ScrollView>

      {/* Sección activa */}
      {renderSection()}
    </View>
  );
}
