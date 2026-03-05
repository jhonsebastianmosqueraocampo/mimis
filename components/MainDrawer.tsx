import { useAuth } from "@/hooks/AuthContext";
import { RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ScrollView,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { Divider, Drawer, IconButton, List, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

type MainDrawerProps = {
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
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
  { label: "Noticias", icon: "newspaper-variant-outline", to: "news" },
  {
    label: "Fichajes y Rumores",
    icon: "newspaper-variant-outline",
    to: "transferNews",
  },
  { label: "Resúmenes y Goles", icon: "soccer-field", to: "resumeAndGoals" },
  { label: "Entrevistas", icon: "microphone-outline", to: "interviews" },
  { label: "Buscar", icon: "magnify", to: "search" },

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

export default function MainDrawer({
  active,
  setActive,
  setOpenMainDrawer,
}: MainDrawerProps) {
  const { user } = useAuth();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRoute = (to: keyof RootStackParamList) => {
    setActive(to);
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
              row: true,
              center: true,
              py: 16,
              px: 16,
              bg: colors.primary,
            }) as ViewStyle,
          ]}
        >
          <Text
            style={[
              g.titleLarge,
              {
                color: "#FFF",
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

        {/* Menu */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={sx({ flex: 1 })}
          contentContainerStyle={sx({ px: 8, py: 12 })}
        >
          <Divider style={sx({ mb: 12 })} />

          <Drawer.Section>
            {filteredMenu.map((item, index) => {
              const isActive = active === item.to;

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
