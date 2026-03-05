import { colors } from "@/theme/colors";
import { PlayerCareer, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Card, Divider, Paragraph, Title } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type PlayerCareerProps = {
  player: PlayerCareer;
};

export default function PlayerCareerScreen({ player }: PlayerCareerProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  const handleLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  return (
    <View style={{ padding: 12 }}>
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Card.Content style={{ alignItems: "center" }}>
          <Image
            source={{ uri: player.photo }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 8,
            }}
          />
          <Title>{player.name}</Title>
          <Paragraph style={{ color: "gray" }}>{player.nationality}</Paragraph>
          <Text style={{ marginTop: 4, fontWeight: "600" }}>
            Temporada {player.season}
          </Text>
        </Card.Content>
      </Card>

      {player.history.map((h, idx) => (
        <Card
          key={idx}
          style={{
            borderRadius: 14,
            marginBottom: 16,
            backgroundColor: colors.surface,
          }}
        >
          <Card.Content>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={() => handleLeague(h.league.id.toString())}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {h.league.name}
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 6,
              }}
            >
              ({h.league.country}) - {h.league.season}
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={() => handleTeam(h.team.id.toString())}
            >
              <Image
                source={{ uri: h.team.logo }}
                style={{ width: 36, height: 36, marginRight: 10 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {h.team.name}
              </Text>
            </TouchableOpacity>

            <Divider style={{ marginBottom: 10 }} />

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                Partidos
              </Text>
              <Text>👕 Apariciones: {h.games.appearences || 0}</Text>
              <Text>📋 Titular: {h.games.lineups || 0}</Text>
              <Text>⏱️ Minutos: {h.games.minutes || 0}</Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "600", marginBottom: 4 }}>Ataque</Text>
              <Text>⚽ Goles: {h.goals.total || 0}</Text>
              <Text>🎯 Asistencias: {h.goals.assists || 0}</Text>
            </View>

            <View>
              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                Disciplina
              </Text>
              <Text>🟨 Amarillas: {h.cards.yellow || 0}</Text>
              <Text>🟥 Rojas: {h.cards.red || 0}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}
