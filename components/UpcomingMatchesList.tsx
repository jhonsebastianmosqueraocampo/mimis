import { Fixture } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Card } from "react-native-paper";

dayjs.extend(relativeTime);

type UpcomingMatchesListProps = {
  upcomingMatches: Fixture[];
  teamId?: string;
  fixtureId: number
  actionMatch: (id: string) => void
};

export default function UpcomingMatchesList({ upcomingMatches, teamId, fixtureId, actionMatch }: UpcomingMatchesListProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={()=>actionMatch(fixtureId.toString())}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: 16 }}>
        {upcomingMatches.map((match, index) => {
          const isHome = match.teams.home.id.toString() == teamId;
          const matchDate = dayjs(match.date);
          const formattedDate = matchDate.format("DD MMM YYYY, HH:mm");
          const timeUntil = matchDate.fromNow();

          const bgColor = "#ffffff";
          const borderColor = isHome ? "#1DB954" : "#F78E4F"; // Azul si es local, naranja si visitante
          const tagColor = borderColor;

          return (
            <Card
              key={index}
              style={[styles.card, { backgroundColor: bgColor, borderLeftColor: borderColor }]}
              elevation={2}
            >
              <View style={styles.header}>
                <Text style={[styles.dateText, { color: borderColor }]}>{formattedDate}</Text>
                <Text style={[styles.tag, { color: tagColor }]}>
                  {match.league.name}
                </Text>
              </View>

              <View style={styles.teams}>
                <View style={styles.team}>
                  <Avatar.Image
                    style={{ backgroundColor: "transparent" }}
                    size={42}
                    source={{ uri: match.teams.home.logo }}
                  />
                  <Text style={styles.teamName}>{match.teams.home.name}</Text>
                </View>

                <Text style={[styles.vs, { color: borderColor }]}>VS</Text>

                <View style={styles.team}>
                  <Avatar.Image
                    style={{ backgroundColor: "transparent" }}
                    size={42}
                    source={{ uri: match.teams.away.logo }}
                  />
                  <Text style={styles.teamName}>{match.teams.away.name}</Text>
                </View>
              </View>

              <Text style={styles.stadiumText}>{match.venue.name}</Text>
              <Text style={styles.timeUntil}>Comienza {timeUntil}</Text>
            </Card>
          );
        })}
      </ScrollView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
    color: "#222",
  },
  scrollArea: {
    paddingRight: 4,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    fontWeight: "600",
    fontSize: 14,
  },
  tag: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  teams: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
  },
  team: {
    alignItems: "center",
    width: 90,
  },
  teamName: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    color: "#333",
  },
  vs: {
    fontWeight: "bold",
    fontSize: 16,
  },
  stadiumText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});