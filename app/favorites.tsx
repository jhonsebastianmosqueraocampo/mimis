import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import * as Notifications from "expo-notifications";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Divider, Modal, Portal, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import Icon from "react-native-vector-icons/MaterialIcons";
import { v4 as uuidv4 } from "uuid";
import type {
  Favorites,
  NotificationItem,
  RootStackParamList,
  swiperItem,
} from "../types";
import PrivateLayout from "./privateLayout";

import Loading from "@/components/Loading";
import { useInside } from "@/hooks/InsideContext";
import registerPushToken from "@/utils/registerPushToken";
import {
  Notification,
  NotificationResponse,
  Subscription,
} from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Para mostrar alerta en iOS/Android
    shouldShowBanner: true, // Mostrar banner en iOS (nuevo)
    shouldShowList: true, // Aparece en el centro de notificaciones
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function favorites() {
  const { registerNotificationToken, saveFavorites, getFavorites } = useFetch();
  const { addNotification } = useInside();
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  const startNotification = async () => {
    await registerPushToken(registerNotificationToken);

    // Listener cuando app está en foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (notification: Notification) => {
          const newNotif: NotificationItem = {
            id: uuidv4(),
            title: notification.request.content.title ?? "⚽ Notificación",
            body: notification.request.content.body ?? "Sin mensaje",
            receivedAt: new Date(),
            read: false,
          };

          addNotification(newNotif);
        },
      );

    // Listener cuando usuario toca la notificación
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: NotificationResponse) => {
          console.log("👉 Notificación tocada:", response);
        },
      );

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  };

  useEffect(() => {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    startNotification();
  }, []);

  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [ligas, setLigas] = useState<swiperItem[]>([]);
  const [entrenadores, setEntrenadores] = useState<swiperItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [favoritosEditados, setFavoritosEditados] = useState({
    jugadores: [...jugadores],
    equipos: [...equipos],
    ligas: [...ligas],
    entrenadores: [...entrenadores],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;
    const getFavoriteList = async () => {
      setLoading(true);
      try {
        const { success, teams, players, coaches, leagues, message } =
          await getFavorites();
        if (!isMounted) return;

        if (success) {
          setEquipos(teams);
          setJugadores(players);
          setLigas(leagues);
          setEntrenadores(coaches);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getFavoriteList();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando favoritos"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const getFavoriteList = async () => {
    const data = await getFavorites();
    if (data.success) {
      const { teams, players, coaches, leagues } = data;
      setEquipos(teams);
      setJugadores(players);
      setLigas(leagues);
      setEntrenadores(coaches);
    }
  };

  const actionTeams = (id: string) => {
    navigation.navigate("team", { id });
  };

  const actionTournaments = (id: string) => {
    navigation.navigate("tournament", { id });
  };

  const actionPlayeres = (id: string) => {
    navigation.navigate("player", { id });
  };

  const actionCoaches = (id: string) => {
    navigation.navigate("coach", { id });
  };

  const showModal = () => {
    setFavoritosEditados({
      jugadores: [...jugadores],
      equipos: [...equipos],
      ligas: [...ligas],
      entrenadores: [...entrenadores],
    });
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setFavoritosEditados({
      jugadores: [...jugadores],
      equipos: [...equipos],
      ligas: [...ligas],
      entrenadores: [...entrenadores],
    });
  };

  const removeItem = (
    key: keyof typeof favoritosEditados,
    id: swiperItem["id"],
  ) => {
    setFavoritosEditados((prev) => ({
      ...prev,
      [key]: prev[key].filter((item: any) => item.id !== id),
    }));
  };

  const handleGuardar = async () => {
    const favoritos = getFavoritosFromEditados(favoritosEditados);

    const response = await saveFavorites(favoritos);

    if (response.success) {
      await getFavoriteList();
      setVisible(false);
    } else {
    }
  };

  const getFavoritosFromEditados = (
    editados: typeof favoritosEditados,
  ): Favorites => ({
    equipos: editados.equipos.map((e) => e.title),
    entrenadores: editados.entrenadores.map((e) => e.title),
    ligas: editados.ligas.map((e) => e.title),
    jugadores: editados.jugadores.map((e) => e.title),
  });

  const handleCancelar = () => {
    hideModal();
  };

  const handleAdd = () => {
    setVisible(false);
    navigation.navigate("selectFavorite");
  };

  return (
    <PrivateLayout>
      <Icon
        onPress={handleAdd}
        name="add"
        size={30}
        color="#1DB954"
        style={{ position: "absolute", top: 3, right: 50 }}
      />
      <Icon
        onPress={showModal}
        name="settings"
        size={30}
        color="#1DB954"
        style={{ position: "absolute", top: 3, right: 5 }}
      />
      {equipos && equipos.length > 0 && (
        <ScrollSection
          title="Mis Equipos seguidos"
          list={equipos}
          shape="circle"
          action={actionTeams}
        />
      )}
      <Divider />
      {jugadores && jugadores.length > 0 && (
        <ScrollSection
          title="Mis Jugadores seguidos"
          list={jugadores}
          shape="circle"
          action={actionPlayeres}
        />
      )}
      <Divider />
      {entrenadores && entrenadores.length > 0 && (
        <ScrollSection
          title="Mis Entrenadores seguidos"
          list={entrenadores}
          shape="circle"
          action={actionCoaches}
        />
      )}
      <Divider />
      {ligas && ligas.length > 0 && (
        <ScrollSection
          title="Ligas seguidas"
          list={ligas}
          shape="circle"
          action={actionTournaments}
        />
      )}
      <Divider />
      {equipos && equipos.length > 0 && (
        <ScrollSection
          title="Equipos más buscados"
          list={equipos}
          shape="circle"
          action={actionTeams}
        />
      )}
      <Divider />
      {jugadores && jugadores.length > 0 && (
        <ScrollSection
          title="Jugadores más buscados"
          list={jugadores}
          shape="circle"
          action={actionPlayeres}
        />
      )}
      <Divider />
      {jugadores && jugadores.length > 0 && (
        <ScrollSection
          title="Jugadores con mejores estadísticas"
          list={jugadores}
          shape="circle"
          action={actionPlayeres}
        />
      )}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Configura tus favoritos</Text>

              <ScrollView style={styles.scrollContent}>
                <Text style={styles.item}>- Equipos favoritos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalList}
                >
                  {favoritosEditados.equipos.map((equipo, index) => (
                    <View key={index} style={styles.playerCard}>
                      <Text style={styles.playerName}>{equipo.title}</Text>
                      <TouchableOpacity
                        onPress={() => removeItem("equipos", equipo.id)}
                        style={styles.removeBtn}
                      >
                        <Icon name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <Text style={styles.item}>- Ligas favoritas</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalList}
                >
                  {favoritosEditados.ligas.map((liga, index) => (
                    <View key={index} style={styles.playerCard}>
                      <Text style={styles.playerName}>{liga.title}</Text>
                      <TouchableOpacity
                        onPress={() => removeItem("ligas", liga.id)}
                        style={styles.removeBtn}
                      >
                        <Icon name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.item}>- Jugadores favoritos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalList}
                >
                  {favoritosEditados.jugadores.map((jugador, index) => (
                    <View key={index} style={styles.playerCard}>
                      <Text style={styles.playerName}>{jugador.title}</Text>
                      <TouchableOpacity
                        onPress={() => removeItem("jugadores", jugador.id)}
                        style={styles.removeBtn}
                      >
                        <Icon name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.item}>- Entrenadores favoritos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalList}
                >
                  {favoritosEditados.entrenadores.map((entrenador, index) => (
                    <View key={index} style={styles.playerCard}>
                      <Text style={styles.playerName}>{entrenador.title}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          removeItem("entrenadores", entrenador.id)
                        }
                        style={styles.removeBtn}
                      >
                        <Icon name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </ScrollView>

              {/* Botones al final */}
              <View style={{ gap: 12 }}>
                <View style={styles.singleButtonRow}>
                  <Button
                    mode="outlined"
                    onPress={handleAdd}
                    style={styles.button}
                  >
                    Agregar Favoritos
                  </Button>
                </View>

                <View style={styles.doubleButtonRow}>
                  <Button
                    mode="contained"
                    onPress={handleGuardar}
                    style={[styles.button, { flex: 1 }]}
                  >
                    Guardar
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleCancelar}
                    style={[styles.button, { flex: 1 }]}
                  >
                    Cancelar
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </PrivateLayout>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    maxHeight: "90%", // limita el alto para permitir scroll
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  scrollContent: {
    maxHeight: 400,
  },
  item: {
    fontSize: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  horizontalList: {
    marginBottom: 16,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    minWidth: 120,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  singleButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  doubleButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // si usas React Native >= 0.71 o un polyfill
  },
});
