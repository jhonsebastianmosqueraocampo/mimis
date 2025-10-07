import { useFetch } from "@/hooks/FetchContext";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Chip } from "react-native-paper";
import { Fixture } from "../types";
import PastMatchesList from "./PastMatchesList";
import UpcomingMatchesList from "./UpcomingMatchesList";

type MatchesLeagueInfoProps = {
  leagueId: string;
};

const items = [
  { id: "1", name: "Partidos Anteriores" },
  { id: "2", name: "Siguientes Partidos" },
];

export default function MatchesLeagueInfo({ leagueId }: MatchesLeagueInfoProps) {
  const { getPreviousAndPostLeagueMatches } = useFetch();
  const [nextMatch, setNextMatch] = useState<Fixture | null>(null);
  const [previousMatches, setPreviousMatches] = useState<Fixture[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Fixture[]>([]);
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const leagueMatches = async () => {
      setLoading(true);
      try {
        const season = new Date().getFullYear();
        const { success, pastFixtures, upcomingFixtures, message } =
          await getPreviousAndPostLeagueMatches(leagueId, season);

        if (!isMounted) return;

        if (success) {
          setPreviousMatches(pastFixtures!);
          setUpcomingMatches(upcomingFixtures!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (leagueId && selectedItem) {
      leagueMatches();
    }

    return () => {
      isMounted = false;
    };
  }, [leagueId]);

  return (
    <ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {items.map((item) => (
          <Chip
            key={item.id}
            mode={selectedItem.id === item.id ? "flat" : "outlined"}
            onPress={() => setSelectedItem(item)}
            style={[
              styles.chip,
              selectedItem.id === item.id && styles.chipSelected,
            ]}
            textStyle={{
              color: selectedItem.id === item.id ? "#fff" : "#000",
            }}
          >
            {item.name.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      {selectedItem.name.toLowerCase() === "partidos anteriores" && (
        <View style={styles.section}>
          <PastMatchesList previousMatches={previousMatches} />
        </View>
      )}

      {selectedItem.name.toLowerCase() === "siguientes partidos" && (
        <View style={styles.section}>
          <UpcomingMatchesList
            upcomingMatches={upcomingMatches}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  chipScroll: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  chip: {
    marginHorizontal: 4,
    borderColor: "#1DB954",
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#1DB954",
  },
});
