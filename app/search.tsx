import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import type {
  Coach,
  LeagueB,
  PlayerB,
  RootStackParamList,
  Team,
} from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { typography } from "@/theme/typography";

export default function Search() {
  const { searchPlayers, searchCoaches, searchTeams, getLeagues } = useFetch();

  const [activeTab, setActiveTab] = useState<
    "jugadores" | "entrenadores" | "ligas" | "equipos"
  >("jugadores");

  const [leagues, setLeagues] = useState<LeagueB[]>([]);
  const [players, setPlayers] = useState<PlayerB[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (activeTab === "ligas" && leagues.length === 0) {
      loadLeagues();
    }
  }, [activeTab]);

  const loadLeagues = async () => {
    setLoading(true);

    try {
      const { success, leagues, message } = await getLeagues();
      if (success) setLeagues(leagues!);
      else setError(message!);
    } catch {
      setError("Error al cargar ligas");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (activeTab === "jugadores") {
        const { success, players, message } = await searchPlayers(search);
        if (success) setPlayers(players!);
        else setError(message!);
      } else if (activeTab === "entrenadores") {
        const { success, coaches, message } = await searchCoaches(search);
        if (success) setCoaches(coaches!);
        else setError(message!);
      } else if (activeTab === "equipos") {
        const { success, teams, message } = await searchTeams(search);
        if (success) setTeams(teams!);
        else setError(message!);
      }
    } catch {
      setError("Error al realizar la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (type: string, id: string) => {
    switch (type) {
      case "player":
        navigation.navigate("player", { id });
        break;
      case "coach":
        navigation.navigate("coach", { id });
        break;
      case "team":
        navigation.navigate("team", { id });
        break;
      case "tournament":
        navigation.navigate("tournament", { id });
        break;
    }
  };

  if (loading) return <Loading visible={loading} />;

  const filteredLeagues = leagues.filter((l) =>
    l.league.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderGrid = (
    items: any[],
    renderItem: (item: any) => React.ReactNode,
  ) => {
    const rows = [];
    for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

    return (
      <View style={{ marginTop: spacing.md }}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map(renderItem)}
            {row.length < 2 && <View style={[styles.card, { opacity: 0 }]} />}
          </View>
        ))}
      </View>
    );
  };

  const renderPlayers = () =>
    renderGrid(players, (p) => (
      <Card
        key={p.playerId}
        style={styles.card}
        onPress={() => handleNavigation("player", p.playerId)}
      >
        <Image source={{ uri: p.photo }} style={styles.photo} />
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.subtitle}>{p.nationality}</Text>
        <Text style={styles.subtext}>{p.age} años</Text>
      </Card>
    ));

  const renderCoaches = () =>
    renderGrid(coaches, (c) => (
      <Card
        key={c.coachId}
        style={styles.card}
        onPress={() => handleNavigation("coach", c.coachId)}
      >
        <Image source={{ uri: c.photo }} style={styles.photo} />
        <Text style={styles.name}>{c.name}</Text>
        <Text style={styles.subtitle}>{c.nationality}</Text>

        {c.team && (
          <View style={styles.teamRow}>
            <Image source={{ uri: c.team.logo }} style={styles.teamLogo} />
            <Text style={styles.subtext}>{c.team.name}</Text>
          </View>
        )}
      </Card>
    ));

  const renderLeagues = () =>
    renderGrid(filteredLeagues, (l) => (
      <Card
        key={l.league.id}
        style={styles.card}
        onPress={() => handleNavigation("tournament", l.league.id)}
      >
        <Image source={{ uri: l.league.logo }} style={styles.logo} />
        <Text style={styles.name}>{l.league.name}</Text>
        <Text style={styles.subtitle}>{l.country.name}</Text>
      </Card>
    ));

  const renderTeams = () =>
    renderGrid(teams, (t) => (
      <Card
        key={t.teamId}
        style={styles.card}
        onPress={() => handleNavigation("team", t.teamId)}
      >
        <Image source={{ uri: t.logo }} style={styles.logo} />
        <Text style={styles.name}>{t.name}</Text>
        <Text style={styles.subtitle}>{t.country}</Text>
      </Card>
    ));

  return (
    <PrivateLayout>
      <ScrollView style={styles.container}>
        <Text style={g.titleLarge}>🔍 Buscar información</Text>

        {/* Tabs */}
        <View style={styles.chipsRow}>
          {[
            { key: "jugadores", label: "Jugadores" },
            { key: "entrenadores", label: "Entrenadores" },
            { key: "ligas", label: "Ligas / Torneos" },
            { key: "equipos", label: "Equipos" },
          ].map((tab) => {
            const selected = activeTab === tab.key;

            return (
              <Chip
                key={tab.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : colors.border,
                  },
                ]}
                textStyle={{
                  color: selected ? colors.textOnPrimary : colors.textPrimary,
                  fontFamily: typography.subtitle.fontFamily,
                }}
                onPress={() => {
                  setActiveTab(tab.key as typeof activeTab);
                  setSearch("");
                  setPlayers([]);
                  setCoaches([]);
                  setTeams([]);
                }}
              >
                {tab.label}
              </Chip>
            );
          })}
        </View>

        {/* Search */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <TextInput
            placeholder={
              activeTab === "jugadores"
                ? "Buscar jugador..."
                : activeTab === "entrenadores"
                  ? "Buscar entrenador..."
                  : activeTab === "ligas"
                    ? "Buscar liga o torneo..."
                    : "Buscar equipo..."
            }
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[styles.search, { flex: 1 }]}
          />

          {activeTab !== "ligas" && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text style={{ color: colors.error, marginVertical: spacing.sm }}>
            {error}
          </Text>
        )}

        {activeTab === "jugadores" && renderPlayers()}
        {activeTab === "entrenadores" && renderCoaches()}
        {activeTab === "ligas" && renderLeagues()}
        {activeTab === "equipos" && renderTeams()}
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  chip: {
    borderRadius: radius.round,
  },

  search: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.textPrimary,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },

  buttonText: {
    ...typography.button,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  card: {
    flex: 1,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },

  photo: {
    width: 70,
    height: 70,
    borderRadius: radius.round,
    marginBottom: spacing.xs,
  },

  logo: {
    width: 60,
    height: 60,
    marginBottom: spacing.xs,
  },

  name: {
    ...typography.subtitle,
    textAlign: "center",
  },

  subtitle: {
    ...typography.small,
    textAlign: "center",
  },

  subtext: {
    ...typography.small,
    textAlign: "center",
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  teamLogo: {
    width: 18,
    height: 18,
    marginRight: spacing.xs,
  },
});
