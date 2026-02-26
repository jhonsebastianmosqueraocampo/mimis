import Loading from "@/components/Loading";
import { betTypes } from "@/data/betTypes";
import { useFetch } from "@/hooks/FetchContext";
import { Bet, PredictionOddsItem, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function CreateBetScreen() {
  const { getPredictionOdds, createBet } = useFetch();
  const [stake, setStake] = useState("2500");
  const [searchQuery, setSearchQuery] = useState("");
  const [betType, setBetType] = useState("RESULT_1X2");
  const [selectedMatch, setSelectedMatch] = useState<PredictionOddsItem | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [predictionOdds, setPredictionOdds] = useState<PredictionOddsItem[]>(
    [],
  );
  const [error, setError] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [betId, setBetId] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;
    const predictionOdds = async () => {
      setLoading(true);
      try {
        const { success, predictionOdds, message } = await getPredictionOdds();

        if (!isMounted) return;

        if (success) {
          setPredictionOdds(predictionOdds!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el predictionOdds");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    predictionOdds();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Creando la apuesta"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const handleCreateBet = async () => {
    try {
      const bet: Bet = {
        _id: "",
        fixtureId: selectedMatch?.fixture.fixtureId ?? "",
        stake,
        betType,
        users: [],
      };
      const { message, success, accessCode, betId } = await createBet(bet);
      if (success) {
        setSuccessVisible(true);
        setAccessCode(accessCode);
        setBetId(betId);
      } else {
        setError(message ?? "");
      }
    } catch (error) {
      setError("Error al crear la apuesta");
    }
  };

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  return (
    <PrivateLayout>
      <View>
        <ScrollView style={{ flex: 1, padding: 10 }}>
          {/* Selección de partido */}
          {!selectedMatch ? (
            <Card style={{ marginBottom: 12 }}>
              <Card.Title title="Nueva apuesta" />
              <Card.Title title="Selecciona un partido" />
              <Card.Content>
                {/* 🔎 Buscador */}
                <Searchbar
                  placeholder="Buscar equipo..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ marginBottom: 12 }}
                />

                {predictionOdds && predictionOdds.length > 0 ? (
                  predictionOdds
                    // 🔎 Filtrado por nombre de equipo (local o visitante)
                    .filter((item) => {
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        item.fixture.teams.home.name
                          .toLowerCase()
                          .includes(query) ||
                        item.fixture.teams.away.name
                          .toLowerCase()
                          .includes(query)
                      );
                    })
                    .map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedMatch(item)}
                        >
                          <Card style={{ marginBottom: 12, padding: 12 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              {/* Equipo local */}
                              <View style={{ alignItems: "center", flex: 1 }}>
                                <Image
                                  source={{ uri: item.fixture.teams.home.logo }}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    marginBottom: 4,
                                  }}
                                  resizeMode="contain"
                                />
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  {item.fixture.teams.home.name}
                                </Text>
                              </View>

                              {/* VS */}
                              <View style={{ flex: 0.5, alignItems: "center" }}>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#1DB954",
                                  }}
                                >
                                  VS
                                </Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>
                                  {new Date(
                                    item.fixture.date,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Text>
                              </View>

                              {/* Equipo visitante */}
                              <View style={{ alignItems: "center", flex: 1 }}>
                                <Image
                                  source={{ uri: item.fixture.teams.away.logo }}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    marginBottom: 4,
                                  }}
                                  resizeMode="contain"
                                />
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  {item.fixture.teams.away.name}
                                </Text>
                              </View>
                            </View>

                            {/* Liga y estadio */}
                            <View
                              style={{
                                marginTop: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Image
                                  source={{ uri: item.fixture.league.logo }}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginRight: 6,
                                  }}
                                  resizeMode="contain"
                                />
                                <Text style={{ fontSize: 12, color: "#555" }}>
                                  {item.fixture.league.name}
                                </Text>
                              </View>
                              <Text style={{ fontSize: 12, color: "#555" }}>
                                {item.fixture.venue.name}
                              </Text>
                            </View>
                          </Card>
                        </TouchableOpacity>
                      );
                    })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>
                      ⚽ Aún no hay partidos disponibles
                    </Text>

                    <Text style={styles.emptySubtitle}>
                      Las apuestas se habilitan 30 minutos antes del inicio del
                      partido.
                    </Text>

                    <Text style={styles.emptyHint}>
                      Revisa la hora del encuentro en la página principal.
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ) : (
            <>
              {/* Partido seleccionado */}
              <Card style={{ marginBottom: 12, padding: 12 }}>
                {/* Equipos */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  {/* Equipo local */}
                  <TouchableOpacity
                    style={{ alignItems: "center", flex: 1 }}
                    onPress={() =>
                      handleTeam(selectedMatch.fixture.teams.home.id)
                    }
                  >
                    <Image
                      source={{ uri: selectedMatch.fixture.teams.home.logo }}
                      style={{ width: 60, height: 60, marginBottom: 6 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      {selectedMatch.fixture.teams.home.name}
                    </Text>
                  </TouchableOpacity>

                  {/* VS */}
                  <View style={{ flex: 0.5, alignItems: "center" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#1DB954",
                      }}
                    >
                      VS
                    </Text>
                    <Text style={{ fontSize: 12, color: "#555" }}>
                      {new Date(selectedMatch.fixture.date).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Text>
                  </View>

                  {/* Equipo visitante */}
                  <TouchableOpacity
                    style={{ alignItems: "center", flex: 1 }}
                    onPress={() =>
                      handleTeam(selectedMatch.fixture.teams.away.id)
                    }
                  >
                    <Image
                      source={{ uri: selectedMatch.fixture.teams.away.logo }}
                      style={{ width: 60, height: 60, marginBottom: 6 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      {selectedMatch.fixture.teams.away.name}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Info liga y estadio */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={{ uri: selectedMatch.fixture.league.logo }}
                      style={{ width: 20, height: 20, marginRight: 6 }}
                      resizeMode="contain"
                    />
                    <Text style={{ fontSize: 12, color: "#555" }}>
                      {selectedMatch.fixture.league.name}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#555" }}>
                    {selectedMatch.fixture.venue.name}
                  </Text>
                </View>

                {/* Botón */}
                <Button
                  mode="outlined"
                  textColor="#1DB954"
                  style={{ borderColor: "#1DB954" }}
                  onPress={() => setSelectedMatch(null)}
                >
                  Cambiar partido
                </Button>
              </Card>

              {/* Tipo de apuesta */}
              <Card style={{ marginBottom: 12 }}>
                <Card.Title title="Tipo de apuesta" />
                <Card.Content>
                  {betTypes.map((type) => (
                    <Chip
                      key={type.key}
                      style={{
                        margin: 4,
                        backgroundColor:
                          betType === type.key ? "#1DB954" : undefined,
                      }}
                      textStyle={{
                        color: betType === type.key ? "white" : "black",
                      }}
                      selected={betType === type.key}
                      onPress={() => setBetType(type.key)}
                    >
                      {type.label}
                    </Chip>
                  ))}
                  <Text style={{ marginTop: 10, color: "#555" }}>
                    {betTypes.find((t) => t.key === betType)?.desc}
                  </Text>
                </Card.Content>
              </Card>

              {/* Cuota de puntos */}
              <Card style={{ marginBottom: 12 }}>
                <Card.Title title="Cuota por usuario" />
                <Card.Content>
                  <TextInput
                    label="Puntos"
                    value={stake}
                    onChangeText={setStake}
                    keyboardType="numeric"
                  />
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                buttonColor="#1DB954"
                onPress={handleCreateBet}
              >
                Crear apuesta y enviar invitaciones
              </Button>
            </>
          )}
        </ScrollView>
      </View>
      <Portal>
        <Modal
          visible={successVisible}
          onDismiss={() => {
            setSuccessVisible(false);
            navigation.navigate("betInvite", { id: betId });
          }}
          contentContainerStyle={{
            backgroundColor: "white",
            margin: 20,
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
              color: "#1DB954",
            }}
          >
            ¡Apuesta creada con éxito!
          </Text>

          <Text style={{ fontSize: 16, marginBottom: 16, textAlign: "center" }}>
            Código de acceso:
          </Text>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1DB954",
              marginBottom: 20,
            }}
          >
            {accessCode}
          </Text>

          {/* Botones de acción */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <IconButton
              icon="whatsapp"
              size={28}
              iconColor="#25D366"
              onPress={() => {
                const message = `Únete a mi mesa de apuesta con este código: ${accessCode}`;
                const url = `https://wa.me/?text=${encodeURIComponent(
                  message,
                )}`;
                Linking.openURL(url);
              }}
            />
          </View>

          <Button
            mode="contained"
            buttonColor="#1DB954"
            style={{ marginTop: 16, width: "100%" }}
            onPress={() => {
              setSuccessVisible(false);
              navigation.navigate("betInvite", { id: betId });
            }}
          >
            Entrar a la apuesta
          </Button>
        </Modal>
      </Portal>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },

  emptyHint: {
    fontSize: 13,
    color: "#1DB954",
    textAlign: "center",
  },
});
