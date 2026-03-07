import { useAuth } from "@/hooks/AuthContext";
import { RootStackParamList, SearchResults } from "@/types";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import debounce from "lodash.debounce";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  Text,
  TextInput,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

type MainDrawerProps = {
  setOpenMainDrawer: React.Dispatch<React.SetStateAction<boolean>>;
};

type Role = "user" | "administrador";
type Level = "novato" | "intermedio" | "aficionado" | "leyenda";

type MenuItem = {
  label: string;
  icon: string;
  to: keyof RootStackParamList;
  roles?: Role[];
  levels?: Level[];
};

const menuItems: MenuItem[] = [
  { label: "Inicio", icon: "home-outline", to: "index" },
  { label: "Shorts", icon: "play-circle-outline", to: "shorts" },
  { label: "Top 10 Ligas", icon: "trophy-outline", to: "worldTop10Screen" },
  {
    label: "Top 10 Sintético",
    icon: "lightning-bolt-outline",
    to: "WeekSyntheticResumeVideos",
  },
  { label: "Buscar", icon: "magnify", to: "search" },
  { label: "Noticias", icon: "newspaper-variant-outline", to: "news" },
  {
    label: "Fichajes y Rumores",
    icon: "newspaper-variant-outline",
    to: "transferNews",
  },
  { label: "Resúmenes y Goles", icon: "soccer-field", to: "resumeAndGoals" },
  { label: "Entrevistas", icon: "microphone-outline", to: "interviews" },

  { label: "Favoritos", icon: "heart-outline", to: "favorites" },
  { label: "Equipos Seguidos", icon: "shield-outline", to: "favoriteTeams" },
  {
    label: "Jugadores Seguidos",
    icon: "account-star-outline",
    to: "favoritePlayers",
  },
  { label: "Predicciones", icon: "chart-bell-curve", to: "predictions" },
  { label: "Estadísticas", icon: "chart-line", to: "stats" },
  { label: "Selecciones y Torneos", icon: "earth", to: "countries" },

  { label: "Quiz Diario", icon: "brain", to: "quizDaily" },
  { label: "Datos Curiosos", icon: "lightbulb-on-outline", to: "funFacts" },

  { label: "Crear Apuesta", icon: "dice-multiple-outline", to: "createBet" },
  { label: "Mis Apuestas", icon: "ticket-outline", to: "bets" },

  { label: "Entrenamiento", icon: "dumbbell", to: "training" },

  { label: "Mi Perfil", icon: "account-circle-outline", to: "profile" },

  {
    label: "Subir Shorts",
    icon: "video-plus-outline",
    to: "loadShorts",
    roles: ["administrador"],
  },
  {
    label: "Subir Top 10 Ligas",
    icon: "upload-outline",
    to: "loadWorldResumeVideos",
    roles: ["administrador"],
  },
  {
    label: "Subir Top 10 Sintético",
    icon: "upload-outline",
    to: "loadSyntheticResumeVideos",
    roles: ["administrador"],
  },
  {
    label: "Cargar Quiz Diario",
    icon: "clipboard-plus-outline",
    to: "loadQuiz",
    roles: ["administrador"],
  },
  {
    label: "Cargar Dato Curioso",
    icon: "lightbulb-plus-outline",
    to: "loadFunFact",
    roles: ["administrador"],
  },

  {
    label: "Agregar Noticia",
    icon: "newspaper-plus",
    to: "addNews",
    roles: ["administrador", "user"],
  },

  {
    label: "Agregar (1x1)",
    icon: "playlist-plus",
    to: "loadOneByOne",
    roles: ["administrador"],
  },
];

