// components/OneByOneForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Text,
    TextInput,
} from "react-native-paper";

import { useFetch } from "@/hooks/FetchContext";
import {
    LiveMatch,
    OneByOne,
    PlayerLive,
    PlayerOneByOne,
    PlayerRating,
    SquadOneByOne,
    TeamLineupLive,
} from "@/types";
import PlayerRatingModal from "./PlayerRatingModal";

// Chips para filtrar ligas
const LEAGUE_CHIPS = [
  "LaLiga",
  "Premier League",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Liga Colombiana",
  "Champions League",
  "Europa League",
  "Libertadores",
  "Eliminatorias",
];

function mapLineupToSquad(lineup: TeamLineupLive): SquadOneByOne {
  const convert = (p: PlayerLive): PlayerOneByOne => ({
    playerId: p.id,
    name: p.name,
    number: p.number,
    pos: p.pos,
    photo: p.photo ?? "",
    grid: p.grid ?? null,
    isSub: !!p.isSub,
  });

  return {
    titulares: lineup.startXI.map(convert),
    suplentes: lineup.substitutes.map(convert),
  };
}

type OneByOneFormProps = {
  oneByOneId: string | null;
  oneByOne: OneByOne | null;
  onCancel: () => void;
  onSave: (item: OneByOne) => void;
};

