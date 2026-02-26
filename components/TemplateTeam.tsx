import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import type {
  RootStackParamList,
  swiperItem,
  TeamPlayerStatsByLeague,
} from "../types";
import Loading from "./Loading";
import ScrollSection from "./ScrollSection";

type TemplateTeamProps = {
  teamId: string;
};

type squadProps = {
  goalKeeper: swiperItem[];
  defender: swiperItem[];
  midfielder: swiperItem[];
  attacker: swiperItem[];
};

function groupSquadByPosition(squadData: TeamPlayerStatsByLeague): squadProps {
  const grouped: squadProps = {
    goalKeeper: [],
    defender: [],
    midfielder: [],
    attacker: [],
  };

  squadData.players.forEach((player) => {
    const item: swiperItem = {
      id: player.id.toString(),
      title: player.name,
      img: player.photo,
      pathTo: "",
    };

    switch (player.position?.toLowerCase()) {
      case "goalkeeper":
        grouped.goalKeeper.push(item);
        break;
      case "defender":
        grouped.defender.push(item);
        break;
      case "midfielder":
        grouped.midfielder.push(item);
        break;
      case "attacker":
      case "forward":
        grouped.attacker.push(item);
        break;
    }
  });

  return grouped;
}

export default function TemplateTeam({ teamId }: TemplateTeamProps) {
  const { getSquadByTeam, getCoachByTeam } = useFetch();
  const [teamSquad, setTeamSquad] = useState<squadProps>();
  const [coach, setCoach] = useState<swiperItem[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    getSquad();
    getCoach();
  }, [teamId]);

  const getSquad = async () => {
    setLoading(true);
    const { success, squad, message } = await getSquadByTeam(teamId);
    if (success) {
      const teamSquad = groupSquadByPosition(squad!);
      setTeamSquad(teamSquad);
    } else {
      setError(message!);
    }
    setLoading(false);
  };

  const getCoach = async () => {
    setLoading(true);
    const { success, coach, message } = await getCoachByTeam(teamId);
    if (success) {
      const coachItem: swiperItem[] = [
        {
          id: coach!.coachId.toString(),
          title: coach!.name,
          img: coach!.photo!,
          pathTo: "",
        },
      ];
      setCoach(coachItem);
    } else {
      setError(message!);
    }
    setLoading(false);
  };

  const actionPlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  const actionCoach = (id: string) => {
    navigation.navigate("coach", { id });
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Divider />
      {teamSquad && (
        <View>
          <ScrollSection
            title="Arqueros"
            list={teamSquad?.goalKeeper!}
            shape="circle"
            action={actionPlayer}
          />
          <Divider />
          <ScrollSection
            title="Defensas"
            list={teamSquad?.defender!}
            shape="circle"
            action={actionPlayer}
          />
          <Divider />
          <ScrollSection
            title="Centrocampistas"
            list={teamSquad?.midfielder!}
            shape="circle"
            action={actionPlayer}
          />
          <Divider />
          <ScrollSection
            title="Delanteros"
            list={teamSquad?.attacker!}
            shape="circle"
            action={actionPlayer}
          />
          <Divider />
          <ScrollSection
            title="Técnico"
            list={coach!}
            shape="square"
            action={actionCoach}
          />
        </View>
      )}
      <View style={{ marginVertical: 24, alignItems: "center" }}>
        <AdBanner />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
});
