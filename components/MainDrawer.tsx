import { useAuth } from "@/hooks/AuthContext";
import { theme } from "@/theme";
import { RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Divider, Drawer, IconButton, List } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

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
  // =========================
  // PRINCIPAL
  // =========================
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

  // =========================
  // INTERACCIÓN
  // =========================
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

  // =========================
  // ECONOMÍA
  // =========================
  { label: "Crear Apuesta", icon: "dice-multiple-outline", to: "createBet" },
  { label: "Mis Apuestas", icon: "ticket-outline", to: "bets" },

  // =========================
  // ENTRENAMIENTO
  // =========================
  { label: "Entrenamiento", icon: "dumbbell", to: "training" },

  // =========================
  // PERFIL
  // =========================
  { label: "Mi Perfil", icon: "account-circle-outline", to: "profile" },

  // =========================
  // ADMIN / PERMISOS ESPECIALES
  // =========================

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
    label: "Agregar (1x1)",
    icon: "playlist-plus",
    to: "loadOneByOne",
    roles: ["administrador"],
  },
  {
    label: "Agregar Noticia",
    icon: "newspaper-plus",
    to: "addNews",
    roles: ["administrador", "user"],
    levels: ["intermedio", "aficionado", "leyenda"],
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
    // Si no tiene restricción, mostrar
    if (!item.roles && !item.levels) return true;

    // Validar role
    const roleAllowed =
      !item.roles || item.roles.includes((user?.role ?? "user") as Role);

    // Validar level
    const levelAllowed =
      !item.levels || item.levels.includes((user?.level ?? "novato") as Level);

    return roleAllowed && levelAllowed;
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={styles.title}>MIMIS</Text>
          <IconButton
            icon="close"
            iconColor="#fff"
            size={24}
            onPress={() => setOpenMainDrawer(false)}
          />
        </View>

        {/* ✅ Scroll que ocupa toda la pantalla */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#aaa"
            style={[styles.input, { borderColor: theme.colors.outline }]}
          /> */}

          <Divider style={{ marginVertical: 12 }} />

          <Drawer.Section>
            {filteredMenu.map((item, index) => {
              const isActive = active === item.to;
              return (
                <List.Item
                  key={index}
                  title={item.label}
                  left={() => (
                    <List.Icon
                      icon={item.icon}
                      color={
                        isActive ? "#FFF" : theme.colors.backgroundElements
                      }
                    />
                  )}
                  onPress={() => {
                    setActive(item.to);
                    handleRoute(item.to);
                    setOpenMainDrawer(false);
                  }}
                  style={{
                    backgroundColor: isActive
                      ? theme.colors.backgroundElements
                      : "transparent",
                    borderRadius: 7,
                    paddingHorizontal: 10,
                  }}
                  titleStyle={{ color: isActive ? "#FFF" : theme.colors.text }}
                />
              );
            })}
          </Drawer.Section>
        </ScrollView>
      </View>

      <TouchableWithoutFeedback onPress={() => setOpenMainDrawer(false)}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%", // ✅ ocupa todo el alto
    width: "100%",
    zIndex: 999,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  drawer: {
    width: "70%",
    backgroundColor: theme.colors.backgroundElements,
    paddingTop: 29,
    height: "100%", // ✅ el drawer ocupa toda la pantalla
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  scrollContent: {
    flexGrow: 1, // ✅ asegura que el scroll ocupe 100% si el contenido es corto
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#000",
    backgroundColor: "#fff",
  },
});
