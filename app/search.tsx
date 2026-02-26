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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

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

  // 🏆 Solo las ligas se cargan automáticamente
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

  // 🔍 Buscar jugador, entrenador o equipo al presionar botón
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

      default:
        break;
    }
  };

  if (loading)
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );

  /* 🔍 Filtros en ligas (solo client-side) */
  const filteredLeagues = leagues.filter((l) =>
    l.league.name.toLowerCase().includes(search.toLowerCase())
  );

  /* 🧱 Grid generator */
  const renderGrid = (
    items: any[],
    renderItem: (item: any) => React.ReactNode
  ) => {
    const rows = [];
    for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
    return (
      <View style={{ marginTop: 16 }}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map(renderItem)}
            {row.length < 2 && <View style={[styles.card, { opacity: 0 }]} />}
          </View>
        ))}
      </View>
    );
  };

  /* 👤 Render: Jugadores */
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

  /* 🧑‍🏫 Render: Entrenadores */
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

  /* 🏆 Render: Ligas */
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

  /* 🏟️ Render: Equipos */
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
        <Text style={styles.title}>🔍 Buscar información</Text>

        {/* 🧩 Tabs */}
        <View style={styles.chipsRow}>
          {[
            { key: "jugadores", label: "Jugadores" },
            { key: "entrenadores", label: "Entrenadores" },
            { key: "ligas", label: "Ligas / Torneos" },
            { key: "equipos", label: "Equipos" },
          ].map((tab) => (
            <Chip
              key={tab.key}
              mode={activeTab === tab.key ? "flat" : "outlined"}
              style={[
                styles.chip,
                activeTab === tab.key && styles.chipSelected,
              ]}
              textStyle={{ color: activeTab === tab.key ? "#FFF" : "#000" }}
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
          ))}
        </View>

        {/* 🔍 Input + botón */}
        <View style={{ flexDirection: "row", gap: 8 }}>
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
            placeholderTextColor="#999"
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

        {/* 🧩 Render dinámico */}
        {error && (
          <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
        )}
        {activeTab === "jugadores" && renderPlayers()}
        {activeTab === "entrenadores" && renderCoaches()}
        {activeTab === "ligas" && renderLeagues()}
        {activeTab === "equipos" && renderTeams()}
      </ScrollView>
    </PrivateLayout>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { borderColor: "#1DB954" },
  chipSelected: { backgroundColor: "#1DB954" },
  search: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#000",
  },
  button: {
    backgroundColor: "#1DB954",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  photo: { width: 70, height: 70, borderRadius: 50, marginBottom: 8 },
  logo: { width: 60, height: 60, marginBottom: 8 },
  name: {
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
    color: "#111",
  },
  subtitle: { fontSize: 12, color: "#555", textAlign: "center" },
  subtext: { fontSize: 11, color: "#777", textAlign: "center" },
  teamRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  teamLogo: { width: 18, height: 18, marginRight: 4 },
});
