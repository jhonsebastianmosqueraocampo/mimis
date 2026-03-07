import { useAuth } from "@/hooks/AuthContext";
import { useInside } from "@/hooks/InsideContext";
import { ProductStore, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import {
  findNodeHandle,
  Linking,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";
import { Appbar, Badge, Button, Divider, Menu } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

import { colors } from "@/theme/colors";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

import Loading from "./Loading";
import MainDrawer from "./MainDrawer";
import NotificationDrawer from "./NotificationDrawer";

type menuItemsPros = {
  label: string;
  to: keyof RootStackParamList;
};

const menuItems: menuItemsPros[] = [
  { label: "Mi perfil", to: "profile" },
  { label: "Partidos en vivo", to: "index" },
  { label: "Equipos seguidos", to: "favoriteTeams" },
  { label: "Jugadores seguidos", to: "favoritePlayers" },
  { label: "Mis Compras", to: "purchaseHistory" },
];

type MainMenuProps = {
  productsStore: ProductStore[];
};

export default function MainMenu({ productsStore }: MainMenuProps) {
  const { user } = useAuth();
  const { logout } = useAuth();
  const { notifications, markAllAsRead } = useInside();

  const [openMainDrawer, setOpenMainDrawer] = useState(false);
  const [active, setActive] = useState("index");
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const [visibleNotifications, setVisibleNotifications] = useState(false);

  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const iconRef = useRef<View>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const openMenu = () => {
    const handle = findNodeHandle(iconRef.current);

    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setAnchor({ x: pageX, y: pageY });
        setVisibleMenu(true);
      });
    }
  };

  const closeMenu = () => setVisibleMenu(false);

  const handleSetDrawer = async () => {
    try {
      const url = "https://www.youtube.com/@ElChiringuitoTV";
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error abriendo YouTube:", error);
    }
  };

  const logoutSession = () => {
    closeMenu();
    logout();
    navigation.navigate("login");
  };

  const handleRoute = (to: keyof RootStackParamList) => {
    closeMenu();
    setActive(to);
    navigation.navigate(to);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const cartCount = productsStore.length;

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <>
      <Appbar.Header
        style={[
          sx({
            bg: colors.primary,
          }) as any,
        ]}
      >
        <Appbar.Action
          icon="menu"
          color="#FFF"
          onPress={() => setOpenMainDrawer(true)}
        />

        <Appbar.Content
          title="MIMIS"
          titleStyle={[
            g.titleLarge,
            {
              color: "#FFF",
              textAlign: "center",
            },
          ]}
        />

        <Appbar.Action
          icon="television"
          color="#FFF"
          onPress={handleSetDrawer}
        />

        {/* NOTIFICATIONS */}
        <View style={sx({ mr: 8 })}>
          <Appbar.Action
            icon="bell-outline"
            color="#FFF"
            onPress={() => {
              setVisibleNotifications(true);
              markAllAsRead();
            }}
          />

          <Badge
            visible={unreadCount > 0}
            style={[
              sx({
                bg: colors.error,
              }) as any,
              {
                position: "absolute",
                top: 4,
                right: 4,
              },
            ]}
          >
            {unreadCount}
          </Badge>
        </View>

        {/* CART */}
        <View style={sx({ mr: 8 })}>
          <Appbar.Action
            icon="cart-outline"
            color="#FFF"
            onPress={() => navigation.navigate("cart")}
          />

          <Badge
            visible={cartCount > 0}
            style={[
              sx({
                bg: colors.error,
              }) as any,
              {
                position: "absolute",
                top: 4,
                right: 4,
              },
            ]}
          >
            {cartCount}
          </Badge>
        </View>

        {/* USER MENU */}
        <View ref={iconRef}>
          <Appbar.Action
            icon="account-circle"
            color="#FFF"
            onPress={openMenu}
          />

          <Menu
            visible={visibleMenu}
            onDismiss={closeMenu}
            anchor={anchor}
            contentStyle={[
              sx({
                bg: colors.card,
                r: 12,
                py: 8,
                px: 4,
              }) as any,
            ]}
          >
            {/* USER BOX */}
            <Pressable
              style={
                sx({
                  row: true,
                  items: "center",
                  px: 12,
                  pb: 12,
                }) as any
              }
              onPress={() => handleRoute("store")}
            >
              <View
                style={[
                  sx({
                    w: 42,
                    h: 42,
                    r: 21,
                    center: true,
                    bg: colors.primary,
                    mr: 10,
                  }) as any,
                ]}
              >
                <Text style={[g.subtitle, { color: "#FFF" }]}>
                  {user?.points}
                </Text>
              </View>

              <View>
                <Text style={g.subtitle}>Puntos</Text>
                <Text style={g.small}>¡Sigue sumando!</Text>
              </View>
            </Pressable>

            <Divider />

            <ScrollView style={{ maxHeight: 250 }}>
              {menuItems.map(({ label, to }, index) => (
                <Pressable key={index} onPress={() => handleRoute(to)}>
                  <Text
                    style={[
                      g.body,
                      sx({
                        py: 12,
                        px: 16,
                      }) as any,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Divider />

            <Button
              mode="outlined"
              icon="logout"
              onPress={logoutSession}
              textColor={colors.error}
              style={[
                sx({
                  mx: 12,
                  mt: 8,
                }) as any,
              ]}
            >
              Cerrar sesión
            </Button>
          </Menu>
        </View>
      </Appbar.Header>

      {openMainDrawer && <MainDrawer setOpenMainDrawer={setOpenMainDrawer} />}

      <NotificationDrawer
        open={visibleNotifications}
        setOpen={setVisibleNotifications}
      />
    </>
  );
}
