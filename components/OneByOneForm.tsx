// components/OneByOneForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Chip, Text, TextInput } from "react-native-paper";

import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import {
  LeagueItem,
  Lineup,
  LiveMatch,
  OneByOneType,
  PlayerLive,
  PlayerOneByOne,
  PlayerRating,
  Section,
  SquadOneByOne,
  TeamLineup,
  TeamLineupLive,
} from "@/types";
import PlayerRatingModal from "./PlayerRatingModal";

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
  oneByOne: OneByOneType | null;
  leagues: LeagueItem[];
  sections: Section[];
  existingOneByOnes: OneByOneType[];
  onCancel: () => void;
  onSave: (item: OneByOneType) => void;
};

export default function OneByOneForm({
  oneByOneId,
  oneByOne,
  leagues,
  sections,
  existingOneByOnes,
  onCancel,
  onSave,
}: OneByOneFormProps) {
  const { saveOneByOne, editOneByOne, getLineUp } = useFetch();

  const isEditing = !!oneByOneId;

  const [selectedLeagueChip, setSelectedLeagueChip] = useState<string | null>(
    null,
  );
  const [fixtureSearch, setFixtureSearch] = useState("");

  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);

  const [localOneByOne, setLocalOneByOne] = useState<OneByOneType>(() => {
    if (oneByOne) return oneByOne;

    const now = new Date().toISOString();
    return {
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
    () => localOneByOne.playerRatings ?? [],
  );

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedPlayerForRating, setSelectedPlayerForRating] = useState<{
    playerId: number;
    name: string;
    photo: string;
    teamId: number;
  } | null>(null);

  const { finishedFixtures, upcomingFixtures } = useMemo(() => {
    const all = sections.flatMap((s) => s.data);

    return {
      finishedFixtures: all.filter((m) => m.fixture.status.short === "FT"),
      upcomingFixtures: all.filter((m) =>
        ["NS", "TBD"].includes(m.fixture.status.short),
      ),
    };
  }, [sections]);

  const fixturesToShow =
    finishedFixtures.length > 0 ? finishedFixtures : upcomingFixtures;

  const showingUpcoming = finishedFixtures.length === 0;

  useEffect(() => {
    if (isEditing && oneByOne && fixturesToShow.length > 0) {
      const found = fixturesToShow.find(
        (f) => f.fixtureId === oneByOne.fixtureId,
      );
      if (found) setSelectedMatch(found);
    }
  }, [fixturesToShow, isEditing, oneByOne]);

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
        (r) => r.playerId === rating.playerId && r.teamId === rating.teamId,
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

  const usedFixtureIds = useMemo(() => {
    return new Set(existingOneByOnes.map((o) => o.fixtureId));
  }, [existingOneByOnes]);

  const filteredFixtures = useMemo(() => {
    let list = fixturesToShow;

    if (selectedLeagueChip) {
      const key = selectedLeagueChip.toLowerCase();
      list = list.filter((m) => m.league.name.toLowerCase().includes(key));
    }

    if (fixtureSearch.trim()) {
      const s = fixtureSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.teams.home.name.toLowerCase().includes(s) ||
          m.teams.away.name.toLowerCase().includes(s),
      );
    }

    // 🔥 FILTRO CLAVE
    if (!isEditing) {
      list = list.filter((m) => !usedFixtureIds.has(m.fixtureId));
    }

    return list;
  }, [
    selectedLeagueChip,
    fixtureSearch,
    fixturesToShow,
    usedFixtureIds,
    isEditing,
  ]);

  const normalizeTeamLineups = (
    lineup?: Lineup | { lineups: TeamLineup[] } | null,
  ): TeamLineup[] => {
    if (!lineup) return [];
    if (Array.isArray((lineup as any).lineups)) {
      return (lineup as any).lineups;
    }
    if (Array.isArray(lineup)) return lineup as TeamLineup[];
    return [];
  };

  const handleSelectFixture = async (match: LiveMatch) => {
    setSelectedMatch(match);

    let homeLineup: TeamLineup | undefined;
    let awayLineup: TeamLineup | undefined;

    try {
      const response = await getLineUp(match.fixtureId.toString());

      if (!response?.success) {
        console.warn("No se pudieron cargar alineaciones", response?.message);
        return;
      }

      const lineups: TeamLineup[] = normalizeTeamLineups(response.lineup);

      homeLineup = lineups.find((l) => l.team.id === match.teams.home.id);

      awayLineup = lineups.find((l) => l.team.id === match.teams.away.id);
    } catch (error) {
      console.error("Error cargando alineaciones", error);
    }

    const now = new Date().toISOString();
    const isFinished = match.fixture.status.short === "FT";

    setLocalOneByOne((prev) => ({
      ...prev,
      fixtureId: match.fixtureId,
      result: isFinished
        ? { home: match.goals.home, away: match.goals.away }
        : { home: 0, away: 0 },
      teams: {
        home: {
          teamId: match.teams.home.id,
          name: match.teams.home.name,
          logo: match.teams.home.logo,
          winner: false,
          players: homeLineup
            ? mapLineupToSquad(homeLineup)
            : { titulares: [], suplentes: [] },
        },
        away: {
          teamId: match.teams.away.id,
          name: match.teams.away.name,
          logo: match.teams.away.logo,
          winner: false,
          players: awayLineup
            ? mapLineupToSquad(awayLineup)
            : { titulares: [], suplentes: [] },
        },
      },
      updatedAt: now,
    }));
  };

  const handleSave = async () => {
    if (!localOneByOne.fixtureId) return;

    const now = new Date().toISOString();

    const item: OneByOneType = {
      ...localOneByOne,
      updatedAt: now,
      playerRatings,
    };

    try {
      if (isEditing && oneByOne) {
        const { success, oneByOneItem, message } = await editOneByOne(
          oneByOneId,
          item,
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
    teamId: number,
  ) => (
    <View style={styles.playersColumn}>
      <Text style={styles.playersColumnTitle}>{teamName}</Text>

      {players.map((p, index) => {
        const rating = getRatingForPlayer(p.playerId, teamId);

        return (
          <Card
            key={index}
            style={[styles.playerCard, rating && styles.playerCardRated]}
            disabled={selectedMatch?.fixture.status.short !== "FT"}
            onPress={() => {
              if (selectedMatch?.fixture.status.short === "FT") {
                openRatingModalForPlayer(p, teamId);
              }
            }}
          >
            <View style={styles.playerCardInner}>
              {/* Badge rating */}
              {rating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    {rating.rating.toFixed(1)}
                  </Text>
                </View>
              )}

              <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Image source={{ uri: p.photo }} style={styles.playerPhoto} />
                  <View style={styles.playerTextContainer}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.playerSub} numberOfLines={1}>
                      {teamName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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

      {showingUpcoming && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>⚠️ No hay partidos finalizados</Text>
            <Text style={styles.infoText}>
              Puedes preparar el uno por uno con los próximos partidos. Las
              calificaciones se podrán completar cuando finalice el encuentro.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* MODO CREAR → SELECCIONAR FIXTURE */}
      {needsFixture ? (
        <View style={styles.fixtureSelectContainer}>
          {fixturesToShow.length > 0 && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {leagues.map((league) => (
                  <Chip
                    key={league.id}
                    style={styles.chip}
                    selected={
                      selectedLeagueChip?.toString() === league.id.toString()
                    }
                    mode={
                      selectedLeagueChip?.toString() === league.id.toString()
                        ? "flat"
                        : "outlined"
                    }
                    onPress={() =>
                      setSelectedLeagueChip((prev) =>
                        prev?.toString() === league.id.toString()
                          ? null
                          : league.id.toString(),
                      )
                    }
                  >
                    {league.name}
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

              <ScrollView
                contentContainerStyle={styles.fixtureListContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredFixtures.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No hay partidos disponibles
                  </Text>
                ) : (
                  filteredFixtures.map((item) => (
                    <View key={item.fixtureId} style={styles.fixtureItem}>
                      {renderFixtureItem({ item })}
                    </View>
                  ))
                )}
              </ScrollView>
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
                localOneByOne.teams.home.teamId,
              )}

              {renderPlayerColumn(
                localOneByOne.teams.away.players.titulares,
                localOneByOne.teams.away.name,
                localOneByOne.teams.away.teamId,
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
                localOneByOne.teams.home.teamId,
              )}

              {renderPlayerColumn(
                localOneByOne.teams.away.players.suplentes,
                localOneByOne.teams.away.name,
                localOneByOne.teams.away.teamId,
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
            selectedPlayerForRating.teamId,
          )}
          onSave={handleSavePlayerRating}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { padding: spacing.md },

  headerTitle: {
    ...typography.titleLarge,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  headerSubtitle: {
    ...typography.body,
    opacity: 0.7,
    marginTop: spacing.xs ?? 4,
    color: colors.textSecondary,
  },

  fixtureSelectContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl ?? 80,
  },

  chipsScroll: { marginBottom: spacing.xs ?? 8 },

  chip: { marginRight: spacing.xs },

  fixtureSearchInput: { marginBottom: spacing.xs ?? 8 },

  fixtureListContent: { paddingBottom: spacing.xl ?? 80 },

  fixtureCard: { marginBottom: spacing.xs ?? 8 },

  fixtureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fixtureTeamCol: { flex: 1, alignItems: "center" },

  fixtureCenterCol: { width: 70, alignItems: "center" },

  fixtureLogo: { width: 36, height: 36, marginBottom: spacing.xs ?? 4 },

  fixtureScore: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  fixtureSubtitle: {
    ...typography.small,
    marginTop: spacing.xs ?? 4,
    opacity: 0.7,
    color: colors.textSecondary,
  },

  vsLabel: {
    ...typography.small,
    opacity: 0.7,
    color: colors.textSecondary,
  },

  selectedFixtureContainer: {
    paddingHorizontal: spacing.md,
  },

  selectedFixtureCard: {
    marginBottom: spacing.md,
  },

  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.sm,
  },

  teamContainer: { flex: 1, alignItems: "center" },

  teamLogo: {
    width: 52,
    height: 52,
    marginBottom: spacing.xs ?? 4,
  },

  teamName: {
    textAlign: "center",
    ...typography.small,
    color: colors.textPrimary,
  },

  vsContainer: { width: 80, alignItems: "center" },

  vsText: {
    ...typography.title,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  scoreText: {
    ...typography.title,
    fontWeight: "700",
    color: colors.primary,
  },

  fixtureMeta: {
    ...typography.small,
    opacity: 0.6,
    color: colors.textSecondary,
  },

  playersSection: {
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: spacing.xs ?? 8,
    color: colors.textPrimary,
  },

  playersRow: {
    flexDirection: "row",
    gap: spacing.sm ?? 12,
  },

  playersColumn: { flex: 1 },

  playersColumnTitle: {
    marginBottom: spacing.xs ?? 6,
    opacity: 0.7,
    ...typography.small,
    color: colors.textSecondary,
  },

  playerCard: {
    marginBottom: spacing.xs ?? 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    elevation: 1,
  },

  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    marginRight: spacing.xs,
  },

  playerTextContainer: { flexShrink: 1 },

  playerName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  playerSub: {
    ...typography.small,
    opacity: 0.7,
    color: colors.textSecondary,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  infoCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.warning ?? "rgba(255,193,7,0.15)",
  },

  infoTitle: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: spacing.xs ?? 4,
    color: colors.textPrimary,
  },

  infoText: {
    ...typography.small,
    opacity: 0.8,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  pendingText: {
    marginTop: spacing.xs ?? 6,
    ...typography.small,
    opacity: 0.6,
    fontStyle: "italic",
    color: colors.textSecondary,
  },

  fixtureItem: {
    marginBottom: spacing.xs ?? 8,
  },

  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: spacing.lg ?? 24,
    ...typography.body,
    color: colors.textSecondary,
  },

  playerCardRated: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primary ?? "rgba(29,185,84,0.08)",
  },

  playerCardInner: {
    padding: spacing.sm ?? 10,
  },

  ratingBadge: {
    position: "absolute",
    top: spacing.xs ?? 6,
    right: spacing.xs ?? 6,
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.xs ?? 6,
    paddingVertical: 2,
    zIndex: 2,
  },

  ratingText: {
    ...typography.small,
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
});
