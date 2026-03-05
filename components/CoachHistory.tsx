import { colors } from "@/theme/colors";
import { SeasonStats } from "@/types";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Divider, Paragraph, Title } from "react-native-paper";

type Props = {
  history: SeasonStats[];
};

export default function CoachHistory({ history }: Props) {
  return (
    <View style={styles.container}>
      {history.map((h) => (
        <Card key={h.season} style={styles.card}>
          <Card.Title
            title={`Temporada ${h.season}`}
            subtitle={h.team?.name ?? "Equipo desconocido"}
            left={(props) =>
              h.team?.logo ? (
                <Avatar.Image
                  {...props}
                  size={40}
                  source={{ uri: h.team.logo }}
                />
              ) : null
            }
          />
          <Card.Content>
            <Paragraph>Partidos jugados: {h.stats.played}</Paragraph>
            <Paragraph>Victorias: {h.stats.wins}</Paragraph>
            <Paragraph>Empates: {h.stats.draws}</Paragraph>
            <Paragraph>Derrotas: {h.stats.losses}</Paragraph>
            <Paragraph>Goles a favor: {h.stats.goalsFor}</Paragraph>
            <Paragraph>Goles en contra: {h.stats.goalsAgainst}</Paragraph>
            <Divider style={{ marginVertical: 6 }} />
            <Title>Win Rate: {h.stats.winRate}</Title>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
  },
  card: {
    marginVertical: 8,
    elevation: 3,
  },
});