export default function MainDrawer({ setOpenMainDrawer }: MainDrawerProps) {
  const { user } = useAuth();
  const { searchGlobal } = useFetch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentRoute = useNavigationState(
    (state) => state.routes[state.index].name,
  );

  const handleRoute = (to: keyof RootStackParamList) => {
    navigation.navigate(to);
  };

  const filteredMenu = menuItems.filter((item) => {
    if (!item.roles && !item.levels) return true;

    const roleAllowed =
      !item.roles || item.roles.includes((user?.role ?? "user") as Role);

    const levelAllowed =
      !item.levels || item.levels.includes((user?.level ?? "novato") as Level);

    return roleAllowed && levelAllowed;
  });

  const openYoutube = () => {
    Linking.openURL("https://youtube.com/@mimis_app_test");
  };

  const openInstagram = () => {
    Linking.openURL("https://instagram.com/mimis_app_test");
  };

  const openTiktok = () => {
    Linking.openURL("https://tiktok.com/@mimis_app_test");
  };

  const search = async (text: string) => {
    if (!text || text.length < 3) {
      setResults(null);
      return;
    }

    try {
      const { results, success } = await searchGlobal(text);

      if (success) {
        console.log(results);
        setResults(results);
      } else {
        setResults(null);
      }
    } catch (err) {
      setResults(null);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((text: string) => {
        search(text);
      }, 500),
    [],
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleSelect = (type: "player" | "team" | "league", item: any) => {
    if (type === "player") {
      navigation.navigate("player", { id: String(item.playerId) });
    }

    if (type === "team") {
      navigation.navigate("team", { id: item.teamId });
    }

    if (type === "league") {
      navigation.navigate("tournament", { id: item.league.id });
    }

    setResults(null);
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 999,
        flexDirection: "row",
      }}
    >
      {/* Drawer */}
      <View
        style={[
          sx({
            w: "72%",
            h: "100%",
            bg: colors.card,
          }) as ViewStyle,
          {
            borderTopRightRadius: radius.xl,
            borderBottomRightRadius: radius.xl,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            sx({
              py: 14,
              px: 16,
              bg: colors.primary,
            }) as ViewStyle,
          ]}
        >
          {/* Logo + Close */}
          <View
            style={sx({
              row: true,
              center: true,
              mb: 12,
            })}
          >
            <Image
              source={require("@/assets/logo/mimis-logo.png")}
              style={{
                width: 36,
                height: 36,
                marginRight: 10,
                resizeMode: "contain",
              }}
            />

            <Text
              style={[
                g.titleLarge,
                {
                  color: colors.textOnPrimary,
                  flex: 1,
                },
              ]}
            >
              MIMIS
            </Text>

            <IconButton
              icon="close"
              iconColor="#FFF"
              onPress={() => setOpenMainDrawer(false)}
            />
          </View>
        </View>

        <Divider style={sx({ mt: 12, mb: 12 })} />

        {/* Search */}
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 1,
            color: colors.textPrimary,
          }}
        />

        {results && (
          <View
            style={{
              position: "absolute",
              top: 140,
              left: 16,
              right: 16,
              backgroundColor: colors.card,
              borderRadius: 14,
              maxHeight: 340,
              zIndex: 9999,
              elevation: 12,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.08)",
              }}
            >
              <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
                Resultados
              </Text>

              <IconButton
                icon="close"
                size={18}
                onPress={() => {
                  setResults(null);
                  setQuery("");
                }}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Players */}
              {results.players?.length > 0 && (
                <>
                  <Text
                    style={{
                      paddingHorizontal: 12,
                      paddingTop: 10,
                      paddingBottom: 4,
                      fontWeight: "600",
                      color: colors.textSecondary,
                    }}
                  >
                    Jugadores
                  </Text>

                  {results.players.map((p: any) => (
                    <List.Item
                      key={p.playerId}
                      title={p.name}
                      titleStyle={{ fontSize: 14 }}
                      left={() => (
                        <Image
                          source={{ uri: p.photo }}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            marginLeft: 8,
                            marginRight: 6,
                          }}
                        />
                      )}
                      onPress={() => handleSelect("player", p)}
                    />
                  ))}
                </>
              )}

              {/* Teams */}
              {results.teams?.length > 0 && (
                <>
                  <Divider style={{ marginVertical: 4 }} />

                  <Text
                    style={{
                      paddingHorizontal: 12,
                      paddingTop: 6,
                      paddingBottom: 4,
                      fontWeight: "600",
                      color: colors.textSecondary,
                    }}
                  >
                    Equipos
                  </Text>

                  {results.teams.map((t: any) => (
                    <List.Item
                      key={t.teamId}
                      title={t.name}
                      titleStyle={{ fontSize: 14 }}
                      left={() => (
                        <Image
                          source={{ uri: t.logo }}
                          style={{
                            width: 28,
                            height: 28,
                            marginLeft: 10,
                            marginRight: 6,
                            resizeMode: "contain",
                          }}
                        />
                      )}
                      onPress={() => handleSelect("team", t)}
                    />
                  ))}
                </>
              )}

              {/* Leagues */}
              {results.leagues?.length > 0 && (
                <>
                  <Divider style={{ marginVertical: 4 }} />

                  <Text
                    style={{
                      paddingHorizontal: 12,
                      paddingTop: 6,
                      paddingBottom: 4,
                      fontWeight: "600",
                      color: colors.textSecondary,
                    }}
                  >
                    Ligas
                  </Text>

                  {results.leagues.map((l: any) => (
                    <List.Item
                      key={l.league.id}
                      title={l.league.name}
                      description={l.country?.name}
                      titleStyle={{ fontSize: 14 }}
                      descriptionStyle={{ fontSize: 12 }}
                      left={() => (
                        <Image
                          source={{
                            uri: l.league?.logo || l.country?.flag,
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            marginLeft: 10,
                            marginRight: 6,
                            resizeMode: "contain",
                          }}
                        />
                      )}
                      onPress={() => handleSelect("league", l)}
                    />
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        )}

        {/* Menu */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={sx({ flex: 1 })}
          contentContainerStyle={sx({ px: 8, py: 12 })}
        >
          <Drawer.Section>
            {filteredMenu.map((item, index) => {
              const isActive = currentRoute === item.to;
              return (
                <List.Item
                  key={index}
                  title={item.label}
                  onPress={() => {
                    handleRoute(item.to);
                    setOpenMainDrawer(false);
                  }}
                  left={() => (
                    <List.Icon
                      icon={item.icon}
                      color={isActive ? "#FFF" : colors.textSecondary}
                    />
                  )}
                  style={[
                    sx({
                      r: 8,
                      px: 6,
                    }) as ViewStyle,
                    isActive && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  titleStyle={[
                    {
                      color: isActive ? "#FFF" : colors.textPrimary,
                    },
                  ]}
                />
              );
            })}
          </Drawer.Section>
        </ScrollView>

        {/* Social Media */}
        <Divider style={sx({ mt: 8 })} />

        <View
          style={sx({
            center: true,
            py: 10,
          })}
        >
          <Text style={[g.title, { color: colors.textSecondary }]}>
            Síguenos
          </Text>

          <View
            style={sx({
              row: true,
              center: true,
            })}
          >
            <IconButton
              icon="youtube"
              size={28}
              iconColor={colors.primary}
              onPress={openYoutube}
            />

            <IconButton
              icon="instagram"
              size={28}
              iconColor={colors.primary}
              onPress={openInstagram}
            />

            <IconButton
              icon="music-note"
              size={28}
              iconColor={colors.primary}
              onPress={openTiktok}
            />
          </View>
        </View>
      </View>

      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={() => setOpenMainDrawer(false)}>
        <View
          style={sx({
            flex: 1,
            bg: "rgba(0,0,0,0.5)",
          })}
        />
      </TouchableWithoutFeedback>
    </View>
  );
}
