import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Divider } from "react-native-paper";
import type { swiperItem } from "../types";
import Loading from "./Loading";
import ScrollSection from "./ScrollSection"; // debe estar adaptado a RN

type SigningsAndRumorsProps = {
  teamId: string;
};

export default function SigningsAndRumors({ teamId }: SigningsAndRumorsProps) {
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
    const { success, newSigns, newRumor, message } =
      await getNewsSignAndRumorTeam(teamId);
    if (success) {
      setNewSigns(newSigns);
      setNewRumor(newRumor);
    } else {
      setError(message!);
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading visible={loading} />;
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
      <View style={{ marginVertical: 24, alignItems: "center" }}>
        <AdBanner />
      </View>
    </ScrollView>
  );
}
