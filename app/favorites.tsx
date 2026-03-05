import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import * as Notifications from "expo-notifications";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
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

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

export default function Favorites() {
  const { registerNotificationToken, saveFavorites, getFavorites } = useFetch();
  const { addNotification } = useInside();

  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [ligas, setLigas] = useState<swiperItem[]>([]);
  const [entrenadores, setEntrenadores] = useState<swiperItem[]>([]);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [favoritosEditados, setFavoritosEditados] = useState({
    jugadores: [] as swiperItem[],
    equipos: [] as swiperItem[],
    ligas: [] as swiperItem[],
    entrenadores: [] as swiperItem[],
  });

  /* =============================
     PUSH NOTIFICATIONS
  ============================= */

  const startNotification = async () => {
    await registerPushToken(registerNotificationToken);

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

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: NotificationResponse) => {
          console.log("👉 Notificación tocada:", response);
        },
      );
  };

  useEffect(() => {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });

    startNotification();
  }, []);

  /* =============================
     CARGAR FAVORITOS
  ============================= */

  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      setLoading(true);

      const { success, teams, players, coaches, leagues } =
        await getFavorites();

      if (!mounted) return;

      if (success) {
        setEquipos(teams);
        setJugadores(players);
        setLigas(leagues);
        setEntrenadores(coaches);
      }

      setLoading(false);
    };

    loadFavorites();

    return () => {
      mounted = false;
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

  /* =============================
     ACCIONES
  ============================= */

  const actionTeams = (id: string) => navigation.navigate("team", { id });
  const actionPlayers = (id: string) => navigation.navigate("player", { id });
  const actionCoaches = (id: string) => navigation.navigate("coach", { id });
  const actionLeagues = (id: string) =>
    navigation.navigate("tournament", { id });

  const showModal = () => {
    setFavoritosEditados({
      jugadores: [...jugadores],
      equipos: [...equipos],
      ligas: [...ligas],
      entrenadores: [...entrenadores],
    });

    setVisible(true);
  };

  const removeItem = (key: keyof typeof favoritosEditados, id: string) => {
    setFavoritosEditados((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item.id !== id),
    }));
  };

  const handleGuardar = async () => {
    const favoritos: Favorites = {
      equipos: favoritosEditados.equipos.map((e) => e.title),
      ligas: favoritosEditados.ligas.map((e) => e.title),
      jugadores: favoritosEditados.jugadores.map((e) => e.title),
      entrenadores: favoritosEditados.entrenadores.map((e) => e.title),
    };

    const res = await saveFavorites(favoritos);

    if (res.success) {
      setVisible(false);
    }
  };

  const handleAdd = () => {
    setVisible(false);
    navigation.navigate("selectFavorite");
  };

  return (
    <PrivateLayout>
      {/* ICONOS SUPERIORES */}
      <View
        style={[
          sx({ row: true }) as any,
          { position: "absolute", right: 10, top: 5 },
        ]}
      >
        <Icon name="add" size={28} color={colors.primary} onPress={handleAdd} />

        <Icon
          name="settings"
          size={28}
          color={colors.primary}
          style={{ marginLeft: 16 }}
          onPress={showModal}
        />
      </View>

      {/* SECCIONES */}
      {equipos.length > 0 && (
        <ScrollSection
          title="Mis Equipos seguidos"
          list={equipos}
          shape="circle"
          action={actionTeams}
        />
      )}

      <Divider />

      {jugadores.length > 0 && (
        <ScrollSection
          title="Mis Jugadores seguidos"
          list={jugadores}
          shape="circle"
          action={actionPlayers}
        />
      )}

      <Divider />

      {entrenadores.length > 0 && (
        <ScrollSection
          title="Mis Entrenadores seguidos"
          list={entrenadores}
          shape="circle"
          action={actionCoaches}
        />
      )}

      <Divider />

      {ligas.length > 0 && (
        <ScrollSection
          title="Ligas seguidas"
          list={ligas}
          shape="circle"
          action={actionLeagues}
        />
      )}

      {/* =============================
         MODAL CONFIGURACIÓN
      ============================= */}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{
            backgroundColor: colors.card,
            margin: 20,
            borderRadius: radius.lg,
            padding: 16,
          }}
        >
          <Card style={[shadows.sm]}>
            <Card.Content>
              <Text
                style={[g.subtitle, { textAlign: "center", marginBottom: 12 }]}
              >
                Configura tus favoritos
              </Text>

              <ScrollView style={{ maxHeight: 400 }}>
                {Object.entries(favoritosEditados).map(([key, list]) => (
                  <View key={key} style={{ marginBottom: 16 }}>
                    <Text style={[g.body, { marginBottom: 6 }]}>
                      {key.toUpperCase()}
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {list.map((item, index) => (
                        <View
                          key={index}
                          style={[
                            sx({ row: true, center: true }) as any,
                            {
                              backgroundColor: colors.background,
                              borderRadius: radius.md,
                              padding: 8,
                              marginRight: 8,
                            },
                          ]}
                        >
                          <Text style={g.caption}>{item.title}</Text>

                          <TouchableOpacity
                            onPress={() => removeItem(key as any, item.id)}
                          >
                            <Icon name="close" size={16} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </ScrollView>

              {/* BOTONES */}
              <Button
                mode="outlined"
                onPress={handleAdd}
                style={{ marginBottom: 10 }}
              >
                Agregar favoritos
              </Button>

              <View style={[sx({ row: true }) as any]}>
                <Button
                  mode="contained"
                  onPress={handleGuardar}
                  style={{ flex: 1, marginRight: 8 }}
                >
                  Guardar
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setVisible(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </PrivateLayout>
  );
}
