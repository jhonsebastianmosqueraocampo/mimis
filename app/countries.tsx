import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import {
  Country,
  LiveMatch,
  NationalLeague,
  RootStackParamList,
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
import { Card, Chip, Divider } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function Countries() {
  const {
    getCountries,
    getLeaguesCountry,
    getNationalTournaments,
    getNationalMatchesToday,
  } = useFetch();
  const [activeTab, setActiveTab] = useState<"paises" | "torneos" | "vivo">(
    "paises",
  );
  const [search, setSearch] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [tournaments, setTournaments] = useState<NationalLeague[]>([]);
  const [allMatches, setAllMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let mounted = true;
    const loadCountries = async () => {
      setLoading(true);
      try {
        const { success, data, message } = await getCountries();
        if (!mounted) return;
        if (success) {
          setCountries(data);
          setSelectedCountry(data[0].name);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    const loadLeaguesCountry = async () => {
      setLoading(true);
      try {
        const { success, leaguesCountry, message } = await getLeaguesCountry(
          selectedCountry!,
        );
        if (!mounted) return;
        if (success) {
          setTournaments(leaguesCountry);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    const loadTournaments = async () => {
      setLoading(true);
      try {
        const { success, leaguesCountry, message } =
          await getNationalTournaments();
        if (!mounted) return;
        if (success) {
          setTournaments(leaguesCountry);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    const loadLiveMatches = async () => {
      setLoading(true);
      try {
        const { success, matches, message } = await getNationalMatchesToday();
        if (!mounted) return;
        if (success) {
          setAllMatches(matches);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    if (activeTab === "paises" && !selectedCountry && countries.length === 0) {
      loadCountries();
    }
    if (activeTab === "paises" && selectedCountry) {
      setTournaments([]);
      loadLeaguesCountry();
    }
    if (activeTab === "torneos") {
      setTournaments([]);
      loadTournaments();
    }
    if (activeTab === "vivo") {
      loadLiveMatches();
    }

    return () => {
      mounted = false;
    };
  }, [activeTab, selectedCountry]);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando paises"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const filteredCountries =
    countries.length > 0
      ? countries.filter((c) =>
          (c?.name ?? "").toLowerCase().includes(search.toLowerCase()),
        )
      : [];
  const filteredTournaments =
    tournaments.length > 0
      ? tournaments.filter((t) =>
          (t?.name ?? "").toLowerCase().includes(search.toLowerCase()),
        )
      : [];
  const filteredLive =
    allMatches?.filter((m) =>
      `${m?.teams?.home?.name ?? ""} ${m?.teams?.away?.name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) ?? [];

  const handleTournament = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  const handleMatch = (id: string) => {
    navigation.navigate("match", { id });
  };

  /** 🌍 Países + torneos del país */
  const renderCountries = () => {
    const firstRow =
      filteredCountries && filteredCountries.filter((_, i) => i % 2 === 0);
    const secondRow =
      filteredCountries && filteredCountries.filter((_, i) => i % 2 !== 0);

    // Generador de grid 2 columnas
    const renderTournamentGrid = (tournaments: NationalLeague[]) => {
      const rows = [];
      for (let i = 0; i < tournaments.length; i += 2) {
        rows.push(tournaments.slice(i, i + 2));
      }
      return (
        <View style={{ marginTop: 16 }}>
          {rows.map((row, index) => (
            <View key={index} style={styles.tournamentRow}>
              {row.map((item, index) => (
                <Card
                  key={index}
                  style={styles.tournamentGridCard}
                  onPress={() => handleTournament(item.leagueId.toString())}
                >
                  <Image
                    source={{ uri: item.logo }}
                    style={styles.tournamentGridLogo}
                  />
                  <Text style={styles.tournamentGridName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.tournamentGridConf}>
                    {item.country?.name || "—"}
                  </Text>
                </Card>
              ))}
              {row.length < 2 && (
                <View style={[styles.tournamentGridCard, { opacity: 0 }]} />
              )}
            </View>
          ))}
        </View>
      );
    };

    return (
      <>
        <TextInput
          placeholder="Buscar país..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.countryRows}>
            {[firstRow, secondRow].map((row, i) => (
              <View key={i} style={styles.countryRow}>
                {row &&
                  row.map((country) => {
                    const isSelected = selectedCountry === country.name;
                    return (
                      <TouchableOpacity
                        key={country.name}
                        style={[
                          styles.countryCard,
                          isSelected && styles.countryCardSelected,
                        ]}
                        onPress={() => setSelectedCountry(country.name)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.countryName,
                            isSelected && { color: "#1DB954" },
                          ]}
                          numberOfLines={1}
                        >
                          {country.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ))}
          </View>
        </ScrollView>

        {selectedCountry && (
          <>
            <Text style={styles.subtitle}>Torneos de {selectedCountry}</Text>
            {renderTournamentGrid(tournaments)}
          </>
        )}
      </>
    );
  };

  const renderTournaments = () => {
    const rows = [];
    for (let i = 0; i < filteredTournaments.length; i += 2) {
      rows.push(filteredTournaments.slice(i, i + 2));
    }
    return (
      <>
        <TextInput
          placeholder="Buscar torneo..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {rows.map((row, index) => (
            <View key={index} style={styles.tournamentRow}>
              {row.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tournamentGridCard}
                  onPress={() => handleTournament(item.leagueId.toString())}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.logo }}
                    style={styles.tournamentGridLogo}
                  />
                  <Text style={styles.tournamentGridName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.tournamentGridConf}>
                    {item.country?.name || "—"}
                  </Text>
                </TouchableOpacity>
              ))}
              {row.length < 2 && (
                <View style={[styles.tournamentGridCard, { opacity: 0 }]} />
              )}
            </View>
          ))}
        </ScrollView>
      </>
    );
  };

  /** ⚽ Partidos en vivo */
  const renderLiveMatches = () => (
    <>
      <TextInput
        placeholder="Buscar selección..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {filteredLive.length === 0 ? (
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesText}>
            ⚽ No hay partidos de selecciones nacionales en vivo ni programados
            para hoy.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {filteredLive.map((m) => (
            <Card
              key={m.fixtureId}
              style={styles.liveCard}
              onPress={() => handleMatch(m.fixtureId.toString())}
            >
              <View style={styles.liveHeader}>
                <Image
                  source={{ uri: m.league.logo }}
                  style={styles.leagueLogoSmall}
                />
                <Text style={styles.liveLeague}>{m.league.name}</Text>
              </View>
              <Divider style={{ marginVertical: 4 }} />
              <View style={styles.liveTeams}>
                <Image
                  source={{ uri: m.teams.home.logo }}
                  style={styles.liveTeamLogo}
                />
                <Text style={styles.liveScore}>
                  {m.goals.home} - {m.goals.away}
                </Text>
                <Image
                  source={{ uri: m.teams.away.logo }}
                  style={styles.liveTeamLogo}
                />
              </View>
              <Text style={styles.liveElapsed}>
                {m.status?.elapsed ? `${m.status.elapsed}'` : "Por iniciar"}
              </Text>
              <Text style={styles.liveVenue}>{m.fixture.venue.name}</Text>
            </Card>
          ))}
        </ScrollView>
      )}
    </>
  );

  return (
    <PrivateLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🌍 Selecciones Nacionales</Text>
        <View style={styles.chipsRow}>
          {[
            { key: "paises", label: "Países" },
            { key: "torneos", label: "Torneos" },
            { key: "vivo", label: "Partidos en Vivo" },
          ].map((tab) => (
            <Chip
              key={tab.key}
              mode={activeTab === tab.key ? "flat" : "outlined"}
              style={[
                styles.chip,
                activeTab === tab.key && styles.chipSelected,
              ]}
              textStyle={{ color: activeTab === tab.key ? "#FFF" : "#000" }}
              onPress={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </Chip>
          ))}
        </View>

        {activeTab === "paises" && renderCountries()}
        {activeTab === "torneos" && renderTournaments()}
        {activeTab === "vivo" && renderLiveMatches()}
      </ScrollView>
    </PrivateLayout>
  );
}

/** 🎨 Styles */
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    fontFamily: "goli",
    marginBottom: 12,
  },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: { borderColor: "#1DB954" },
  chipSelected: { backgroundColor: "#1DB954" },
  search: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    color: "#000",
  },
  /** 🌍 Países */
  countryRows: { flexDirection: "column", gap: 12, paddingBottom: 10 },
  countryRow: { flexDirection: "row", gap: 10 },
  countryCard: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#444242ff",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  countryCardSelected: { borderWidth: 2, borderColor: "#1DB954" },
  flag: { width: 55, height: 35, borderRadius: 6, marginBottom: 4 },
  countryName: { fontSize: 12, color: "#111", fontWeight: "600" },
  /** 🏆 Torneos grid */
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    marginTop: 10,
  },
  tournamentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  tournamentGridCard: {
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
  tournamentGridLogo: { width: 60, height: 60, marginBottom: 8 },
  tournamentGridName: {
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
    color: "#111",
    marginBottom: 4,
  },
  tournamentGridConf: { fontSize: 11, color: "#777", textAlign: "center" },
  /** ⚽ Partidos en vivo */
  liveCard: { padding: 12, borderRadius: 12 },
  liveHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveLeague: { fontSize: 12, fontWeight: "500", color: "#333" },
  leagueLogoSmall: { width: 18, height: 18 },
  liveTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  liveTeamLogo: { width: 32, height: 32, borderRadius: 4 },
  liveScore: { fontWeight: "bold", fontSize: 16 },
  liveElapsed: {
    fontSize: 12,
    color: "#1DB954",
    textAlign: "center",
    marginTop: 4,
  },
  liveVenue: { fontSize: 11, textAlign: "center", color: "#666" },
  noMatchesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noMatchesText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
});
