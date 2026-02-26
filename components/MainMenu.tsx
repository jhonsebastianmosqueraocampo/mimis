import { useAuth } from "@/hooks/AuthContext";
import { useFetch } from "@/hooks/FetchContext";
import { useInside } from "@/hooks/InsideContext";
import { ProductStore, RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  findNodeHandle,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { Appbar, Badge, Button, Divider, Menu } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
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
  const { getUserPoints } = useFetch();
  const { logout } = useAuth();
  const { notifications, markAllAsRead } = useInside();
  const [openMainDrawer, setOpenMainDrawer] = useState(false);
  const [active, setActive] = useState("index");
  const [visible, setVisible] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const iconRef = useRef<View>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let mounted = true;
    const loadUserPoints = async () => {
      setLoading(true);
      try {
        const { success, points, message } = await getUserPoints();
        if (!mounted) return;
        if (success) {
          setUserPoints(points);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    loadUserPoints();

    return () => {
      mounted = false;
    };
  }, []);

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

  const openDrawer = () => setVisible(true);

  const handleSetDrawer = async () => {
    try {
      const url = "https://www.youtube.com/@ElChiringuitoTV"; // canal de prueba
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
    return (
      <Loading
        visible={loading}
        title="Cargando paises"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: "#1DB954",
          elevation: 10,
        }}
      >
        <Appbar.Action
          icon="menu"
          color={"#FFF"}
          onPress={() => setOpenMainDrawer(true)}
        />
        <Appbar.Content
          title="MIMIS"
          titleStyle={{
            color: "#FFF",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}
        />
        <Appbar.Action
          icon="television"
          color={"#FFF"}
          onPress={handleSetDrawer}
        />
        <View style={styles.iconContainer}>
          <Appbar.Action
            icon="bell-outline"
            color={"#FFF"}
            onPress={() => {
              openDrawer;
              markAllAsRead();
            }}
          />
          <Badge style={styles.badge} visible={unreadCount > 0}>
            {unreadCount}
          </Badge>
        </View>
        <View style={styles.iconContainer}>
          <Appbar.Action
            icon="cart-outline"
            color="#FFF"
            onPress={() => navigation.navigate("cart")}
          />
          <Badge style={styles.badge} visible={cartCount > 0}>
            {cartCount}
          </Badge>
        </View>
        <View ref={iconRef}>
          <Appbar.Action
            icon="account-circle"
            color={"#FFF"}
            onPress={openMenu}
          />
          <Menu
            visible={visibleMenu}
            onDismiss={closeMenu}
            anchor={anchor}
            contentStyle={styles.menuContent}
          >
            <Pressable
              style={styles.userBox}
              onPress={() => handleRoute("store")}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userPoints}</Text>
              </View>
              <View>
                <Text style={styles.points}>Puntos</Text>
                <Text style={styles.subtext}>¡Sigue sumando!</Text>
              </View>
            </Pressable>

            <Divider />
            <ScrollView style={{ maxHeight: 250 }}>
              {menuItems.map(({ label, to }, index) => (
                <Pressable key={index} onPress={() => handleRoute(to)}>
                  <Text style={styles.menuItem}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Divider />
            <Button
              mode="outlined"
              onPress={() => {
                logoutSession();
                // cerrar sesión
              }}
              style={styles.logoutButton}
              textColor="#e53935"
              icon="logout"
            >
              Cerrar sesión
            </Button>
          </Menu>
        </View>
      </Appbar.Header>
      {openMainDrawer && (
        <MainDrawer
          active={active}
          setActive={setActive}
          setOpenMainDrawer={setOpenMainDrawer}
        />
      )}
      <NotificationDrawer open={visible} setOpen={setVisible} />
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    marginRight: 8,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#e53935", // rojo alerta
    color: "white",
    fontSize: 10,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 0,
  },
  menuContent: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 220,
  },
  userBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 3,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "BubbleSans",
  },
  points: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "liter",
  },
  subtext: {
    fontSize: 12,
    color: "#666",
    fontFamily: "liter",
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontWeight: "500",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: "#e53935",
    marginHorizontal: 12,
    borderRadius: 4,
  },
});
