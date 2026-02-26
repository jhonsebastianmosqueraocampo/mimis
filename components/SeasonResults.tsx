import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Chip } from "react-native-paper";
import {
  Competitions,
  CupStanding,
  Fixture,
  GroupStanding,
  LiveMatch,
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

function normalizePhasesFromRaw(raw: any) {
  if (!raw?.standings) return [];

  return raw.standings.map((block: any[], index: number) => {
    const sample = block[0];

    const isGroup =
      sample?.group &&
      typeof sample.group === "string" &&
      sample.group.length > 0;

    const isLeague = !isGroup && block.length > 10; // heurística razonable

    return {
      id: index,
      name: sample?.group ?? (isLeague ? "Fase Liga" : `Fase ${index + 1}`),
      type: isGroup ? "group" : "league",
      standings: block,
    };
  });
}

export default function SeasonResults({
  teamId,
  league,
  equiposFavoritos,
}: SeasonResultsProps) {
  const {
    getLeaguesByTeam,
    getStangingsLeague,
    getStangingsCup,
    getFriendlyMatches,
  } = useFetch();
  const [competitions, setCompetitions] = useState<Competitions[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [cupGroupStandings, setCupGroupStandings] = useState<GroupStanding[]>(
    [],
  );
  const [hasGroupPhase, setHasGroupPhase] = useState(false);
  const [cupStandings, setCupStandings] = useState<CupStanding[]>([]);
  const [friendlyStandings, setFriendlyStandings] = useState<Fixture[]>([]);
  const [error, setError] = useState("");
  const [selectedItemTournament, setSelectedItemTournament] = useState(
    itemsTournament[0].id,
  );
  const [selectedCompetition, setSelectedCompetition] = useState(
    competitions[0]?.league.id || "",
  );
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [allMatches, setAllMatches] = useState<LiveMatch[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const currentYear = new Date().getFullYear();
  const seasons = Array.from({ length: 11 }, (_, i) => currentYear - i);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (competitions.length > 0 && !selectedCompetition) {
      setSelectedCompetition(competitions[0].league.id);
    }
  }, [competitions]);

  useEffect(() => {
    getLeagues();
  }, [teamId, selectedSeason]);

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
  }, [selectedCompetition, selectedSeason]);

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
    (c) => c.league.id === selectedCompetition,
  );

  const getLeagues = async () => {
    if (teamId) {
      const { success, competitions, message } = await getLeaguesByTeam(
        teamId,
        selectedSeason.toString(),
      );
      success ? setCompetitions(competitions) : setError(message!);
    }
  };

  const getStandings = async () => {
    const { success, standings, raw, matches } = await getStangingsLeague(
      selectedCompetition,
      selectedSeason.toString(),
    );

    if (success && raw) {
      const parsedPhases = normalizePhasesFromRaw(raw);

      setPhases(parsedPhases);
      setSelectedPhase(0);
      setStandings(parsedPhases[0]?.standings ?? []);
      setAllMatches(matches);
    }
  };

  const getCupStandings = async () => {
    const {
      success,
      hasGroupPhase,
      groupPhase,
      knockoutPhase,
      matches,
      message,
    } = await getStangingsCup(selectedCompetition, selectedSeason.toString());
    if (success) {
      setCupGroupStandings(groupPhase);
      setCupStandings(knockoutPhase);
      setHasGroupPhase(hasGroupPhase);
      setAllMatches(matches);
    } else {
      setError(message!);
    }
  };

  const getFriendlies = async () => {
    if (teamId) {
      const { success, fixtures, message } = await getFriendlyMatches(
        teamId,
        selectedSeason.toString(),
      );
      if (success) {
        setFriendlyStandings(fixtures);
      } else {
        setError(message!);
      }
    }
  };

  // 🕒 Inicia polling (solo si es LEAGUE)
  const startPolling = useCallback(() => {
    const league = selectedComp?.league;
    if (!league) return;
    const compType = league.leagueType;
    const isFriendlyByName = league.name.toLowerCase().includes("friendlies");

    if (isFriendlyByName) return; // 🧠 solo si es liga o copa
    if (intervalRef.current) return; // evitar duplicados

    intervalRef.current = setInterval(async () => {
      if (compType === "League") await getStandings();
      if (compType === "Cup") await getCupStandings();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, 60 * 1000); // cada minuto
  }, [selectedComp, getStandings, getCupStandings]);

  // 🕓 Detiene polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 🧭 controla ciclo de vida (app en background / foreground)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") startPolling();
      else if (next.match(/inactive|background/)) stopPolling();
      appState.current = next;
    });

    // inicia si es League
    startPolling();

    return () => {
      stopPolling();
      sub.remove();
    };
  }, [startPolling, stopPolling]);

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

      <View style={styles.row}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSeason}
            onValueChange={(value) => setSelectedSeason(value)}
            style={styles.picker}
            dropdownIconColor="#444"
          >
            <Picker.Item label={`Actual (${currentYear})`} value={0} />
            {/* envía 0 */}
            {seasons.slice(1).map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
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

      {phases.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {phases.map((phase, idx) => (
            <Chip
              key={idx}
              mode={selectedPhase === idx ? "flat" : "outlined"}
              style={[
                styles.chip,
                selectedPhase === idx && styles.chipSelected,
              ]}
              textStyle={{
                color: selectedPhase === idx ? "#fff" : "#000",
              }}
              onPress={() => {
                setSelectedPhase(idx);
                setStandings(phase.standings);
              }}
            >
              {phase.name.toUpperCase()}
            </Chip>
          ))}
        </ScrollView>
      )}

      {phases.length > 0 && (
        <LeagueTable
          standings={standings}
          matches={allMatches}
          selectedTeam={selectedTeam ?? ""}
          setSelectedTeam={setSelectedTeam}
          teamId={teamId}
          equiposFavoritos={equiposFavoritos}
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
                      matches={allMatches}
                    />
                  </View>
                ) : (
                  <KnockoutBracket
                    standings={cupStandings}
                    teamId={teamId}
                    matches={allMatches}
                  />
                )}
              </>
            ) : (
              <KnockoutBracket
                standings={cupStandings}
                teamId={teamId}
                matches={allMatches}
              />
            )}
          </View>
        )}

      <View style={{ marginVertical: 20, alignItems: "center" }}>
        <AdBanner />
      </View>
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
