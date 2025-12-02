import PlayerProfileCard from "@/components/PlayerProfileCard";
import PlayerStatisticsView from "@/components/PlayerSeasonStatsTable";
import PlayerTeamsHistory from "@/components/PlayerTeamsHistory";
import { useFetch } from "@/hooks/FetchContext";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator, Chip, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import AvatarCard from "../components/AvatarCard";
import VerticalScroll from "../components/VerticalScroll";
import type { PlayerB, RootStackParamList, swiperItem } from "../types";
import PrivateLayout from "./privateLayout";

const items = [
  { id: "1", name: "Información Personal" },
  { id: "2", name: "Noticias" },
  { id: "3", name: "Estadísticas" },
  { id: "4", name: "Videos" },
  { id: "5", name: "Trayectoria" },
];

type PlayerScreenRouteProp = RouteProp<RootStackParamList, "player">;

export default function Player() {
  const { getInfoPlayer, getPlayerNews, getPlayerSeasons } = useFetch();
  const [player, setPlayer] = useState<PlayerB>();
  const [playerNew, setPlayerNews] = useState<swiperItem[]>();
  const [seasons, setSeasons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const route = useRoute<PlayerScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { id } = route.params;

  useEffect(() => {
    let isMounted = true;

    const getPlayer = async () => {
      setLoading(true);
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
        if (isMounted) setLoading(false);
      }
    };

    const playerNews = async () => {
      setLoading(true);
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
        if (isMounted) setLoading(false);
      }
    };

    const playerSeasons = async () => {
      setLoading(true);
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
        if (isMounted) setLoading(false);
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

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const actionGeneralListNews = (id: string) => console.log(id);

  const handleTeam = (id: string) => {
    navigation.navigate('team', {id})
  }

  return (
    <PrivateLayout>
      {player && (
        <>
          <AvatarCard
            name={player?.name!}
            imageUrl={player?.photo!}
            typographyProps={{ variant: "titleLarge" }}
          />

          <TouchableOpacity style={styles.headerRow} onPress={()=>handleTeam(player.team?.id.toString() ?? '')}>
            <Image
              source={{ uri: player?.team?.logo ?? "" }}
              style={styles.teamImage}
            />
            <Chip style={styles.clubChip}>{player?.team?.name}</Chip>
          </TouchableOpacity>

          <View style={styles.tabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {items.map((item, index) => (
                <Chip
                  key={item.id}
                  onPress={() => setSelectedItem(item)}
                  selected={selectedItem.id === item.id}
                  style={[
                    styles.chip,
                    index === 0 && styles.firstChip,
                    index === items.length - 1 && styles.lastChip,
                    selectedItem.id === item.id && styles.chipSelected,
                  ]}
                  textStyle={{
                    color: selectedItem.id === item.id ? "#fff" : "#000",
                  }}
                >
                  {item.name.toUpperCase()}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <View style={styles.container}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
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

            {selectedItem.name.toLowerCase() === "videos" && <></>}

            {selectedItem.name.toLowerCase() === "trayectoria" && (
              <PlayerTeamsHistory seasons={seasons} playerId={id} />
            )}
          </View>
        </>
      )}
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  avatar: {
    paddingVertical: 2,
  },
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    paddingHorizontal: 8,
  },
  teamImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  clubChip: {
    backgroundColor: "transparent",
    borderColor: "#1DB954",
  },
  chipContainer: {
    flexDirection: "row",
  },
  tabBar: {
    marginVertical: 12,
  },
  chip: {
    marginRight: 8,
    borderColor: "#1DB954",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  firstChip: {
    marginLeft: 12,
  },

  lastChip: {
    marginRight: 12,
  },
  chipSelected: {
    backgroundColor: "#1DB954",
  },
  sectionTitle: {
    marginBottom: 12,
    color: "#333",
    fontWeight: "600",
  },
});
