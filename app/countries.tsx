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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip, Divider, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

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

  const [search, setSearch] = useState("");
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

      const { success, data } = await getCountries();

      if (!mounted) return;

      if (success) {
        setCountries(data);
        setSelectedCountry(data[0]?.name);
      }

      setLoading(false);
    };

    const loadLeaguesCountry = async () => {
      setLoading(true);

      const { success, leaguesCountry } = await getLeaguesCountry(
        selectedCountry!,
      );

      if (!mounted) return;

      if (success) setTournaments(leaguesCountry);

      setLoading(false);
    };

    const loadTournaments = async () => {
      setLoading(true);

      const { success, leaguesCountry } = await getNationalTournaments();

      if (!mounted) return;

      if (success) setTournaments(leaguesCountry);

      setLoading(false);
    };

    const loadLiveMatches = async () => {
      setLoading(true);

      const { success, matches } = await getNationalMatchesToday();

      if (!mounted) return;

      if (success) setAllMatches(matches);

      setLoading(false);
    };

    if (activeTab === "paises" && !selectedCountry && countries.length === 0)
      loadCountries();

    if (activeTab === "paises" && selectedCountry) {
      setTournaments([]);
      loadLeaguesCountry();
    }

    if (activeTab === "torneos") {
      setTournaments([]);
      loadTournaments();
    }

    if (activeTab === "vivo") loadLiveMatches();

    return () => {
      mounted = false;
    };
  }, [activeTab, selectedCountry]);

  if (loading) {
    return <Loading visible={loading} />;
  }

  const filteredCountries = countries.filter((c) =>
    (c?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const filteredTournaments = tournaments.filter((t) =>
    (t?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

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

  /* =========================
     BUSCADOR
  ========================== */

  const SearchBox = (placeholder: string) => (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      value={search}
      onChangeText={setSearch}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.textPrimary,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    />
  );

  /* =========================
     PAÍSES
  ========================== */

  const renderCountries = () => (
    <>
      {SearchBox("Buscar país...")}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[sx({ row: true, mt: 12 }) as any]}>
          {filteredCountries.map((country) => {
            const selected = selectedCountry === country.name;

            return (
              <TouchableOpacity
                key={country.name}
                onPress={() => setSelectedCountry(country.name)}
                style={[
                  {
                    padding: 10,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    marginRight: 10,
                  },
                  shadows.sm,
                ]}
              >
                <Text
                  style={[
                    g.body,
                    {
                      color: selected ? colors.primary : colors.textPrimary,
                    },
                  ]}
                >
                  {country.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedCountry && (
        <>
          <Text style={[g.subtitle, { marginTop: 20, marginBottom: 10 }]}>
            Torneos de {selectedCountry}
          </Text>

          {renderTournamentGrid(tournaments)}
        </>
      )}
    </>
  );

  /* =========================
     GRID TORNEOS
  ========================== */

  const renderTournamentGrid = (data: NationalLeague[]) => {
    const rows = [];

    for (let i = 0; i < data.length; i += 2) {
      rows.push(data.slice(i, i + 2));
    }

    return (
      <View>
        {rows.map((row, i) => (
          <View key={i} style={[sx({ row: true, mb: 12 }) as any]}>
            {row.map((item) => (
              <Card
                key={item.leagueId}
                style={[
                  {
                    flex: 1,
                    marginHorizontal: 4,
                    paddingVertical: 16,
                    alignItems: "center",
                    borderRadius: radius.lg,
                    backgroundColor: colors.card,
                  },
                  shadows.md,
                ]}
                onPress={() => handleTournament(item.leagueId.toString())}
              >
                <Image
                  source={{ uri: item.logo }}
                  style={{ width: 60, height: 60, marginBottom: 8 }}
                />

                <Text style={[g.body, { textAlign: "center" }]}>
                  {item.name}
                </Text>

                <Text style={[g.caption, { color: colors.textSecondary }]}>
                  {item.country?.name || "—"}
                </Text>
              </Card>
            ))}

            {row.length < 2 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>
    );
  };

  /* =========================
     TORNEOS
  ========================== */

  const renderTournaments = () => (
    <>
      {SearchBox("Buscar torneo...")}
      <ScrollView style={{ marginTop: 12 }}>
        {renderTournamentGrid(filteredTournaments)}
      </ScrollView>
    </>
  );

  /* =========================
     PARTIDOS EN VIVO
  ========================== */

  const renderLiveMatches = () => (
    <>
      {SearchBox("Buscar selección...")}

      {filteredLive.length === 0 ? (
        <View style={[sx({ center: true, mt: 40 }) as any]}>
          <Text style={[g.body, { textAlign: "center" }]}>
            ⚽ No hay partidos de selecciones nacionales hoy
          </Text>
        </View>
      ) : (
        <ScrollView style={{ marginTop: 12 }}>
          {filteredLive.map((m) => (
            <Card
              key={m.fixtureId}
              style={[
                {
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: radius.md,
                },
                shadows.sm,
              ]}
              onPress={() => handleMatch(m.fixtureId.toString())}
            >
              <View style={[sx({ row: true, center: true }) as any]}>
                <Image
                  source={{ uri: m.league.logo }}
                  style={{ width: 18, height: 18, marginRight: 6 }}
                />

                <Text style={g.caption}>{m.league.name}</Text>
              </View>

              <Divider style={{ marginVertical: 6 }} />

              <View
                style={[
                  sx({ row: true, center: true }) as any,
                  { justifyContent: "space-between" },
                ]}
              >
                <Image
                  source={{ uri: m.teams.home.logo }}
                  style={{ width: 32, height: 32 }}
                />

                <Text style={g.subtitle}>
                  {m.goals.home} - {m.goals.away}
                </Text>

                <Image
                  source={{ uri: m.teams.away.logo }}
                  style={{ width: 32, height: 32 }}
                />
              </View>

              <Text
                style={[
                  g.caption,
                  {
                    textAlign: "center",
                    marginTop: 4,
                    color: colors.primary,
                  },
                ]}
              >
                {m.status?.elapsed ? `${m.status.elapsed}'` : "Por iniciar"}
              </Text>

              <Text
                style={[
                  g.caption,
                  {
                    textAlign: "center",
                    color: colors.textSecondary,
                  },
                ]}
              >
                {m.fixture.venue.name}
              </Text>
            </Card>
          ))}
        </ScrollView>
      )}
    </>
  );

  /* =========================
     UI
  ========================== */

  return (
    <PrivateLayout>
      <ScrollView style={sx({ p: 16 }) as any}>
        <Text style={[g.title, { marginBottom: 12 }]}>
          🌍 Selecciones Nacionales
        </Text>

        <View style={[sx({ row: true, mb: 12 }) as any]}>
          {[
            { key: "paises", label: "Países" },
            { key: "torneos", label: "Torneos" },
            { key: "vivo", label: "Partidos en Vivo" },
          ].map((tab) => {
            const selected = activeTab === tab.key;

            return (
              <Chip
                key={tab.key}
                mode={selected ? "flat" : "outlined"}
                style={[
                  {
                    marginRight: 8,
                    borderColor: colors.primary,
                    backgroundColor: selected ? colors.primary : "transparent",
                  },
                ]}
                textStyle={{
                  color: selected ? colors.textOnPrimary : colors.textPrimary,
                }}
                onPress={() => setActiveTab(tab.key as typeof activeTab)}
              >
                {tab.label}
              </Chip>
            );
          })}
        </View>

        {activeTab === "paises" && renderCountries()}
        {activeTab === "torneos" && renderTournaments()}
        {activeTab === "vivo" && renderLiveMatches()}
      </ScrollView>
    </PrivateLayout>
  );
}
