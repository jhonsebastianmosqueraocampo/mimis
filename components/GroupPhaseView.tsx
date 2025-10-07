import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type GroupStanding = {
  leagueId: number;
  season: number;
  group: string;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  rank: number;
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
};

type Props = {
  standings: GroupStanding[];
  teamId?: string;
};

const GroupPhaseView = ({ standings, teamId }: Props) => {
  const grouped = standings.reduce((acc, curr) => {
    const groupKey = `${curr.group}-${curr.leagueId}-${curr.season}`;
    if (!acc[groupKey]) acc[groupKey] = { name: curr.group, teams: [] };
    acc[groupKey].teams.push(curr);
    return acc;
  }, {} as Record<string, { name: string; teams: GroupStanding[] }>);

  const seenGroups = new Set();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(grouped).map(([key, { name, teams }]) => {
        if (seenGroups.has(name)) return null;
        seenGroups.add(name);

        return (
          <View key={key} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>Grupo {name}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 500 }}>
                <View style={[styles.row, styles.header]}>
                  <Text style={[styles.cellRank, styles.bold]}>#</Text>
                  <Text style={[styles.cellTeam, styles.bold]}>Equipo</Text>
                  <Text style={[styles.cell, styles.bold]}>PJ</Text>
                  <Text style={[styles.cell, styles.bold]}>G</Text>
                  <Text style={[styles.cell, styles.bold]}>E</Text>
                  <Text style={[styles.cell, styles.bold]}>P</Text>
                  <Text style={[styles.cell, styles.bold]}>GF</Text>
                  <Text style={[styles.cell, styles.bold]}>GC</Text>
                  <Text style={[styles.cell, styles.bold]}>Pts</Text>
                </View>

                {teams
                  .sort((a, b) => a.rank - b.rank)
                  .map((team) => {
                    const isFavorite = team.team.id.toString() === teamId;
                    return (
                      <View
                        key={team.team.id}
                        style={[
                          styles.row,
                          styles.teamRow,
                          isFavorite && styles.favoriteRow,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cellRank,
                            isFavorite && styles.favoriteText,
                          ]}
                        >
                          {team.rank}
                        </Text>
                        <View style={styles.teamCell}>
                          <Image
                            source={{ uri: team.team.logo }}
                            style={styles.logo}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.teamName,
                              isFavorite && styles.favoriteText,
                            ]}
                          >
                            {team.team.name}
                          </Text>
                        </View>
                        <Text style={styles.cell}>{team.all.played}</Text>
                        <Text style={styles.cell}>{team.all.win}</Text>
                        <Text style={styles.cell}>{team.all.draw}</Text>
                        <Text style={styles.cell}>{team.all.lose}</Text>
                        <Text style={styles.cell}>{team.all.goals.for}</Text>
                        <Text style={styles.cell}>{team.all.goals.against}</Text>
                        <Text style={[styles.cell, styles.bold]}>
                          {team.points}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 32,
  },
  groupContainer: {
    marginBottom: 28,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "left",
    marginBottom: 10,
    marginLeft: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 2,
    paddingHorizontal: 6,
  },
  header: {
    backgroundColor: "#f0f0f0",
  },
  teamRow: {
    backgroundColor: "#fafafa",
  },
  favoriteRow: {
    backgroundColor: "#e0f7ff",
    borderColor: "#2196f3",
    borderWidth: 1,
  },
  cellRank: {
    width: 26,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
  },
  cell: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  teamCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 4,
  },
  teamName: {
    fontSize: 13,
    flexShrink: 1,
  },
  cellTeam: {
    flex: 1,
    fontSize: 13,
    paddingLeft: 4,
  },
  favoriteText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default GroupPhaseView;