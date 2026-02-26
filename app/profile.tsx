import Loading from "@/components/Loading";
import NotificationSetting from "@/components/NotificationSettings";
import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList, swiperItem, SyntheticMatch, User } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Modal,
  Portal,
  ProgressBar,
  Text,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

const levelBenefits: Record<string, string[]> = {
  Novato: [
    "Acceso a contenido y partidos",
    "Participar en apuestas",
    "Ganar puntos en la app",
  ],
  Intermedio: ["Publicar noticias deportivas", "Subir jugadas de sintética"],
  Aficionado: [
    "Jugar partidos sintéticos oficiales",
    "Calificar partidos",
    "Participar en eventos especiales",
  ],
  Leyenda: [
    "Badge exclusivo Leyenda",
    "Acceso VIP a eventos MIMIS",
    "Participación destacada en retransmisiones",
    "Comunicación directa con el equipo MIMIS",
  ],
};

export default function Profile() {
  const {
    getFavorites,
    getSyntheticMatches,
    getUser,
    invitationSyntheticMatch,
  } = useFetch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Estados de favoritos
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [ligas, setLigas] = useState<swiperItem[]>([]);
  const [entrenadores, setEntrenadores] = useState<swiperItem[]>([]);
  const [matches, setMatches] = useState<SyntheticMatch[]>([]);
  const [user, setUser] = useState<User>();
  const [matchFilter, setMatchFilter] = useState<"scheduled" | "finished">(
    "scheduled",
  );
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

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState<"success" | "error">("success");

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
            })),
          );
          setJugadores(
            players.map((p: any) => ({
              id: p.id.toString(),
              title: p.title,
              img: p.img,
              pathTo: `/player/${p.id}`,
            })),
          );
          setLigas(
            leagues.map((l: any) => ({
              id: l.id.toString(),
              title: l.title,
              img: l.img,
              pathTo: `/league/${l.id}`,
            })),
          );
          setEntrenadores(
            coaches.map((c: any) => ({
              id: c.id.toString(),
              title: c.title,
              img: c.img,
              pathTo: `/coach/${c.id}`,
            })),
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
        const { success, matches } = await getSyntheticMatches();
        if (!mounted) return;
        if (success) {
          setMatches(matches);
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

  const scheduledMatches = matches.filter((m) => m.status === "scheduled");

  const finishedMatches = matches.filter((m) => m.status === "finished");

  const filteredMatches =
    matchFilter === "scheduled" ? scheduledMatches : finishedMatches;

  const allMatches = [...scheduledMatches, ...finishedMatches];

  // Handlers notificaciones
  const handleTeamChange = (event: string) => {
    setSelectedTeamSettingsValue(event);
    if (event === "todos") setSelectedTeamSettings(equipos);
  };
  const handleTeamToggle = (team: swiperItem) => {
    setSelectedTeamSettings((prev) =>
      prev.find((t) => t.id === team.id)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team],
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
        : [...prev, player],
    );
  };
  const actionNotification = (id: string) => console.log(id);

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  const handlePlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  const handleCoach = (id: string) => {
    navigation.navigate("coach", { id });
  };

  const handleLeague = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  const handleJoinMatch = async () => {
    try {
      const { success, message } = await invitationSyntheticMatch();

      if (success) {
        setSnackType("success");
        setSnackMessage(message || "Invitación enviada correctamente ⚽");
      } else {
        setSnackType("error");
        setSnackMessage(message || "No se pudo enviar la invitación");
      }
    } catch (error) {
      setSnackType("error");
      setSnackMessage("Error inesperado. Intenta nuevamente.");
    } finally {
      setSnackVisible(true);
    }
  };

  const handleWhatsApp = () => {
    const phone = "573001234567"; // tu número real
    const message = encodeURIComponent(
      `Hola equipo MIMIS, soy ${safeUser?.nickName} (Leyenda) ⚽`,
    );

    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const handleLegendGroup = () => {
    const groupLink = "https://chat.whatsapp.com/TU_LINK_AQUI";
    Linking.openURL(groupLink);
  };

  const safeUser: User = user ?? ({} as User);

  const betsWon = safeUser?.betsWon ?? 0;
  const betsLost = safeUser?.betsLost ?? 0;
  const redeemed = safeUser?.redeemed ?? 0;
  const xp = safeUser?.xp ?? 0;
  const level = safeUser?.level ?? "Novato";
  const badges = safeUser?.badges ?? [];

  const communityStats = safeUser?.communityStats;

  const winRate =
    betsWon + betsLost > 0
      ? Math.round((betsWon / (betsWon + betsLost)) * 100)
      : 0;

  const nextLevelXP =
    level === "Novato"
      ? 1000
      : level === "Intermedio"
        ? 5000
        : level === "Aficionado"
          ? 10000
          : null;

  const progress = nextLevelXP ? xp / nextLevelXP : 1;

  const benefits = levelBenefits[level] ?? [];

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
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
                  safeUser?.nickName || "Usuario",
                )}&background=1DB954&color=fff`,
              }}
            />

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="titleLarge">
                {safeUser?.nickName || "Usuario"}
              </Text>

              {level === "Leyenda" && (
                <Chip
                  icon="star"
                  style={{ marginTop: 6, backgroundColor: "#FFD70020" }}
                  textStyle={{ color: "#B8860B", fontWeight: "bold" }}
                >
                  👑 Leyenda MIMIS
                </Chip>
              )}

              <Text variant="bodyMedium" style={{ color: "#666" }}>
                Nivel {level}
              </Text>

              <Text variant="bodySmall" style={{ color: "#888" }}>
                {xp} XP acumulados
              </Text>

              <Text
                variant="titleMedium"
                style={{ color: "#1DB954", marginTop: 4 }}
              >
                {safeUser?.points ?? 0} pts disponibles
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="🎖 Beneficios de tu nivel" />
          {level === "Leyenda" && (
            <>
              <Button
                mode="contained"
                icon="whatsapp"
                style={{ marginTop: 10, backgroundColor: "#25D366" }}
                onPress={handleWhatsApp}
              >
                Contactar equipo MIMIS
              </Button>

              <Button
                mode="outlined"
                icon="account-group"
                style={{ marginTop: 8 }}
                onPress={handleLegendGroup}
              >
                Grupo exclusivo Leyendas
              </Button>

              <Text style={{ fontSize: 12, marginTop: 6, color: "#666" }}>
                Espacio privado para Leyendas activas de la comunidad.
              </Text>
            </>
          )}
          <Card.Content>
            {benefits.map((b, i) => (
              <List.Item
                key={i}
                title={b}
                left={() => (
                  <List.Icon icon="check-circle-outline" color="#1DB954" />
                )}
              />
            ))}
          </Card.Content>
        </Card>

        {nextLevelXP && (
          <>
            <ProgressBar progress={progress} color="#1DB954" />
            <Text style={{ fontSize: 12, marginTop: 4 }}>
              {xp} / {nextLevelXP} XP para el siguiente nivel
            </Text>
          </>
        )}

        {/* --- STATS --- */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statIcon, { color: "#1DB954" }]}>🏆</Text>
            <Text style={styles.statValue}>{user?.betsWon}</Text>
            <Text style={styles.statLabel}>Apuestas ganadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statIcon, { color: "#42A5F5" }]}>📊</Text>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Winrate</Text>
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

        <Card style={styles.section}>
          <Card.Title title="🌍 Participación en la comunidad" />
          <Card.Content>
            <List.Item
              title={`📰 Noticias publicadas: ${communityStats?.newsPublished ?? 0}`}
            />
            <List.Item
              title={`🎬 Jugadas subidas: ${communityStats?.highlightsUploaded ?? 0}`}
            />
            <List.Item
              title={`🏟️ Partidos oficiales jugados: ${communityStats?.officialMatchesPlayed ?? 0}`}
            />
            <List.Item
              title={`⭐ Partidos calificados: ${communityStats?.matchesRated ?? 0}`}
            />
          </Card.Content>
        </Card>

        {/* --- HISTORIAL MIMIS --- */}
        <Card style={styles.section}>
          <Card.Title title="⚽ Historial MIMIS" />

          <Card.Content>
            {/* Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <Chip
                selected={matchFilter === "scheduled"}
                onPress={() => setMatchFilter("scheduled")}
              >
                📅 Próximos
              </Chip>

              <Chip
                selected={matchFilter === "finished"}
                onPress={() => setMatchFilter("finished")}
              >
                ✅ Finalizados
              </Chip>
            </ScrollView>

            {/* Lista */}
            {filteredMatches.slice(0, 5).length === 0 ? (
              <Text style={styles.emptyText}>
                No hay partidos en este estado
              </Text>
            ) : (
              filteredMatches.slice(0, 5).map((m) => (
                <View key={m.id} style={styles.matchRow}>
                  <Text style={styles.matchTeams}>
                    {m.homeTeam?.name || "TBD"} vs {m.awayTeam?.name || "TBD"}
                  </Text>

                  <Text style={styles.matchMeta}>
                    {m.status === "finished"
                      ? `Resultado: ${
                          m.score?.home ?? "-"
                        } - ${m.score?.away ?? "-"}`
                      : m.scheduledAt
                        ? `Fecha: ${new Date(m.scheduledAt).toLocaleDateString()}`
                        : "Fecha pendiente"}
                  </Text>
                </View>
              ))
            )}

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
            <Text style={styles.modalTitle}>⚽ Todos los partidos MIMIS</Text>

            <FlatList
              data={allMatches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Item
                  title={`${item.homeTeam?.name || "TBD"} vs ${
                    item.awayTeam?.name || "TBD"
                  }`}
                  description={
                    item.status === "finished"
                      ? `Resultado: ${
                          item.score?.home ?? "-"
                        } - ${item.score?.away ?? "-"}`
                      : item.scheduledAt
                        ? `📅 ${new Date(item.scheduledAt).toLocaleString()}`
                        : "Fecha pendiente"
                  }
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
        {equipos.length > 0 && (
          <ScrollSection
            title="🏟️ Equipos seguidos"
            list={equipos}
            shape="circle"
            action={(id) => handleTeam(id)}
          />
        )}

        {jugadores.length > 0 && (
          <ScrollSection
            title="👟 Jugadores que sigues"
            list={jugadores}
            shape="circle"
            action={(id) => handlePlayer(id)}
          />
        )}

        {ligas.length > 0 && (
          <ScrollSection
            title="🌍 Ligas seguidas"
            list={ligas}
            shape="circle"
            action={(id) => handleLeague(id)}
          />
        )}

        {entrenadores.length > 0 && (
          <ScrollSection
            title="🎯 Entrenadores seguidos"
            list={entrenadores}
            shape="circle"
            action={(id) => handleCoach(id)}
          />
        )}

        {/* --- LOGROS --- */}
        <Card style={styles.section}>
          <Card.Title title="🏅 Logros" />
          <Card.Content>
            {badges.length === 0 ? (
              <Text style={styles.emptyText}>
                Aún no tienes logros desbloqueados.
              </Text>
            ) : (
              badges.map((b, i) => (
                <List.Item
                  key={i}
                  title={b}
                  left={() => <Text style={{ fontSize: 20 }}>🏅</Text>}
                />
              ))
            )}
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
              onPress={() => navigation.navigate("store")}
            >
              Redimir puntos
            </Button>
            <Button
              mode="contained"
              icon="dice-multiple"
              style={styles.actionBtn}
              onPress={() => navigation.navigate("bets")}
            >
              Mis apuestas
            </Button>
          </Card.Content>
        </Card>

        {/* --- RETO A MIMIS --- */}
        <Card style={styles.section}>
          <Card.Title
            title="🏟️ Juega contra MIMIS"
            subtitle="Vive la experiencia en nuestra sintética"
          />
          <Card.Content>
            <Text style={styles.infoText}>
              Este espacio está reservado para quienes ya forman parte activa de
              nuestra comunidad futbolera.
            </Text>

            <List.Item
              title="Ser nivel Aficionado o superior"
              left={() => <List.Icon icon="star-circle-outline" />}
            />

            <List.Item
              title="Participar en la comunidad (noticias o jugadas)"
              left={() => <List.Icon icon="soccer" />}
            />

            <List.Item
              title="Haber vivido al menos un evento en la app"
              left={() => <List.Icon icon="account-group-outline" />}
            />

            <Text style={[styles.infoText, { marginTop: 10 }]}>
              No es un premio. Es una invitación a representar el espíritu del
              fútbol en MIMIS.
            </Text>
          </Card.Content>
          {user && (user.level === "Aficionado" || user.level === "Leyenda") ? (
            <Button mode="contained" onPress={handleJoinMatch}>
              Solicitar participación
            </Button>
          ) : (
            <Text style={styles.infoText}>
              Disponible a partir del nivel Aficionado ⚽
            </Text>
          )}
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
  chipsRow: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  chip: {
    backgroundColor: "#f4f4f4",
  },

  matchRow: {
    paddingVertical: 8,
  },

  matchTeams: {
    fontSize: 14,
    fontWeight: "600",
  },

  matchMeta: {
    fontSize: 12,
    color: "#666",
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 12,
  },
});
