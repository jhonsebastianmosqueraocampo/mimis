import { useFetch } from "@/hooks/FetchContext";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { ActivityIndicator, Divider } from "react-native-paper";
import type { swiperItem } from "../types";
import ScrollSection from "./ScrollSection"; // debe estar adaptado a RN

type SigningsAndRumorsProps = {
  teamId: string;
}

export default function SigningsAndRumors({teamId}: SigningsAndRumorsProps) {

  const { getNewsSignAndRumorTeam } = useFetch();
  const [newSigns, setNewSigns] = useState<swiperItem[]>();
  const [newRumors, setNewRumor] = useState<swiperItem[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNews();
  }, [teamId]);

  const getNews = async () => {
    setLoading(true);
    const { success, newSigns, newRumor, message } = await getNewsSignAndRumorTeam(teamId);
    if (success) {
      setNewSigns(newSigns);
      setNewRumor(newRumor);
    } else {
      setError(message!);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const signingAndRumorAction = (id: string) => {
    console.log("Seleccionado:", id);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
      <ScrollSection
        title="Fichajes y ventas"
        list={newSigns!}
        shape="news"
        action={signingAndRumorAction}
      />
      <Divider />
      <ScrollSection
        title="Rumores"
        list={newRumors!}
        shape="news"
        action={signingAndRumorAction}
      />
    </ScrollView>
  );
}