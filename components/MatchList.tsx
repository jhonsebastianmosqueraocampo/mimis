import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Avatar, Card, Chip, Divider } from "react-native-paper";

// Tipos
export type MatchStatus = "scheduled" | "live" | "finished";

export type Team = {
  name: string;
  logoUrl: string;
};

export type Match = {
  id: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  stadium: string;
  status: MatchStatus;
  leg?: "first" | "second";
};

export type Group = {
  name: string;
  matches: Match[];
};

export type TournamentMatches = {
  tournamentName: string;
  groups: Group[];
};

type MatchListProps = {
  matchList: TournamentMatches;
};

const getStatusIcon = (status: MatchStatus) => {
  switch (status) {
    case "live":
      return <MaterialIcons name="play-circle-filled" size={20} color="red" />;
    case "finished":
      return <MaterialIcons name="check-circle" size={20} color="#1DB954" />;
    case "scheduled":
    default:
      return <MaterialIcons name="access-time" size={20} color="#666" />;
  }
};

const renderLegLabel = (leg?: "first" | "second") => {
  if (!leg) return null;
  return (
    <Chip style={styles.legChip}>
      {leg === "first" ? "Ida" : "Vuelta"}
    </Chip>
  );
};

export default function MatchList({ matchList }: MatchListProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleMatchClick = (matchId: string) => {
    console.log("Clicked match:", matchId);
  };

  const renderMatches = (matches: Match[]) => (
    <>
      {matches.map((match) => (
        <TouchableOpacity key={match.id} onPress={() => handleMatchClick(match.id)}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerRow}>
                <View style={styles.statusRow}>
                  {getStatusIcon(match.status)}
                  <Text style={styles.dateText}>
                    {new Date(match.date).toLocaleString()}
                  </Text>
                  {renderLegLabel(match.leg)}
                </View>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: match.status === "live" ? "#e53935" : "#1DB954" },
                  ]}
                  textStyle={{ color: "#fff", fontWeight: "bold" }}
                >
                  {match.status.toUpperCase()}
                </Chip>
              </View>

              <View style={styles.teamsRow}>
                <View style={styles.teamInfo}>
                  <Avatar.Image source={{ uri: match.homeTeam.logoUrl }} size={36} />
                  <Text numberOfLines={1} style={styles.teamName}>{match.homeTeam.name}</Text>
                </View>
                <View style={styles.scoresColumn}>
                  <Text style={styles.score}>
                    {match.status === "scheduled" ? "-" : match.homeScore}
                  </Text>
                  <Text style={styles.score}>
                    {match.status === "scheduled" ? "-" : match.awayScore}
                  </Text>
                </View>
                <View style={styles.teamInfo}>
                  <Avatar.Image source={{ uri: match.awayTeam.logoUrl }} size={36} />
                  <Text numberOfLines={1} style={styles.teamName}>{match.awayTeam.name}</Text>
                </View>
              </View>

              <Divider style={{ marginVertical: 8 }} />
              <View style={styles.stadiumRow}>
                <MaterialIcons name="location-on" size={16} color="#888" />
                <Text style={styles.stadium}>{match.stadium}</Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{matchList.tournamentName}</Text>

      {/* Selector de grupo */}
      <Picker
        selectedValue={selectedGroup}
        onValueChange={(value) => setSelectedGroup(value)}
        style={styles.picker}
      >
        <Picker.Item label="Todos los grupos" value={null} />
        {matchList.groups.map((group) => (
          <Picker.Item label={group.name} value={group.name} key={group.name} />
        ))}
      </Picker>

      {/* Partidos por grupo */}
      {matchList.groups
        .filter((group) => !selectedGroup || group.name === selectedGroup)
        .map((group) => {
          const firstLeg = group.matches.filter((m) => m.leg === "first");
          const secondLeg = group.matches.filter((m) => m.leg === "second");
          const noLeg = group.matches.filter((m) => !m.leg);

          return (
            <View key={group.name} style={{ marginBottom: 24 }}>
              <Text style={styles.groupName}>{group.name}</Text>

              {noLeg.length > 0 && renderMatches(noLeg)}

              {firstLeg.length > 0 && (
                <>
                  <Text style={styles.legTitle}>Partidos de ida</Text>
                  {renderMatches(firstLeg)}
                </>
              )}

              {secondLeg.length > 0 && (
                <>
                  <Text style={styles.legTitle}>Partidos de vuelta</Text>
                  {renderMatches(secondLeg)}
                </>
              )}
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  picker: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    borderColor: "#1DB954",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 4,
  },
  legChip: {
    marginLeft: 8,
    backgroundColor: "#ddd",
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  teamInfo: {
    alignItems: "center",
    width: "30%",
  },
  teamName: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  scoresColumn: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stadiumRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stadium: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  legTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 6,
  },
});