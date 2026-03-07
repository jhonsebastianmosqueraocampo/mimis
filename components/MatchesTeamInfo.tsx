import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Chip } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { Fixture, RootStackParamList } from "../types";
import Loading from "./Loading";
import NextMatchBanner from "./NextMatchBanner";
import PastMatchesList from "./PastMatchesList";
import UpcomingMatchesList from "./UpcomingMatchesList";

type MatchesTeamInfoProps = {
  teamId: string;
};

const items = [
  { id: "1", name: "Partidos Anteriores" },
  { id: "2", name: "Siguientes Partidos" },
];

export default function MatchesTeamInfo({ teamId }: MatchesTeamInfoProps) {
  const { getNextTeamMatch, getPreviousAndPostTeamMatches } = useFetch();
  const [nextMatch, setNextMatch] = useState<Fixture | null>(null);
  const [previousMatches, setPreviousMatches] = useState<Fixture[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Fixture[]>([]);
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      setLoading(true);
      setError("");

      try {
        await Promise.all([getNextMatch(), getPrevAndUpcoming()]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [teamId]);

  const getNextMatch = async () => {
    const { success, fixture, message } = await getNextTeamMatch(teamId);
    success ? setNextMatch(fixture) : setError(message!);
  };

  const getPrevAndUpcoming = async () => {
    const { success, pastFixtures, upcomingFixtures, message } =
      await getPreviousAndPostTeamMatches(teamId);

    if (success) {
      setPreviousMatches(pastFixtures || []);
      setUpcomingMatches(upcomingFixtures || []);
    } else {
      setError(message!);
    }
  };

  const actionMatch = (id: string) => {
    navigation.navigate("match", { id });
  };

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <ScrollView>
      <NextMatchBanner
        homeTeam={{
          id: nextMatch?.teams.home.id.toString() ?? "",
          title: nextMatch?.teams.home.name ?? "",
          img: nextMatch?.teams.home.logo ?? "",
          pathTo: "",
        }}
        awayTeam={{
          id: nextMatch?.teams.away.id.toString() ?? "",
          title: nextMatch?.teams.away.name ?? "",
          img: nextMatch?.teams.away.logo ?? "",
          pathTo: "",
        }}
        datetime={nextMatch?.date.toString() ?? ""}
        stadium={nextMatch?.venue.name ?? ""}
        referee={nextMatch?.referee ?? ""}
        tournament={nextMatch?.league.name ?? ""}
        fixtureId={nextMatch?.fixtureId!}
        actionMatch={actionMatch}
      />

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
          <PastMatchesList
            previousMatches={previousMatches}
            teamId={teamId}
            actionMatch={actionMatch}
          />
        </View>
      )}

      {selectedItem.name.toLowerCase() === "siguientes partidos" && (
        <View style={styles.section}>
          <UpcomingMatchesList
            upcomingMatches={upcomingMatches}
            teamId={teamId}
            actionMatch={actionMatch}
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
    borderColor: colors.primary,
    backgroundColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
});
