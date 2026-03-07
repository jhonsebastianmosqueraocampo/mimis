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

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

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

        if (success) setPredictionOdds(predictionOdds!);
        else setError(message!);
      } catch {
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
      } else setError(message ?? "");
    } catch {
      setError("Error al crear la apuesta");
    }
  };

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <ScrollView style={sx({ p: 16 }) as any}>
        {!selectedMatch ? (
          <Card style={[shadows.sm, { marginBottom: 12 }]}>
            <Card.Title title="Nueva apuesta" titleStyle={g.subtitle} />
            <Card.Content>
              <Searchbar
                placeholder="Buscar equipo..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ marginBottom: 12 }}
              />

              {!predictionOdds || predictionOdds.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={g.subtitle}>
                    ⚽ Aún no hay partidos disponibles
                  </Text>

                  <Text style={g.small}>
                    Las apuestas se habilitan 30 minutos antes
                  </Text>

                  <Text style={{ ...g.caption, color: colors.primary }}>
                    Revisa la hora del encuentro
                  </Text>
                </View>
              ) : (
                predictionOdds
                  .filter((item) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();

                    return (
                      item.fixture.teams.home.name
                        .toLowerCase()
                        .includes(query) ||
                      item.fixture.teams.away.name.toLowerCase().includes(query)
                    );
                  })
                  .map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedMatch(item)}
                    >
                      <Card
                        style={[
                          shadows.sm,
                          {
                            marginBottom: 12,
                            padding: 12,
                            borderRadius: radius.md,
                          },
                        ]}
                      >
                        <View
                          style={[
                            sx({ row: true, center: true }) as any,
                            { justifyContent: "space-between" },
                          ]}
                        >
                          <View style={{ alignItems: "center", flex: 1 }}>
                            <Image
                              source={{ uri: item.fixture.teams.home.logo }}
                              style={{ width: 50, height: 50 }}
                            />

                            <Text style={g.body}>
                              {item.fixture.teams.home.name}
                            </Text>
                          </View>

                          <View style={{ alignItems: "center" }}>
                            <Text
                              style={[g.subtitle, { color: colors.primary }]}
                            >
                              VS
                            </Text>

                            <Text style={g.caption}>
                              {new Date(item.fixture.date).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </Text>
                          </View>

                          <View style={{ alignItems: "center", flex: 1 }}>
                            <Image
                              source={{ uri: item.fixture.teams.away.logo }}
                              style={{ width: 50, height: 50 }}
                            />

                            <Text style={g.body}>
                              {item.fixture.teams.away.name}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            sx({ row: true, center: true }) as any,
                            { justifyContent: "space-between", marginTop: 8 },
                          ]}
                        >
                          <View
                            style={[sx({ row: true, center: true }) as any]}
                          >
                            <Image
                              source={{ uri: item.fixture.league.logo }}
                              style={{ width: 20, height: 20, marginRight: 6 }}
                            />
                            <Text style={g.caption}>
                              {item.fixture.league.name}
                            </Text>
                          </View>

                          <Text style={g.caption}>
                            {item.fixture.venue.name}
                          </Text>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))
              )}
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={[shadows.sm, { marginBottom: 12, padding: 12 }]}>
              <View
                style={[
                  sx({ row: true, center: true }) as any,
                  { justifyContent: "space-between" },
                ]}
              >
                <TouchableOpacity
                  style={{ alignItems: "center", flex: 1 }}
                  onPress={() =>
                    handleTeam(selectedMatch.fixture.teams.home.id)
                  }
                >
                  <Image
                    source={{ uri: selectedMatch.fixture.teams.home.logo }}
                    style={{ width: 60, height: 60 }}
                  />

                  <Text style={g.body}>
                    {selectedMatch.fixture.teams.home.name}
                  </Text>
                </TouchableOpacity>

                <Text style={[g.subtitle, { color: colors.primary }]}>VS</Text>

                <TouchableOpacity
                  style={{ alignItems: "center", flex: 1 }}
                  onPress={() =>
                    handleTeam(selectedMatch.fixture.teams.away.id)
                  }
                >
                  <Image
                    source={{ uri: selectedMatch.fixture.teams.away.logo }}
                    style={{ width: 60, height: 60 }}
                  />

                  <Text style={g.body}>
                    {selectedMatch.fixture.teams.away.name}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                mode="outlined"
                style={{ marginTop: 12 }}
                onPress={() => setSelectedMatch(null)}
              >
                Cambiar partido
              </Button>
            </Card>

            <Card style={{ marginBottom: 12 }}>
              <Card.Title title="Tipo de apuesta" titleStyle={g.subtitle} />

              <Card.Content style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {betTypes.map((type) => (
                  <Chip
                    key={type.key}
                    selected={betType === type.key}
                    onPress={() => setBetType(type.key)}
                    style={{
                      margin: 4,
                      backgroundColor:
                        betType === type.key ? colors.primary : undefined,
                    }}
                    textStyle={{
                      color:
                        betType === type.key
                          ? colors.textOnPrimary
                          : colors.textPrimary,
                    }}
                  >
                    {type.label}
                  </Chip>
                ))}

                <Text style={{ ...g.caption, marginTop: 10 }}>
                  {betTypes.find((t) => t.key === betType)?.desc}
                </Text>
              </Card.Content>
            </Card>

            <Card style={{ marginBottom: 12 }}>
              <Card.Title title="Cuota por usuario" titleStyle={g.subtitle} />

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
              onPress={handleCreateBet}
              buttonColor={colors.primary}
            >
              Crear apuesta y enviar invitaciones
            </Button>
          </>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={successVisible}
          onDismiss={() => setSuccessVisible(false)}
          contentContainerStyle={{
            backgroundColor: colors.card,
            margin: 20,
            borderRadius: radius.lg,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={[g.subtitle, { color: colors.primary }]}>
            ¡Apuesta creada!
          </Text>

          <Text style={{ ...g.body, marginTop: 10 }}>Código de acceso</Text>

          <Text style={[g.title, { color: colors.primary }]}>{accessCode}</Text>

          <IconButton
            icon="whatsapp"
            size={30}
            iconColor="#25D366"
            onPress={() => {
              const message = `Únete a mi apuesta con este código: ${accessCode}`;
              Linking.openURL(
                `https://wa.me/?text=${encodeURIComponent(message)}`,
              );
            }}
          />

          <Button
            mode="contained"
            buttonColor={colors.primary}
            style={{ marginTop: 16, width: "100%" }}
            onPress={() => navigation.navigate("betInvite", { id: betId })}
          >
            Entrar a la apuesta
          </Button>
        </Modal>
      </Portal>
    </PrivateLayout>
  );
}
