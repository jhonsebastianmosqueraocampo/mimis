import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
    Avatar,
    Card,
    DataTable,
    Modal,
    Portal,
    Text,
} from "react-native-paper";
import { TeamPlayerStatsByLeague } from "../types";

type Props = {
  stats: TeamPlayerStatsByLeague[];
};

export default function PlayersStatsTable({ stats }: Props) {
  const [selected, setSelected] = useState<any>(null);

  // Ligas únicas
  const leagues = stats
    .map((s) => s.players[0]?.statistics[0]?.league)
    .filter(Boolean);

  // Jugadores únicos
  const playersMap: Record<number, any> = {};
  stats.forEach((leagueStats) => {
    leagueStats.players.forEach((p) => {
      if (!playersMap[p.player.id]) {
        playersMap[p.player.id] = { ...p, totalGoals: 0 };
      }
      const goals = p.statistics[0]?.goals.total ?? 0;
      playersMap[p.player.id].totalGoals += goals;
    });
  });
  const players = Object.values(playersMap).sort(
    (a: any, b: any) => b.totalGoals - a.totalGoals
  );

  const fixedColWidth = 160; // ajustar según estilo

  return (
    <View style={styles.container}>
      {/* COLUMNA FIJA JUGADORES */}
      <View style={[styles.fixedCol, { width: fixedColWidth }]}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title
              style={[styles.playerCol, { width: fixedColWidth }]}
            >
              Jugador
            </DataTable.Title>
          </DataTable.Header>
          <DataTable.Header>
            <DataTable.Title
              style={[styles.playerCol, { width: fixedColWidth }]}
            >
              Nombre
            </DataTable.Title>
          </DataTable.Header>

          {players.map((player: any) => (
            <DataTable.Row key={player.player.id}>
              <DataTable.Cell
                style={[styles.playerCol, { width: fixedColWidth }]}
              >
                <View style={styles.playerCell}>
                  <Avatar.Image
                    size={28}
                    source={{ uri: player.player.photo }}
                  />
                  <Text style={styles.playerName}>{player.player.name}</Text>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>

      {/* PARTE SCROLL HORIZONTAL */}
      <ScrollView horizontal style={{ marginLeft: fixedColWidth }}>
        <DataTable>
          {/* Cabecera ligas */}
          <DataTable.Header>
            {leagues.map((league, idx) => (
              <DataTable.Title
                style={styles.leagueGroup}
                key={idx}
                numeric={false}
              >
                <View style={styles.leagueHeader}>
                  <Avatar.Image size={24} source={{ uri: league.logo }} />
                  <Text style={styles.leagueName}>{league.name}</Text>
                </View>
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {/* Subcabecera */}
          <DataTable.Header>
            {leagues.map((_, idx) => (
              <React.Fragment key={idx}>
                <DataTable.Title style={styles.statCol}>PJ</DataTable.Title>
                <DataTable.Title style={styles.statCol}>G</DataTable.Title>
                <DataTable.Title style={styles.statCol}>🟨</DataTable.Title>
              </React.Fragment>
            ))}
          </DataTable.Header>

          {/* Filas con stats */}
          {players.map((player: any) => (
            <DataTable.Row key={player.player.id}>
              {leagues.map((league, idx) => {
                const leagueStat = stats
                  .find((s) => s.leagueId === league.id)
                  ?.players.find((p) => p.player.id === player.player.id)
                  ?.statistics[0];

                return (
                  <React.Fragment key={idx}>
                    <DataTable.Cell style={styles.statCol}>
                      {leagueStat ? (
                        <TouchableOpacity
                          onPress={() =>
                            setSelected({
                              player: player.player,
                              stats: leagueStat,
                              league: league.name,
                            })
                          }
                        >
                          <Text>{leagueStat.games.appearences ?? 0}</Text>
                        </TouchableOpacity>
                      ) : (
                        "-"
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.statCol}>
                      {leagueStat ? (
                        <Text style={styles.goalText}>
                          {leagueStat.goals.total ?? 0}
                        </Text>
                      ) : (
                        "-"
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.statCol}>
                      {leagueStat ? (
                        <Text style={styles.cardText}>
                          {leagueStat.cards.yellow ?? 0}
                        </Text>
                      ) : (
                        "-"
                      )}
                    </DataTable.Cell>
                  </React.Fragment>
                );
              })}
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      

      {/* Modal detalle */}
      <Portal>
        <Modal
          visible={!!selected}
          onDismiss={() => setSelected(null)}
          contentContainerStyle={styles.modal}
        >
          {selected && (
            <Card>
              <Card.Title
                title={`${selected.player.name} - ${selected.league}`}
              />
              <Card.Content>
                <Text>Edad: {selected.player.age ?? "-"}</Text>
                <Text>Posición: {selected.stats.games.position ?? "-"}</Text>
                <Text>Partidos: {selected.stats.games.appearences ?? 0}</Text>
                <Text>Minutos: {selected.stats.games.minutes ?? 0}</Text>
                {selected.stats.games.rating && (
                  <Text>Rating: {selected.stats.games.rating}</Text>
                )}
                <Text>Goles: {selected.stats.goals.total ?? 0}</Text>
                <Text>Asistencias: {selected.stats.goals.assists ?? 0}</Text>
                <Text>
                  Tarjetas amarillas: {selected.stats.cards.yellow ?? 0}
                </Text>
                <Text>Tarjetas rojas: {selected.stats.cards.red ?? 0}</Text>

                {/* Opcionales: si tienes esos datos en tu tipo, puedes descomentar y agregar */}
                {/* <Text>Pie dominante: {selected.player.foot ?? "-"}</Text> */}
                {/* <Text>Número camiseta: {selected.stats.games.number ?? "-"}</Text> */}
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "relative",
  },
  fixedCol: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#f7f7f7",
    zIndex: 10,
    elevation: 10,
  },
  playerCol: {
    flex: 1,
    minWidth: 250,
    justifyContent: "flex-start",
  },
  leagueGroup: {
    width: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  statCol: {
    width: 70,
    justifyContent: "center",
  },
  playerCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerName: {
    marginLeft: 6,
    fontSize: 12,
  },
  leagueHeader: {
    alignItems: "center",
  },
  leagueName: {
    fontSize: 10,
    textAlign: "center",
  },
  goalText: {
    fontWeight: "bold",
    color: "#0a0",
  },
  cardText: {
    color: "#c90",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
