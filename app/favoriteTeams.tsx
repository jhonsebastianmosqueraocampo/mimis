import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList, swiperItem } from "@/types";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Divider } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function FavoriteTeams() {
  const { getFavorites } = useFetch();
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
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
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const actionTeams = (id: string) => {
    navigation.navigate("team", { id });
  };

  return (
    <PrivateLayout>
      <ScrollSection
        title="Equipos seguidos"
        list={equipos}
        shape="square"
        action={actionTeams}
      />
      <Divider />
    </PrivateLayout>
  );
}
