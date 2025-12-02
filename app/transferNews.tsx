import ScrollSection from "@/components/ScrollSection";
import { useFetch } from "@/hooks/FetchContext";
import { swiperItem } from "@/types";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { ActivityIndicator, Divider, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function TransferNews() {
  const { getNewsSignAndRumorFavoritesAndGeneral } = useFetch();
  const [newsFavorties, setNewsFavorties] = useState<swiperItem[]>();
  const [newsGeneral, setNewsGeneral] = useState<swiperItem[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const newsSignAndRumorFavoritesAndGeneral = async () => {
      setLoading(true);
      try {
        const { success, newsFavorites, newsGeneral, message } =
          await getNewsSignAndRumorFavoritesAndGeneral();

        if (!isMounted) return;

        if (success) {
          setNewsFavorties(newsFavorites!);
          setNewsGeneral(newsGeneral!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    newsSignAndRumorFavoritesAndGeneral();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const actionGeneralListNews = (id: string) => console.log(id);

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          variant="titleMedium"
          style={{ fontSize: 15, color: "#333", marginBottom: 16 }}
        >
          Fichajes y rumores
        </Text>

        <ScrollSection
          title="De tus equipos"
          list={newsFavorties ?? []}
          shape="news"
          action={actionGeneralListNews}
        />
        <Divider style={{ marginVertical: 16 }} />

        <ScrollSection
          title="En general"
          list={newsGeneral ?? []}
          shape="news"
          action={actionGeneralListNews}
        />
        <Divider style={{ marginVertical: 16 }} />
      </ScrollView>
    </PrivateLayout>
  );
}