export default function OneByOneForm({
  oneByOneId,
  oneByOne,
  onCancel,
  onSave,
}: OneByOneFormProps) {
  const { getFinishedMatches, saveOneByOne, editOneByOne } = useFetch();

  const isEditing = !!oneByOneId;

  const [fixtures, setFixtures] = useState<LiveMatch[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [fixturesError, setFixturesError] = useState<string | null>(null);

  const [selectedLeagueChip, setSelectedLeagueChip] = useState<string | null>(
    null
  );
  const [fixtureSearch, setFixtureSearch] = useState("");

  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);

  const [localOneByOne, setLocalOneByOne] = useState<OneByOne>(() => {
    if (oneByOne) return oneByOne;

    const now = new Date().toISOString();
    return {
      id: "",
      fixtureId: 0,
      result: { home: 0, away: 0 },
      teams: {
        home: {
          teamId: 0,
          name: "",
          logo: "",
          winner: false,
          players: { titulares: [], suplentes: [] },
        },
        away: {
          teamId: 0,
          name: "",
          logo: "",
          winner: false,
          players: { titulares: [], suplentes: [] },
        },
      },
      createdAt: now,
      updatedAt: now,
      playerRatings: [],
    };
  });

  const [playerRatings, setPlayerRatings] = useState<PlayerRating[]>(
    () => localOneByOne.playerRatings ?? []
  );

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedPlayerForRating, setSelectedPlayerForRating] = useState<{
    playerId: number;
    name: string;
    photo: string;
    teamId: number;
  } | null>(null);

  useEffect(() => {
    if (isEditing) {
      setLoadingFixtures(false);
      return;
    }

    let isMounted = true;

    const loadFixtures = async () => {
      setLoadingFixtures(true);
      try {
        const { success, message, fixtures } = await getFinishedMatches();

        if (!isMounted) return;

        if (!success) {
          setFixturesError(message || "Error cargando fixtures");
          return;
        }

        setFixtures(fixtures);
      } catch (err) {
        if (isMounted) {
          setFixturesError("Error cargando fixtures");
        }
      } finally {
        if (isMounted) {
          setLoadingFixtures(false);
        }
      }
    };

    loadFixtures();
    return () => {
      isMounted = false;
    };
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && oneByOne && fixtures.length > 0) {
      const found = fixtures.find((f) => f.fixtureId === oneByOne.fixtureId);
      if (found) setSelectedMatch(found);
    }
  }, [fixtures, isEditing, oneByOne]);

  const openRatingModalForPlayer = (player: PlayerOneByOne, teamId: number) => {
    setSelectedPlayerForRating({
      playerId: player.playerId,
      name: player.name,
      photo: player.photo,
      teamId,
    });
    setRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedPlayerForRating(null);
  };

  const handleSavePlayerRating = (rating: PlayerRating) => {
    setPlayerRatings((prev) => {
      const i = prev.findIndex(
        (r) => r.playerId === rating.playerId && r.teamId === rating.teamId
      );

      if (i >= 0) {
        const clone = [...prev];
        clone[i] = rating;
        return clone;
      }

      return [...prev, rating];
    });

    closeRatingModal();
  };

  const getRatingForPlayer = (playerId: number, teamId: number) =>
    playerRatings.find((r) => r.playerId === playerId && r.teamId === teamId);

  const filteredFixtures = useMemo(() => {
    let list = fixtures;

    if (selectedLeagueChip) {
      const key = selectedLeagueChip.toLowerCase();
      list = list.filter((m) => m.league.name.toLowerCase().includes(key));
    }

    if (fixtureSearch.trim()) {
      const s = fixtureSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.teams.home.name.toLowerCase().includes(s) ||
          m.teams.away.name.toLowerCase().includes(s)
      );
    }

    return list;
  }, [selectedLeagueChip, fixtureSearch, fixtures]);

  const handleSelectFixture = (match: LiveMatch) => {
    setSelectedMatch(match);

    const now = new Date().toISOString();

    const homeLineup = match.lineups.find(
      (l) => l.team.id === match.teams.home.id
    );

    const awayLineup = match.lineups.find(
      (l) => l.team.id === match.teams.away.id
    );

    const homeSquad = homeLineup
      ? mapLineupToSquad(homeLineup)
      : { titulares: [], suplentes: [] };

    const awaySquad = awayLineup
      ? mapLineupToSquad(awayLineup)
      : { titulares: [], suplentes: [] };

    setLocalOneByOne((prev) => ({
      ...prev,
      fixtureId: match.fixtureId,
      result: {
        home: match.goals.home,
        away: match.goals.away,
      },
      teams: {
        home: {
          teamId: match.teams.home.id,
          name: match.teams.home.name,
          logo: match.teams.home.logo,
          winner: match.goals.home > match.goals.away,
          players: homeSquad,
        },
        away: {
          teamId: match.teams.away.id,
          name: match.teams.away.name,
          logo: match.teams.away.logo,
          winner: match.goals.away > match.goals.home,
          players: awaySquad,
        },
      },
      updatedAt: now,
    }));
  };

  const handleSave = async () => {
    if (!localOneByOne.fixtureId) return;

    const now = new Date().toISOString();

    const item: OneByOne = {
      ...localOneByOne,
      updatedAt: now,
      playerRatings,
    };

    try {
      if (isEditing && oneByOne) {
        const { success, oneByOneItem, message } = await editOneByOne(
          oneByOneId,
          item
        );
        if (!success) {
          alert(message || "Error guardando uno por uno");
          return;
        }
        onSave(oneByOneItem!);
      } else {
        const { success, oneByOneItem, message } = await saveOneByOne(item);
        if (!success) {
          alert(message || "Error guardando uno por uno");
          return;
        }
        onSave(oneByOneItem!);
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  };

  const renderFixtureItem = ({ item }: { item: LiveMatch }) => (
    <TouchableOpacity onPress={() => handleSelectFixture(item)}>
      <Card style={styles.fixtureCard}>
        <Card.Content>
          <View style={styles.fixtureRow}>
            <View style={styles.fixtureTeamCol}>
              <Image
                source={{ uri: item.teams.home.logo }}
                style={styles.fixtureLogo}
              />
              <Text numberOfLines={1}>{item.teams.home.name}</Text>
            </View>

            <View style={styles.fixtureCenterCol}>
              <Text variant="titleMedium" style={styles.fixtureScore}>
                {item.goals.home} - {item.goals.away}
              </Text>
              <Text style={styles.vsLabel}>VS</Text>
            </View>

            <View style={styles.fixtureTeamCol}>
              <Image
                source={{ uri: item.teams.away.logo }}
                style={styles.fixtureLogo}
              />
              <Text numberOfLines={1}>{item.teams.away.name}</Text>
            </View>
          </View>

          <Text style={styles.fixtureSubtitle}>
            {item.league.name} ·{" "}
            {new Date(item.fixture.date).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderPlayerColumn = (
    players: PlayerOneByOne[],
    teamName: string,
    teamId: number
  ) => (
    <View style={styles.playersColumn}>
      <Text style={styles.playersColumnTitle}>{teamName}</Text>

      {players.map((p) => {
        const rating = getRatingForPlayer(p.playerId, teamId);

        return (
          <Card
            key={`${teamId}_${p.playerId}`}
            style={styles.playerCard}
            onPress={() => openRatingModalForPlayer(p, teamId)}
          >
            <Card.Content>
              <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Image source={{ uri: p.photo }} style={styles.playerPhoto} />
                  <View style={styles.playerTextContainer}>
                    <Text style={styles.playerName}>{p.name}</Text>
                    <Text style={styles.playerSub}>{teamName}</Text>
                  </View>
                </View>

                {rating && (
                  <Chip compact icon="star">
                    {rating.rating.toFixed(1)}
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );

  const needsFixture = !isEditing && !localOneByOne.fixtureId;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? "Editar uno por uno" : "Crear uno por uno"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isEditing
            ? "Actualiza las calificaciones de cada jugador."
            : "Selecciona un partido para comenzar y calificar jugador por jugador."}
        </Text>
      </View>

      {/* MODO CREAR → SELECCIONAR FIXTURE */}
      {needsFixture ? (
        <View style={styles.fixtureSelectContainer}>
          {loadingFixtures && (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" />
          )}

          {fixturesError && (
            <Text style={{ color: "red", marginVertical: 20 }}>
              {fixturesError}
            </Text>
          )}

          {!loadingFixtures && fixtures.length === 0 && (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              No hay partidos finalizados disponibles.
            </Text>
          )}

          {!loadingFixtures && fixtures.length > 0 && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {LEAGUE_CHIPS.map((chip) => (
                  <Chip
                    key={chip}
                    style={styles.chip}
                    selected={selectedLeagueChip === chip}
                    mode={selectedLeagueChip === chip ? "flat" : "outlined"}
                    onPress={() =>
                      setSelectedLeagueChip((prev) =>
                        prev === chip ? null : chip
                      )
                    }
                  >
                    {chip}
                  </Chip>
                ))}
              </ScrollView>

              <TextInput
                mode="outlined"
                placeholder="Buscar fixture…"
                value={fixtureSearch}
                onChangeText={setFixtureSearch}
                left={<TextInput.Icon icon="magnify" />}
                style={styles.fixtureSearchInput}
              />

              <FlatList
                data={filteredFixtures}
                keyExtractor={(i) => String(i.fixtureId)}
                renderItem={renderFixtureItem}
                contentContainerStyle={styles.fixtureListContent}
              />
            </>
          )}
        </View>
      ) : (
        // MODO EDITAR O PARTIDO SELECCIONADO
        <ScrollView
          style={styles.selectedFixtureContainer}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          {selectedMatch && (
            <Card style={styles.selectedFixtureCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Partido seleccionado</Text>

                <View style={styles.teamsRow}>
                  <View style={styles.teamContainer}>
                    <Image
                      style={styles.teamLogo}
                      source={{ uri: selectedMatch.teams.home.logo }}
                    />
                    <Text style={styles.teamName}>
                      {selectedMatch.teams.home.name}
                    </Text>
                  </View>

                  <View style={styles.vsContainer}>
                    <Text style={styles.vsText}>VS</Text>
                    <Text style={styles.scoreText}>
                      {selectedMatch.goals.home} - {selectedMatch.goals.away}
                    </Text>
                  </View>

                  <View style={styles.teamContainer}>
                    <Image
                      style={styles.teamLogo}
                      source={{ uri: selectedMatch.teams.away.logo }}
                    />
                    <Text style={styles.teamName}>
                      {selectedMatch.teams.away.name}
                    </Text>
                  </View>
                </View>

                <Text style={styles.fixtureMeta}>
                  {selectedMatch.league.name} ·{" "}
                  {new Date(selectedMatch.fixture.date).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* TITULARES */}
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Titulares</Text>
            <View style={styles.playersRow}>
              {renderPlayerColumn(
                localOneByOne.teams.home.players.titulares,
                localOneByOne.teams.home.name,
                localOneByOne.teams.home.teamId
              )}

              {renderPlayerColumn(
                localOneByOne.teams.away.players.titulares,
                localOneByOne.teams.away.name,
                localOneByOne.teams.away.teamId
              )}
            </View>
          </View>

          {/* SUPLENTES */}
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Suplentes</Text>
            <View style={styles.playersRow}>
              {renderPlayerColumn(
                localOneByOne.teams.home.players.suplentes,
                localOneByOne.teams.home.name,
                localOneByOne.teams.home.teamId
              )}

              {renderPlayerColumn(
                localOneByOne.teams.away.players.suplentes,
                localOneByOne.teams.away.name,
                localOneByOne.teams.away.teamId
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <Button mode="outlined" onPress={onCancel}>
          Cancelar
        </Button>

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!localOneByOne.fixtureId}
        >
          Guardar uno por uno
        </Button>
      </View>

      {/* MODAL */}
      {selectedPlayerForRating && (
        <PlayerRatingModal
          visible={ratingModalVisible}
          onClose={closeRatingModal}
          player={selectedPlayerForRating}
          existingRating={getRatingForPlayer(
            selectedPlayerForRating.playerId,
            selectedPlayerForRating.teamId
          )}
          onSave={handleSavePlayerRating}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { padding: 16 },
  headerTitle: { fontWeight: "700", fontSize: 22 },
  headerSubtitle: { opacity: 0.7, marginTop: 4 },

  fixtureSelectContainer: { paddingHorizontal: 16, paddingBottom: 80 },

  chipsScroll: { marginBottom: 8 },
  chip: { marginRight: 8 },

  fixtureSearchInput: { marginBottom: 8 },

  fixtureListContent: { paddingBottom: 80 },

  fixtureCard: { marginBottom: 8 },

  fixtureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fixtureTeamCol: { flex: 1, alignItems: "center" },
  fixtureCenterCol: { width: 70, alignItems: "center" },
  fixtureLogo: { width: 36, height: 36, marginBottom: 4 },
  fixtureScore: { fontWeight: "700" },
  fixtureSubtitle: { marginTop: 4, opacity: 0.7 },
  vsLabel: { opacity: 0.7 },

  selectedFixtureContainer: { paddingHorizontal: 16 },

  selectedFixtureCard: { marginBottom: 16 },

  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  teamContainer: { flex: 1, alignItems: "center" },
  teamLogo: { width: 52, height: 52, marginBottom: 4 },
  teamName: { textAlign: "center", fontSize: 14 },

  vsContainer: { width: 80, alignItems: "center" },
  vsText: { fontWeight: "700", fontSize: 18 },
  scoreText: { fontWeight: "700", fontSize: 18 },

  fixtureMeta: { opacity: 0.6 },

  playersSection: { marginBottom: 16 },
  sectionTitle: { fontWeight: "700", marginBottom: 8 },

  playersRow: { flexDirection: "row", gap: 12 },

  playersColumn: { flex: 1 },
  playersColumnTitle: { marginBottom: 6, opacity: 0.7 },

  playerCard: { marginBottom: 6 },

  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  playerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },

  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },

  playerTextContainer: { flexShrink: 1 },
  playerName: { fontWeight: "600" },
  playerSub: { opacity: 0.7 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },
});
