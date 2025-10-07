import AvatarCard from "@/components/AvatarCard";
import LeagueStatsScreen from "@/components/LeagueStatsScreen";
import MatchesLeagueInfo from "@/components/MatchesLeagueInfo";
import SeasonResults from "@/components/SeasonResults";
import VerticalScroll from "@/components/VerticalScroll";
import { useFetch } from "@/hooks/FetchContext";
import { LeagueB, RootStackParamList, swiperItem } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Text } from "react-native-paper";
import { SvgUri } from "react-native-svg";
import PrivateLayout from "./privateLayout";

const items = [
  {
    id: "1",
    name: "Noticias",
  },
  {
    id: "2",
    name: "Partidos",
  },
  {
    id: "3",
    name: "Posiciones",
  },
  {
    id: "4",
    name: "Estadísticas",
  },
  {
    id: "5",
    name: "Análisis de temporada",
  },
];

type TournamentScreenRouteProp = RouteProp<RootStackParamList, "tournament">;

export default function TournamentScreen() {
  const { getLeague, getLeagueNews } = useFetch();
  const route = useRoute<TournamentScreenRouteProp>();
  const { id } = route.params;
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoLeague, setInfoLeague] = useState<LeagueB>();
  const [leagueNews, setLeagueNews] = useState<swiperItem[]>();

  useEffect(() => {
    let isMounted = true;

    const getInfoLeague = async () => {
      setLoading(true);
      try {
        const { success, league, message } = await getLeague(id);

        if (!isMounted) return;

        if (success) {
          setInfoLeague(league!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const leagueNews = async () => {
      setLoading(true);
      try {
        const { success, news, message } = await getLeagueNews(id);

        if (!isMounted) return;

        if (success) {
          setLeagueNews(news!);
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
      getInfoLeague();
      leagueNews();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const actionGeneralListNews = (id: string) => {
    console.log(id);
  };

  useMemo(() => {
    setSelectedItem(items[0]);
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  return (
    <PrivateLayout>
      <>
        {infoLeague && (
          <>
            <AvatarCard
              name={infoLeague.league.name}
              imageUrl={infoLeague.league.logo!}
              typographyProps={{
                variant: "titleLarge",
                style: {
                  color: "#333333",
                  fontFamily: "BubbleSans",
                  fontWeight: "600",
                  textAlign: "center",
                },
              }}
            />
            <View style={styles.headerRow}>
              {infoLeague.country.flag?.includes(".svg") ? (
                <SvgUri uri={infoLeague.country.flag!} width={40} height={40} />
              ) : (
                <Image
                  source={{ uri: infoLeague.country.flag }}
                  style={styles.leagueImage}
                />
              )}
              <Chip style={styles.leagueChip}>{infoLeague.country.name}</Chip>
            </View>
          </>
        )}

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

        <View style={styles.content}>
          <Text style={styles.title}>{selectedItem.name.toUpperCase()}</Text>

          <ScrollView>
            {selectedItem.name.toLowerCase() === "noticias" && (leagueNews && leagueNews?.length > 0) && (
              <VerticalScroll
                listItems={leagueNews!}
                actionGeneralList={actionGeneralListNews}
              />
            )}
          </ScrollView>

          {selectedItem.name.toLowerCase() === "partidos" && (
            <MatchesLeagueInfo leagueId={id} />
          )}

          {selectedItem.name.toLowerCase() === "posiciones" && (
            <SeasonResults league={infoLeague}
            />
          )}

          {selectedItem.name.toLowerCase() === "estadísticas" && <LeagueStatsScreen leagueId={id} />}

          {/* 
          {selectedItem.name.toLowerCase() === "análisis de temporada" && (
            <SeasonAnalysis />
          )} */}
        </View>
      </>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    paddingHorizontal: 8,
  },
  leagueImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  leagueChip: {
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
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    fontFamily: "BubbleSans",
  },
});
