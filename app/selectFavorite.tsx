import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/AuthContext";
import { useFetch } from "@/hooks/FetchContext";
import {
  Coach,
  Country,
  Favorites,
  LeagueB,
  PlayerB,
  RootStackParamList,
  Team,
} from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  Portal,
  ProgressBar,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

const primaryColor = "#1DB954";

export default function SelectFavorite() {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    getCountries,
    getLeagueFromCountry,
    getTeamsFromLeague,
    getPlayerFromTeam,
    getCoachesFromLeague,
    saveFavorites,
    getFavorites
  } = useFetch();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [leagueSearch, setLeagueSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [coachSearch, setCoachSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLeague, setSelectedLeague] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [leagues, setLeagues] = useState<LeagueB[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<PlayerB[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedFavorites, setSelectedFavorites] = useState<Favorites>({
    equipos: [],
    ligas: [],
    jugadores: [],
    entrenadores: [],
  });

  useEffect(() => {
    getCountriesList();
    getFavoriteList();
  }, []);

  const getFavoriteList = async () => {
    const data = await getFavorites();
    if (data.success) {
      const { teams, players, coaches, leagues } = data;
      const favoritos: Favorites = {
        equipos: teams.map((e: any) => e.title),
        ligas: leagues.map((l: any) => l.title),
        jugadores: players.map((j: any) => j.title),
        entrenadores: coaches.map((c: any) => c.title),
      };

      setSelectedFavorites(favoritos);

    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.includes(countrySearch)
  );

  const filteredLeagues = leagues.filter(({ league }) =>
    league.name.includes(leagueSearch)
  );

  const filteredTeams = teams.filter((team) => team.name.includes(search));

  const filteredPlayers = players.filter((player) =>
    player.name.includes(playerSearch)
  );

  const filteredCoaches = coaches.filter((coach) =>
    coach.name.includes(coachSearch)
  );

  useEffect(() => {
    const selectedIndex = filteredCountries.findIndex(
      (country) => country.name === selectedCountry
    );

    if (selectedIndex >= 0) {
      const chipWidth = 90;
      const scrollX = selectedIndex * (chipWidth + 8);

      scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [filteredCountries, selectedCountry]);

  const getCountriesList = async () => {
    setLoading(true);
    const response = await getCountries();
    response.success && setCountries(response.data);
    setLoading(false);
  };

  const steps = ["Equipos", "Ligas", "Jugadores", "Entrenadores"];
  const currentKey = ["equipos", "ligas", "jugadores", "entrenadores"][
    step
  ] as keyof typeof selectedFavorites;

  const handleToggle = (type: keyof typeof selectedFavorites, item: string) => {
    setSelectedFavorites((prev) => {
      const alreadySelected = prev[type].includes(item);
      return {
        ...prev,
        [type]: alreadySelected
          ? prev[type].filter((i) => i !== item)
          : [...prev[type], item],
      };
    });
  };

  const resetStates = () => {
    setLeagues([]);
    setTeams([]);
    setPlayers([]);
    setCoaches([]);
    setCountrySearch("");
    setLeagueSearch("");
    setPlayerSearch("");
    setCoachSearch("");
    setSelectedLeague(0);
    setSelectedTeam("");
    setSelectedCountry("");
    setError("");
  };

  const handleNext = () => {
    resetStates();
    const currentSelection = selectedFavorites[currentKey];
    if (currentSelection.length === 0) {
      setSnackbarVisible(true);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      fetchSaveFavorites();
    }
  };

  const fetchSaveFavorites = async () => {
    const response = await saveFavorites(selectedFavorites);
    if (response.success) {
      navigation.navigate("index");
    } else {
      setError("Error al guardar tus favoritos");
    }
  };

  const handleBack = () => {
    resetStates();
    if (step > 0) {
      setStep(step - 1);
      setSearch("");
    }
  };

  const handleSkip = () => {
    fetchSaveFavorites();
  };

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchLeagues = async () => {
      setLoading(true);
      const response = await getLeagueFromCountry(selectedCountry);
      if (response.success) {
        setLeagues(response.data);
      }
      setLoading(false);
    };

    fetchLeagues();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedLeague) return;

    const fetchData = async () => {
      setLoading(true);
      if (step === 0 || step === 2) {
        const res = await getTeamsFromLeague(selectedLeague);
        if (res.success) setTeams(res.data);
      } else if (step === 3) {
        const res = await getCoachesFromLeague(selectedLeague);
        if (res.success) setCoaches(res.data);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedLeague, step]);

  useEffect(() => {
    if (!selectedTeam) return;

    const fetchPlayers = async () => {
      setLoading(true);
      const res = await getPlayerFromTeam(selectedTeam);
      if (res.success) setPlayers(res.data);
      setLoading(false);
    };

    fetchPlayers();
  }, [selectedTeam]);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        👋 ¡Hola, {user?.nickName}!
      </Text>
      <Text variant="titleMedium" style={styles.subtitle}>
        Selecciona tus {steps[step].toLowerCase()} favoritos
      </Text>
      <ProgressBar
        progress={step / 3}
        color={primaryColor}
        style={{ height: 6, borderRadius: 4, marginBottom: 16 }}
      />

      <Text> {error} </Text>

      <Card mode="contained" style={styles.card}>
        <Animated.View
          key={step}
          entering={FadeInRight}
          exiting={FadeOutLeft}
          style={{ padding: 16 }}
        >
          {selectedFavorites[currentKey].length > 0 && (
            <Button
              mode="contained-tonal"
              icon="eye"
              onPress={() => setVisible(true)}
              style={{ alignSelf: "flex-start", marginBottom: 16 }}
            >
              Ver seleccionados ({selectedFavorites[currentKey].length})
            </Button>
          )}

          <TextInput
            mode="outlined"
            placeholder="Buscar país..."
            value={countrySearch}
            onChangeText={setCountrySearch}
            style={{ marginBottom: 8 }}
            left={<TextInput.Icon icon="map-search-outline" />}
            outlineColor="#ccc"
            activeOutlineColor={primaryColor}
          />
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {filteredCountries.map((country) => (
              <Chip
                key={country._id}
                onPress={() => setSelectedCountry(country.name)}
                style={[
                  styles.chip,
                  {
                    marginRight: 8,
                    backgroundColor:
                      country.name === selectedCountry ? primaryColor : "#fff",
                  },
                ]}
                textStyle={{
                  color: country.name === selectedCountry ? "#fff" : "#000",
                  fontWeight: "500",
                }}
              >
                {country.name}
              </Chip>
            ))}
          </ScrollView>
          {step === 0 && (
            <>
              {filteredLeagues.length > 0 && (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Buscar liga..."
                    value={leagueSearch}
                    onChangeText={setLeagueSearch}
                    style={{ marginBottom: 8 }}
                    left={<TextInput.Icon icon="map-search-outline" />}
                    outlineColor="#ccc"
                    activeOutlineColor={primaryColor}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    {filteredLeagues.map(({ league }) => (
                      <Chip
                        key={league.id}
                        onPress={() => setSelectedLeague(league.id)}
                        avatar={
                          <Image
                            source={{ uri: league.logo }}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                          />
                        }
                        style={[
                          styles.chip,
                          {
                            marginRight: 8,
                            backgroundColor:
                              league.id === selectedLeague
                                ? primaryColor
                                : "#fff",
                          },
                        ]}
                        textStyle={{
                          color: league.id === selectedLeague ? "#fff" : "#000",
                          fontWeight: "500",
                        }}
                      >
                        {league.name}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}
              {filteredTeams.length > 0 && (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Buscar equipo..."
                    value={search}
                    onChangeText={setSearch}
                    style={{ marginBottom: 12 }}
                    left={<TextInput.Icon icon="magnify" />}
                    outlineColor="#ccc"
                    activeOutlineColor={primaryColor}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    {filteredTeams.map((item) => (
                      <Chip
                        key={item.teamId}
                        avatar={
                          <Image
                            source={{ uri: item.logo }}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                          />
                        }
                        style={[
                          styles.chip,
                          selectedFavorites.equipos.includes(item.name) && {
                            backgroundColor: primaryColor,
                          },
                        ]}
                        textStyle={{
                          color: selectedFavorites.equipos.includes(item.name)
                            ? "#fff"
                            : "#000",
                          fontWeight: "500",
                        }}
                        onPress={() => handleToggle("equipos", item.name)}
                        elevated
                      >
                        {item.name}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}
            </>
          )}

          {step === 1 && filteredLeagues.length > 0 && (
            <>
              <TextInput
                mode="outlined"
                placeholder="Buscar liga..."
                value={leagueSearch}
                onChangeText={setLeagueSearch}
                style={{ marginBottom: 8 }}
                left={<TextInput.Icon icon="map-search-outline" />}
                outlineColor="#ccc"
                activeOutlineColor={primaryColor}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {filteredLeagues.map(({ league }) => (
                  <Chip
                    key={league.id}
                    onPress={() => handleToggle("ligas", league.name)}
                    avatar={
                      <Image
                        source={{ uri: league.logo }}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    }
                    style={[
                      styles.chip,
                      selectedFavorites.ligas.includes(league.name) && {
                        backgroundColor: primaryColor,
                      },
                    ]}
                    textStyle={{
                      color: selectedFavorites.equipos.includes(league.name)
                        ? "#fff"
                        : "#000",
                      fontWeight: "500",
                    }}
                  >
                    {league.name}
                  </Chip>
                ))}
              </ScrollView>
            </>
          )}

          {step === 2 && filteredLeagues.length > 0 && (
            <>
              <TextInput
                mode="outlined"
                placeholder="Buscar liga..."
                value={leagueSearch}
                onChangeText={setLeagueSearch}
                style={{ marginBottom: 8 }}
                left={<TextInput.Icon icon="map-search-outline" />}
                outlineColor="#ccc"
                activeOutlineColor={primaryColor}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {filteredLeagues.map(({ league }) => (
                  <Chip
                    key={league.id}
                    avatar={
                      <Image
                        source={{ uri: league.logo }}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    }
                    onPress={() => setSelectedLeague(league.id)}
                    style={[
                      styles.chip,
                      {
                        marginRight: 8,
                        backgroundColor:
                          league.id === selectedLeague ? primaryColor : "#fff",
                      },
                    ]}
                    textStyle={{
                      color: league.id === selectedLeague ? "#fff" : "#000",
                      fontWeight: "500",
                    }}
                  >
                    {league.name}
                  </Chip>
                ))}
              </ScrollView>
              {selectedLeague && (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Buscar equipo..."
                    value={search}
                    onChangeText={setSearch}
                    style={{ marginBottom: 12 }}
                    left={<TextInput.Icon icon="magnify" />}
                    outlineColor="#ccc"
                    activeOutlineColor={primaryColor}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    {filteredTeams.map((team) => (
                      <Chip
                        key={team.teamId}
                        onPress={() => setSelectedTeam(team.teamId)}
                        style={[
                          styles.chip,
                          {
                            marginRight: 8,
                            backgroundColor:
                              team.teamId === selectedTeam
                                ? primaryColor
                                : "#fff",
                          },
                        ]}
                        textStyle={{
                          color: team.teamId === selectedTeam ? "#fff" : "#000",
                          fontWeight: "500",
                        }}
                      >
                        {team.name}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}

              {selectedTeam && (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Buscar jugador..."
                    value={search}
                    onChangeText={setPlayerSearch}
                    style={{ marginBottom: 12 }}
                    left={<TextInput.Icon icon="magnify" />}
                    outlineColor="#ccc"
                    activeOutlineColor={primaryColor}
                  />

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    {filteredPlayers.map((player) => (
                      <Chip
                        key={player.playerId}
                        onPress={() => handleToggle("jugadores", player.name)}
                        avatar={
                          <Image
                            source={{ uri: player.photo }}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                          />
                        }
                        style={[
                          styles.chip,
                          selectedFavorites.jugadores.includes(player.name) && {
                            backgroundColor: primaryColor,
                          },
                        ]}
                        textStyle={{
                          color: selectedFavorites.jugadores.includes(
                            player.name
                          )
                            ? "#fff"
                            : "#000",
                          fontWeight: "500",
                        }}
                      >
                        {player.name}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}
            </>
          )}

          {step === 3 && filteredLeagues.length > 0 && (
            <>
              <TextInput
                mode="outlined"
                placeholder="Buscar liga..."
                value={leagueSearch}
                onChangeText={setLeagueSearch}
                style={{ marginBottom: 8 }}
                left={<TextInput.Icon icon="map-search-outline" />}
                outlineColor="#ccc"
                activeOutlineColor={primaryColor}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {filteredLeagues.map(({ league }) => (
                  <Chip
                    key={league.id}
                    onPress={() => setSelectedLeague(league.id)}
                    avatar={
                      <Image
                        source={{ uri: league.logo }}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    }
                    style={[
                      styles.chip,
                      {
                        marginRight: 8,
                        backgroundColor:
                          league.id === selectedLeague ? primaryColor : "#fff",
                      },
                    ]}
                    textStyle={{
                      color: league.id === selectedLeague ? "#fff" : "#000",
                      fontWeight: "500",
                    }}
                  >
                    {league.name}
                  </Chip>
                ))}
              </ScrollView>

              {selectedLeague && (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Buscar entrenador..."
                    value={search}
                    onChangeText={setCoachSearch}
                    style={{ marginBottom: 12 }}
                    left={<TextInput.Icon icon="magnify" />}
                    outlineColor="#ccc"
                    activeOutlineColor={primaryColor}
                  />

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    {filteredCoaches.map((coach) => (
                      <Chip
                        key={coach.coachId}
                        onPress={() => handleToggle("entrenadores", coach.name)}
                        avatar={
                          <Image
                            source={{ uri: coach.photo }}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                          />
                        }
                        style={[
                          styles.chip,
                          selectedFavorites.entrenadores.includes(
                            coach.name
                          ) && {
                            backgroundColor: primaryColor,
                          },
                        ]}
                        textStyle={{
                          color: selectedFavorites.entrenadores.includes(
                            coach.name
                          )
                            ? "#fff"
                            : "#000",
                          fontWeight: "500",
                        }}
                      >
                        {coach.name}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}
            </>
          )}
        </Animated.View>
      </Card>

      <Divider style={{ marginVertical: 12 }} />

      <View style={styles.buttonsRow}>
        {step > 0 ? (
          <Button onPress={handleBack} mode="text" icon="arrow-left">
            Atrás
          </Button>
        ) : (
          <View style={{ width: 80 }} />
        )}
        <Button onPress={handleSkip} mode="text" icon="close">
          Omitir
        </Button>
        <Button
          onPress={handleNext}
          mode="contained"
          icon={step === 3 ? "check" : "arrow-right"}
          buttonColor={primaryColor}
        >
          {step === 3 ? "Finalizar" : "Siguiente"}
        </Button>
      </View>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
            {steps[step]} seleccionados
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {selectedFavorites[currentKey].map((item) => (
              <Chip
                key={item}
                style={{ backgroundColor: primaryColor }}
                textStyle={{ color: "#fff", fontWeight: "500" }}
                onClose={() => handleToggle(currentKey, item)}
                closeIcon="close"
              >
                {item}
              </Chip>
            ))}
          </View>

          <Button onPress={() => setVisible(false)} style={{ marginTop: 20 }}>
            Cerrar
          </Button>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#D32F2F" }}
        action={{
          label: "OK",
          labelStyle: { color: "#fff" },
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text>Debes seleccionar al menos un {steps[step].toLowerCase()}.</Text>
      </Snackbar>

      <Loading visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
    paddingBottom: 20,
    borderWidth: 1.5,
    borderColor: primaryColor,
    backgroundColor: "#fff",
    maxHeight: 700,
    overflow: "scroll",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    color: primaryColor,
  },
  subtitle: {
    marginBottom: 16,
    color: "#555",
  },
  chip: {
    margin: 4,
    borderColor: primaryColor,
    borderWidth: 1.2,
    backgroundColor: "#fff",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
