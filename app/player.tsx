import Loading from "@/components/Loading";
import PlayerAnalysis from "@/components/PlayerAnalysis";
import PlayerProfileCard from "@/components/PlayerProfileCard";
import PlayerStatisticsView from "@/components/PlayerSeasonStatsTable";
import PlayerTeamsHistory from "@/components/PlayerTeamsHistory";
import { useFetch } from "@/hooks/FetchContext";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Chip, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

import AvatarCard from "../components/AvatarCard";
import VerticalScroll from "../components/VerticalScroll";
import type { PlayerB, RootStackParamList, swiperItem } from "../types";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";

import PrivateLayout from "./privateLayout";

const items = [
  { id: "1", name: "Información Personal" },
  { id: "2", name: "Noticias" },
  { id: "3", name: "Estadísticas" },
  { id: "5", name: "Trayectoria" },
  { id: "6", name: "Análisis" },
];

type PlayerScreenRouteProp = RouteProp<RootStackParamList, "player">;

export default function Player() {
  const { getInfoPlayer, getPlayerNews, getPlayerSeasons } = useFetch();
  const [player, setPlayer] = useState<PlayerB>();
  const [playerNew, setPlayerNews] = useState<swiperItem[]>();
  const [seasons, setSeasons] = useState<number[]>([]);
  const [loadingInfoPlayer, setLoadingInfoPlayer] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState(items[0]);

  const route = useRoute<PlayerScreenRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { id } = route.params;

  useEffect(() => {
    let isMounted = true;

    const getPlayer = async () => {
      setLoadingInfoPlayer(true);
      try {
        const { success, player, message } = await getInfoPlayer(id);

        if (!isMounted) return;

        if (success) {
          setPlayer(player!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoadingInfoPlayer(false);
      }
    };

    const playerNews = async () => {
      setLoadingNews(true);
      try {
        const { success, news, message } = await getPlayerNews(id);

        if (!isMounted) return;

        if (success) {
          setPlayerNews(news!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };

    const playerSeasons = async () => {
      setLoadingSeasons(true);
      try {
        const { success, seasons, message } = await getPlayerSeasons(id);

        if (!isMounted) return;

        if (success) {
          setSeasons(seasons!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoadingSeasons(false);
      }
    };

    if (id && selectedItem) {
      getPlayer();
      playerNews();
      playerSeasons();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loadingInfoPlayer || loadingNews || loadingSeasons) {
    return (
      <Loading visible={loadingInfoPlayer || loadingNews || loadingSeasons} />
    );
  }

  const actionGeneralListNews = (id: string) => console.log(id);

  const handleTeam = (id: string) => {
    navigation.navigate("team", { id });
  };

  return (
    <PrivateLayout>
      {player && (
        <>
          <AvatarCard
            name={player?.name!}
            imageUrl={player?.photo!}
            typographyProps={{ variant: "titleLarge" }}
          />

          <TouchableOpacity
            onPress={() => handleTeam(player.team?.id.toString() ?? "")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.sm,
              paddingHorizontal: spacing.sm,
            }}
          >
            <Image
              source={{ uri: player?.team?.logo ?? "" }}
              style={{
                width: 40,
                height: 40,
                marginRight: spacing.sm,
              }}
            />

            <Chip
              style={{
                backgroundColor: colors.border,
              }}
              textStyle={{ color: colors.textSecondary }}
            >
              {player?.team?.name}
            </Chip>
          </TouchableOpacity>

          <View style={{ marginVertical: spacing.sm }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: spacing.sm,
              }}
            >
              {items.map((item) => {
                const active = selectedItem.id === item.id;

                return (
                  <Chip
                    key={item.id}
                    onPress={() => setSelectedItem(item)}
                    selected={active}
                    style={{
                      marginRight: 8,
                      backgroundColor: active ? colors.primary : colors.border,
                    }}
                    textStyle={{
                      color: active ? "#fff" : colors.textSecondary,
                    }}
                  >
                    {item.name.toUpperCase()}
                  </Chip>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ padding: spacing.md }}>
            <Text style={[g.subtitle, { marginBottom: spacing.sm }]}>
              {selectedItem.name.toUpperCase()}
            </Text>

            {selectedItem.name.toLowerCase() === "información personal" && (
              <PlayerProfileCard
                name={player?.name!}
                age={player?.age!}
                birthday={player?.birth.date!}
                country={player?.nationality!}
                position={player?.statistics[0].games.position ?? ""}
                height={player?.height!}
                weight={player?.weight!}
                jerseyNumber={""}
                dominantFoot=""
                marketValue="-"
                avatarUrl={player?.photo!}
              />
            )}

            <ScrollView>
              {selectedItem.name.toLowerCase() === "noticias" && (
                <VerticalScroll
                  listItems={playerNew!}
                  actionGeneralList={actionGeneralListNews}
                />
              )}
            </ScrollView>

            {selectedItem.name.toLowerCase() === "estadísticas" && (
              <PlayerStatisticsView player={player!} />
            )}

            {selectedItem.name.toLowerCase() === "trayectoria" && (
              <PlayerTeamsHistory seasons={seasons} playerId={id} />
            )}

            {selectedItem.name.toLowerCase() === "análisis" && (
              <PlayerAnalysis playerId={id} stats={player.statistics} />
            )}
          </View>
        </>
      )}
    </PrivateLayout>
  );
}
