import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { LeagueB, RootStackParamList, Team } from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

const PRIMARY = "#1DB954"; // 💚 color principal
const currentYear = new Date().getFullYear();

type TeamSummary = {
  teamId: number;
  season: number;
  name: string;
  logoUrl: string;
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  recentForm: string[];
  topPlayer: {
    name: string;
    photo: string;
    goals: number;
    assists: number;
  } | null;
  nextMatch: {
    opponent: string;
    date: string;
    home: boolean;
  } | null;
  seasonProgress: Array<{
    matchday: number;
    points: number;
    position: number;
    opponent: string;
    result: string;
    score: string;
    date: string;
  }>;
};

const FormChip = ({ result }: { result: string }) => {
  const color =
    result === "W" ? "#2ecc71" : result === "D" ? "#f39c12" : "#e74c3c";
  return (
    <Chip
      style={{
        marginRight: 4,
        backgroundColor: color,
      }}
      textStyle={{ color: "white", fontWeight: "bold" }}
    >
      {result}
    </Chip>
  );
};

export default function Stats() {
  const { getLeagues, getTeamsFromLeague, getTeamSummary } = useFetch();

  const [search, setSearch] = useState("");
  const [leagues, setLeagues] = useState<LeagueB[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [summary, setSummary] = useState<TeamSummary | null>(null);

  const [selectedLeague, setSelectedLeague] = useState<LeagueB | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [season, setSeason] = useState<number>(currentYear);

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const seasons = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 1️⃣ Obtener ligas
  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      try {
        const { leagues } = await getLeagues();
        setLeagues(leagues);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  // 2️⃣ Obtener equipos
  const handleSelectLeague = async (l: LeagueB) => {
    setSelectedLeague(l);
    setSelectedTeam(null);
    setSummary(null);
    setLoading(true);
    try {
      const { data } = await getTeamsFromLeague(l.league.id);
      setTeams(data);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Obtener resumen
  const handleSelectTeam = async (
    team: Team,
    leagueId: string,
    season: number,
  ) => {
    setSelectedTeam(team);
    setLoading(true);
    try {
      const { teamSummaty } = await getTeamSummary(
        team.teamId,
        leagueId,
        season,
      );
      setSummary(teamSummaty);
    } catch (error) {
      console.error("Error obteniendo resumen:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ Refrescar al cambiar temporada
  useEffect(() => {
    if (selectedTeam)
      handleSelectTeam(
        selectedTeam,
        selectedLeague!.league.id.toString(),
        season,
      );
  }, [season]);

  const filteredLeagues = leagues.filter((l) =>
    l.league.name.toLowerCase().includes(search.toLowerCase()),
  );

  const actionLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  const actionTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  if (loading)
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 🔍 Buscar liga */}
        {!selectedLeague && (
          <>
            <TextInput
              mode="outlined"
              label="Buscar liga"
              value={search}
              onChangeText={setSearch}
              outlineColor={PRIMARY}
              activeOutlineColor={PRIMARY}
              style={{ marginBottom: 12 }}
              right={<TextInput.Icon icon="magnify" color={PRIMARY} />}
            />

            {loading ? (
              <ActivityIndicator animating color={PRIMARY} />
            ) : (
              filteredLeagues.map((l) => (
                <Card
                  key={l.league.id}
                  style={{
                    marginBottom: 12,
                    borderLeftColor: PRIMARY,
                    borderLeftWidth: 4,
                  }}
                  onPress={() => actionLeague(l.league.id.toString())}
                >
                  <Card.Title
                    title={l.league.name}
                    subtitle={l.country.name}
                    left={(props) => (
                      <Avatar.Image
                        {...props}
                        source={{ uri: l.league.logo || l.country.flag }}
                      />
                    )}
                    right={() => (
                      <Button
                        textColor="white"
                        buttonColor={PRIMARY}
                        onPress={() => handleSelectLeague(l)}
                      >
                        Ver equipos
                      </Button>
                    )}
                  />
                </Card>
              ))
            )}
          </>
        )}

        {/* ⚽ Equipos */}
        {selectedLeague && !selectedTeam && (
          <>
            <Button
              icon="arrow-left"
              mode="outlined"
              textColor={PRIMARY}
              style={{
                borderColor: PRIMARY,
                marginBottom: 10,
              }}
              onPress={() => setSelectedLeague(null)}
            >
              Volver a ligas
            </Button>

            <View style={styles.leagueRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.leagueName}>
                  {selectedLeague.league.name}
                </Text>
                <Text style={styles.leagueCountry}>
                  {selectedLeague.country.name}
                </Text>
              </View>

              <Button
                mode="contained-tonal"
                icon="arrow-right"
                onPress={() =>
                  navigation.navigate("tournament", {
                    id: selectedLeague.league.id.toString(),
                  })
                }
                style={styles.leagueButton}
                labelStyle={{ fontWeight: "600" }}
                compact
              >
                Ver detalles
              </Button>
            </View>

            {loading ? (
              <ActivityIndicator animating color={PRIMARY} />
            ) : (
              teams.map((t) => (
                <Card
                  key={t.teamId}
                  style={{
                    marginBottom: 12,
                    borderLeftColor: PRIMARY,
                    borderLeftWidth: 4,
                  }}
                  onPress={() => actionTeam(t.teamId.toString())}
                >
                  <Card.Title
                    title={t.name}
                    subtitle={t.country}
                    left={(props) => (
                      <Avatar.Image {...props} source={{ uri: t.logo }} />
                    )}
                    right={() => (
                      <Button
                        textColor="white"
                        buttonColor={PRIMARY}
                        onPress={() =>
                          handleSelectTeam(
                            t,
                            selectedLeague.league.id.toString(),
                            season,
                          )
                        }
                      >
                        Ver info
                      </Button>
                    )}
                  />
                </Card>
              ))
            )}
          </>
        )}

        {/* 📊 Info del equipo */}
        {summary && (
          <>
            <Button
              icon="arrow-left"
              mode="outlined"
              textColor={PRIMARY}
              style={{
                borderColor: PRIMARY,
                marginBottom: 10,
              }}
              onPress={() => setSelectedTeam(null)}
            >
              Volver a equipos
            </Button>

            {/* Selector de temporada */}
            <View
              style={{
                borderWidth: 1,
                borderColor: PRIMARY,
                borderRadius: 8,
                marginBottom: 16,
                paddingHorizontal: 8,
              }}
            >
              <Text
                style={{
                  color: PRIMARY,
                  fontWeight: "600",
                  paddingVertical: 8,
                }}
              >
                Temporada
              </Text>

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="text"
                    onPress={() => setMenuVisible(true)}
                    textColor="#000"
                    icon="calendar"
                    contentStyle={{ flexDirection: "row-reverse" }}
                    style={{
                      borderColor: PRIMARY,
                      justifyContent: "space-between",
                    }}
                  >
                    {season}
                  </Button>
                }
              >
                {seasons.map((year) => (
                  <Menu.Item
                    key={year}
                    onPress={() => {
                      setSeason(year);
                      setMenuVisible(false);
                    }}
                    title={`${year}`}
                    titleStyle={{
                      color: year === season ? PRIMARY : "#333",
                      fontWeight: year === season ? "bold" : "normal",
                    }}
                    leadingIcon={year === season ? "check" : undefined}
                  />
                ))}
              </Menu>
            </View>

            <Card
              style={{
                marginBottom: 16,
                borderLeftColor: PRIMARY,
                borderLeftWidth: 4,
              }}
            >
              <Card.Content>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Avatar.Image size={48} source={{ uri: summary.logoUrl }} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="titleMedium" style={{ color: "#000" }}>
                      {summary.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: "#555" }}>
                      Posición #{summary.position} · {summary.points} pts
                    </Text>
                  </View>
                  <Button
                    icon="arrow-right"
                    mode="outlined"
                    textColor={PRIMARY}
                    style={{
                      borderColor: PRIMARY,
                      marginBottom: 10,
                    }}
                    onPress={() =>
                      navigation.navigate("team", {
                        id: summary.teamId.toString(),
                      })
                    }
                  >
                    Ver detalles
                  </Button>
                </View>

                {/* Estadísticas */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>PJ: {summary.played}</Text>
                  <Text>G: {summary.wins}</Text>
                  <Text>E: {summary.draws}</Text>
                  <Text>P: {summary.losses}</Text>
                  <Text>GF: {summary.goalsFor}</Text>
                  <Text>GC: {summary.goalsAgainst}</Text>
                </View>

                {/* Racha */}
                <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                  Últimos partidos:
                </Text>
                <View style={{ flexDirection: "row", marginBottom: 8 }}>
                  {summary.recentForm?.map((r, i) => (
                    <FormChip key={i} result={r} />
                  ))}
                </View>

                {/* Jugador destacado */}
                {summary.topPlayer && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Avatar.Image
                      size={40}
                      source={{ uri: summary.topPlayer.photo }}
                    />
                    <View style={{ marginLeft: 8 }}>
                      <Text>{summary.topPlayer.name}</Text>
                      <Text variant="bodySmall" style={{ color: "#555" }}>
                        {summary.topPlayer.goals} G /{" "}
                        {summary.topPlayer.assists} A
                      </Text>
                    </View>
                    <Chip
                      icon="trending-up"
                      mode="outlined"
                      textStyle={{ color: PRIMARY }}
                      style={{ borderColor: PRIMARY, marginLeft: "auto" }}
                    >
                      Jugador Clave
                    </Chip>
                  </View>
                )}

                {/* Próximo partido */}
                {summary.nextMatch && (
                  <View style={{ marginVertical: 8 }}>
                    <Text>
                      📅 Próximo partido vs {summary.nextMatch.opponent} (
                      {summary.nextMatch.home ? "Local" : "Visita"}) –{" "}
                      {new Date(summary.nextMatch.date).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {/* Progreso */}
                {summary.seasonProgress &&
                  summary.seasonProgress.length > 0 && (
                    <View
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: 8,
                        padding: 10,
                        marginTop: 10,
                        borderWidth: 1,
                        borderColor: PRIMARY,
                      }}
                    >
                      <Text
                        variant="titleSmall"
                        style={{
                          marginBottom: 8,
                          color: PRIMARY,
                          fontWeight: "bold",
                        }}
                      >
                        Progreso de la temporada
                      </Text>
                      {summary.seasonProgress.slice(-10).map((match, index) => (
                        <View
                          key={`${match.matchday}-${index}`}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            borderBottomWidth: 0.5,
                            borderColor: "#ddd",
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ flex: 1 }}>
                            {match.matchday} - {match.opponent}
                          </Text>
                          <Text
                            style={{
                              width: 60,
                              textAlign: "center",
                            }}
                          >
                            {match.score}
                          </Text>
                          <Text
                            style={{
                              width: 30,
                              textAlign: "center",
                              color:
                                match.result === "W"
                                  ? "#2ecc71"
                                  : match.result === "D"
                                    ? "#f39c12"
                                    : "#e74c3c",
                            }}
                          >
                            {match.result}
                          </Text>
                          <Text
                            style={{
                              width: 60,
                              textAlign: "right",
                              color: "#333",
                            }}
                          >
                            {match.points} pts
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
              </Card.Content>
            </Card>
          </>
        )}
        <View style={{ marginVertical: 10, alignItems: "center" }}>
          <AdBanner />
        </View>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 12,
  },

  leagueName: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "700",
  },

  leagueCountry: {
    color: "#666",
    fontSize: 13,
  },

  leagueButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
  },
});
