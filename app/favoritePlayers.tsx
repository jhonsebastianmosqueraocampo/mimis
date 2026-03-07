import Loading from "@/components/Loading";
import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList, swiperItem } from "@/types";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Divider } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function FavoritePlayers() {
  const { getFavorites } = useFetch();
  const [jugadores, setJugadores] = useState<swiperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;
    const getFavoriteList = async () => {
      setLoading(true);
      try {
        const { success, players, message } = await getFavorites();
        if (!isMounted) return;

        if (success) {
          setJugadores(players);
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
    return <Loading visible={loading} />;
  }

  const actionPlayer = (id: string) => {
    navigation.navigate("player", { id });
  };
  return (
    <PrivateLayout>
      <ScrollSection
        title="Jugadores seguidos"
        list={jugadores}
        shape="square"
        action={actionPlayer}
      />
      <Divider />
    </PrivateLayout>
  );
}
