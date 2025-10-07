import { useFetch } from "@/hooks/FetchContext";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip } from "react-native-paper";
import {
  Competitions,
  CupStanding,
  Fixture,
  GroupStanding,
  TeamStanding,
  type SeasonResultsProps,
} from "../types";
import FriendlyMatches from "./FriendlyMatches";
import GroupPhaseView from "./GroupPhaseView";
import { KnockoutBracket } from "./KnockoutBracket";
import LeagueTable from "./LeagueTable";

const itemsTournament = [
  { id: 1, item: "Fase de Grupos" },
  { id: 2, item: "Fase eliminatoria" },
];

export default function SeasonResults({ teamId, league }: SeasonResultsProps) {
  const {
    getLeaguesByTeam,
    getStangingsLeague,
    getStangingsCup,
    getFriendlyMatches,
  } = useFetch();
  const [competitions, setCompetitions] = useState<Competitions[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [cupGroupStandings, setCupGroupStandings] = useState<GroupStanding[]>(
    []
  );
  const [hasGroupPhase, setHasGroupPhase] = useState(false);
  const [cupStandings, setCupStandings] = useState<CupStanding[]>([]);
  const [friendlyStandings, setFriendlyStandings] = useState<Fixture[]>([]);
  const [error, setError] = useState("");
  const [selectedItemTournament, setSelectedItemTournament] = useState(
    itemsTournament[0].id
  );
  const [selectedCompetition, setSelectedCompetition] = useState(
    competitions[0]?.league.id || ""
  );
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (competitions.length > 0 && !selectedCompetition) {
      setSelectedCompetition(competitions[0].league.id);
    }
  }, [competitions]);

  useEffect(() => {
    getLeagues();
  }, [teamId]);

  useEffect(() => {
    const league = selectedComp?.league;
    if (!league) return;

    const isFriendlyByName = league.name.toLowerCase().includes("friendlies");

    switch (league.leagueType) {
      case "Cup":
        if (isFriendlyByName) {
          getFriendlies();
        } else {
          getCupStandings();
        }
        break;
      case "League":
        getStandings();
        break;
      case "Friendly":
        getFriendlies();
        break;
      default:
        break;
    }
  }, [selectedCompetition]);

  useEffect(() => {
    if (league) {
      const competition: Competitions = {
        team: {
          id: "",
        },
        league: {
          id: league.league.id.toString(),
          name: league.league.name,
          logo: league.league.logo?.toString() ?? "",
          leagueType: league.league.type,
        },
      };
      setCompetitions((prev) => [...prev, competition]);
    }
  }, [league]);

  const selectedComp = competitions.find(
    (c) => c.league.id === selectedCompetition
  );

  const getLeagues = async () => {
    if (teamId) {
      const { success, competitions, message } = await getLeaguesByTeam(teamId);
      success ? setCompetitions(competitions) : setError(message!);
    }
  };

  const getStandings = async () => {
    const { success, standings, message } = await getStangingsLeague(
      selectedCompetition
    );
    success ? setStandings(standings) : setError(message!);
  };

  const getCupStandings = async () => {
    const { success, hasGroupPhase, groupPhase, knockoutPhase, message } =
      await getStangingsCup(selectedCompetition);
    if (success) {
      setCupGroupStandings(groupPhase);
      setCupStandings(knockoutPhase);
      setHasGroupPhase(hasGroupPhase);
    } else {
      setError(message!);
    }
  };

  const getFriendlies = async () => {
    if (teamId) {
      const { success, fixtures, message } = await getFriendlyMatches(teamId);
      if (success) {
        setFriendlyStandings(fixtures);
      } else {
        setError(message!);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resultados de la Temporada</Text>
      <View style={styles.row}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCompetition}
            onValueChange={(itemValue) => {
              setSelectedCompetition(itemValue);
              setSelectedTeam(null);
            }}
            style={styles.picker}
            dropdownIconColor="#444"
          >
            {competitions.map(({ league }) => (
              <Picker.Item
                key={league.id}
                label={league.name}
                value={league.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {selectedComp?.league.leagueType.toLowerCase() === "friendlies" && (
        <FriendlyMatches standings={friendlyStandings} teamId={teamId} />
      )}

      {selectedComp?.league.leagueType.toLowerCase() === "cup" &&
        selectedComp.league.name.toLowerCase().includes("friendlies") && (
          <FriendlyMatches standings={friendlyStandings} teamId={teamId} />
        )}

      {selectedComp?.league.leagueType.toLowerCase() === "league" && (
        <LeagueTable
          standings={standings}
          selectedTeam={selectedTeam ?? ""}
          setSelectedTeam={setSelectedTeam}
          teamId={teamId}
        />
      )}

      {selectedComp?.league.leagueType.toLowerCase() === "cup" &&
        !selectedComp.league.name.toLowerCase().includes("friendlies") && (
          <View style={styles.card}>
            {hasGroupPhase ? (
              <>
                <ScrollView horizontal>
                  {itemsTournament.map((item) => (
                    <Chip
                      key={item.id}
                      mode={
                        selectedItemTournament === item.id ? "flat" : "outlined"
                      }
                      style={[
                        styles.chip,
                        selectedItemTournament === item.id &&
                          styles.chipSelected,
                      ]}
                      textStyle={{
                        color:
                          selectedItemTournament === item.id ? "#fff" : "#000",
                      }}
                      onPress={() => setSelectedItemTournament(item.id)}
                    >
                      {item.item.toUpperCase()}
                    </Chip>
                  ))}
                </ScrollView>
                {selectedItemTournament === 1 ? (
                  <View style={{ marginTop: 16 }}>
                    <GroupPhaseView
                      standings={cupGroupStandings}
                      teamId={teamId}
                    />
                  </View>
                ) : (
                  <KnockoutBracket standings={cupStandings} teamId={teamId} />
                )}
              </>
            ) : (
              <KnockoutBracket standings={cupStandings} teamId={teamId} />
            )}
          </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "goli",
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    marginTop: 6,
  },

  picker: {
    height: 50,
    width: "100%",
    color: "#222",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: "#1DB954",
  },
  chipSelected: {
    backgroundColor: "#1DB954",
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "goli",
  },
});
