import NotificationSetting from "@/components/NotificationSettings";
import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList, swiperItem, SyntheticMatch, User } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function Profile() {
  const { getFavorites, getSyntheticMatches, getUser } = useFetch();
  const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Estados de favoritos
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [ligas, setLigas] = useState<swiperItem[]>([]);
  const [entrenadores, setEntrenadores] = useState<swiperItem[]>([]);
  const [matches, setMatches] = useState<SyntheticMatch[]>([]);
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  // Selecciones notificaciones
  const [selectedTeamSettingsValue, setSelectedTeamSettingsValue] =
    useState("todos");
  const [selectedTeamSettings, setSelectedTeamSettings] = useState<
    swiperItem[]
  >([]);
  const [selectedPlayerSettings, setSelectedPlayerSettings] = useState<
    swiperItem[]
  >([]);
  const [selectedPlayerSettingsValue, setSelectedPlayerSettingsValue] =
    useState("todos");

  // Modal historial
  const [showModal, setShowModal] = useState(false);

  // Cargar favoritos
  useEffect(() => {
    let mounted = true;
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const { success, teams, players, leagues, coaches } =
          await getFavorites();
        if (!mounted) return;
        if (success) {
          setEquipos(
            teams.map((t: any) => ({
              id: t.id.toString(),
              title: t.title,
              img: t.img,
              pathTo: `/team/${t.id}`,
            }))
          );
          setJugadores(
            players.map((p: any) => ({
              id: p.id.toString(),
              title: p.title,
              img: p.img,
              pathTo: `/player/${p.id}`,
            }))
          );
          setLigas(
            leagues.map((l: any) => ({
              id: l.id.toString(),
              title: l.title,
              img: l.img,
              pathTo: `/league/${l.id}`,
            }))
          );
          setEntrenadores(
            coaches.map((c: any) => ({
              id: c.id.toString(),
              title: c.title,
              img: c.img,
              pathTo: `/coach/${c.id}`,
            }))
          );
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    const syntheticMatches = async () => {
      setLoading(true);
      try {
        const { success, syntheticMatch } = await getSyntheticMatches();
        if (!mounted) return;
        if (success) {
          setMatches(syntheticMatch);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    const userBack = async () => {
      setLoading(true);
      try {
        const { success, user } = await getUser();
        if (!mounted) return;
        if (success && user) {
          setUser(user);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    userBack();
    syntheticMatches();
    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const lastMatches = matches.slice(0, 5);

  // Handlers notificaciones
  const handleTeamChange = (event: string) => {
    setSelectedTeamSettingsValue(event);
    if (event === "todos") setSelectedTeamSettings(equipos);
  };
  const handleTeamToggle = (team: swiperItem) => {
    setSelectedTeamSettings((prev) =>
      prev.find((t) => t.id === team.id)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team]
    );
  };
  const handlePlayerChange = (event: string) => {
    setSelectedPlayerSettingsValue(event);
    if (event === "todos") setSelectedPlayerSettings(jugadores);
  };
  const handlePlayerToggle = (player: swiperItem) => {
    setSelectedPlayerSettings((prev) =>
      prev.find((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player]
    );
  };
  const actionNotification = (id: string) => console.log(id);

  const handleTeam = (id: string) => {
    navigation.navigate('team', {id})
  }

  const handlePlayer = (id: string) => {
    navigation.navigate('team', {id})
  }

  const handleCoach = (id: string) => {
    navigation.navigate('team', {id})
  }

  const handleLeague = (id: string) => {
    navigation.navigate('team', {id})
  }

  return (
    <PrivateLayout>
      <ScrollView style={styles.container}>
        {/* --- ENCABEZADO --- */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Image
              size={80}
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user!.nickName
                )}&background=1DB954&color=fff`,
              }}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="titleLarge">{user?.nickName}</Text>
              <Text variant="bodyMedium" style={{ color: "#666" }}>
                Nivel: {user?.level}
              </Text>
              <Text
                variant="titleMedium"
                style={{ color: "#1DB954", marginTop: 4 }}
              >
                {user?.points} pts disponibles
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* --- STATS --- */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statIcon, { color: "#1DB954" }]}>🏆</Text>
            <Text style={styles.statValue}>{user?.betsWon}</Text>
            <Text style={styles.statLabel}>Apuestas ganadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statIcon, { color: "#E53935" }]}>❌</Text>
            <Text style={styles.statValue}>{user?.betsLost}</Text>
            <Text style={styles.statLabel}>Apuestas perdidas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statIcon, { color: "#FFB300" }]}>💳</Text>
            <Text style={styles.statValue}>{user?.redeemed}</Text>
            <Text style={styles.statLabel}>Puntos redimidos</Text>
          </View>
        </View>

        {/* --- HISTORIAL MIMIS --- */}
        <Card style={styles.section}>
          <Card.Title title="⚽ Historial de Mimis" />
          <Card.Content>
            {lastMatches.map((m) => (
              <Text key={m._id} style={styles.matchText}>
                Mimis vs Partido {m.matchNumber} → {m.score}
              </Text>
            ))}
            <Button mode="text" onPress={() => setShowModal(true)}>
              Ver todos
            </Button>
          </Card.Content>
        </Card>

        {/* Modal historial */}
        <Portal>
          <Modal
            visible={showModal}
            onDismiss={() => setShowModal(false)}
            contentContainerStyle={styles.modal}
          >
            <Text style={styles.modalTitle}>Todos los partidos de Mimis</Text>
            <FlatList
              data={matches}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <List.Item
                  title={`Mimis vs Partido ${item.matchNumber}`}
                  description={`Resultado: ${item.score} | ${new Date(
                    item.date
                  ).toLocaleDateString()}`}
                />
              )}
              ItemSeparatorComponent={Divider}
            />
            <Button
              mode="contained"
              style={{ marginTop: 12 }}
              onPress={() => setShowModal(false)}
            >
              Cerrar
            </Button>
          </Modal>
        </Portal>

        {/* --- NOTIFICACIONES --- */}
        <Text style={styles.sectionTitle}>🔔 Notificaciones activas</Text>
        <NotificationSetting
          selectedItems={selectedTeamSettings}
          handleToggle={handleTeamToggle}
          list={equipos}
          labelDescription="Equipo"
          settingSelectedTitle="Equipos Seleccionados"
          selectedSettingsValue={selectedTeamSettingsValue}
          handleChange={handleTeamChange}
          action={actionNotification}
        />
        <NotificationSetting
          selectedItems={selectedPlayerSettings}
          handleToggle={handlePlayerToggle}
          list={jugadores}
          labelDescription="Jugador"
          settingSelectedTitle="Jugadores Seleccionados"
          selectedSettingsValue={selectedPlayerSettingsValue}
          handleChange={handlePlayerChange}
          action={actionNotification}
        />

        {/* --- FAVORITOS --- */}
        <ScrollSection
          title="🏟️ Equipos seguidos"
          list={equipos}
          shape="square"
          action={(id) => handleTeam(id)}
        />
        <ScrollSection
          title="👟 Jugadores que sigues"
          list={jugadores}
          shape="circle"
          action={(id) => handlePlayer(id)}
        />
        <ScrollSection
          title="🌍 Ligas seguidas"
          list={ligas}
          shape="square"
          action={(id) => handleLeague(id)}
        />
        <ScrollSection
          title="🎯 Entrenadores seguidos"
          list={entrenadores}
          shape="circle"
          action={(id) => handleCoach(id)}
        />

        {/* --- LOGROS --- */}
        <Card style={styles.section}>
          <Card.Title title="🏅 Logros" />
          <Card.Content>
            {user?.badges.map((b, i) => (
              <List.Item
                key={i}
                title={b}
                left={() => <Text style={{ fontSize: 20 }}>🏅</Text>}
              />
            ))}
          </Card.Content>
        </Card>

        {/* --- ACCIONES RÁPIDAS --- */}
        <Card style={styles.section}>
          <Card.Title title="⚡ Acciones rápidas" />
          <Card.Content>
            <Button
              mode="contained"
              icon="wallet"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('store')}
            >
              Redimir puntos
            </Button>
            <Button
              mode="contained"
              icon="dice-multiple"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('bets')}
            >
              Mis apuestas
            </Button>
          </Card.Content>
        </Card>

        {/* --- RETO A MIMIS --- */}
        <Card style={styles.section}>
          <Card.Title
            title="🏟️ Reta a nuestro equipo"
            subtitle="Demuestra tu talento en la sintética"
          />
          <Card.Content>
            <Text style={styles.infoText}>
              Para participar, completa los siguientes pasos:
            </Text>
            <List.Item
              title="Descargar la app y registrarte"
              left={() => <List.Icon icon="check-circle-outline" />}
            />
            <List.Item
              title="Compartir la app con 5 amigos"
              left={() => <List.Icon icon="share-variant" />}
            />
            <List.Item
              title="Suscribirte al canal de YouTube"
              left={() => <List.Icon icon="youtube" color="red" />}
            />
            <List.Item
              title="Comentar en un en vivo del canal"
              left={() => <List.Icon icon="comment-text" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerCard: { marginBottom: 16 },
  headerContent: { flexDirection: "row", alignItems: "center" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  statCard: { flex: 1, marginHorizontal: 4, alignItems: "center" },
  statIcon: { fontSize: 20 },
  statValue: {
    textAlign: "center",
    color: "#1DB954",
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 4,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  matchText: { marginVertical: 4, fontSize: 14 },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  actionBtn: {
    marginVertical: 6,
    backgroundColor: "#1DB954",
  },
  infoText: { marginVertical: 8, fontSize: 15 },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
});
