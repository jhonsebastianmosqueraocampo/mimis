import AvatarCard from "@/components/AvatarCard";
import LeagueStatsScreen from "@/components/LeagueStatsScreen";
import Loading from "@/components/Loading";
import MatchesLeagueInfo from "@/components/MatchesLeagueInfo";
import SeasonResults from "@/components/SeasonResults";
import VerticalScroll from "@/components/VerticalScroll";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { LeagueB, RootStackParamList, swiperItem } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";
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
  // {
  //   id: "5",
  //   name: "Análisis de temporada",
  // },
];

type TournamentScreenRouteProp = RouteProp<RootStackParamList, "tournament">;

export default function TournamentScreen() {
  const { getLeague, getLeagueNews, getFavorites } = useFetch();
  const route = useRoute<TournamentScreenRouteProp>();
  const { id } = route.params;
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [infoLeague, setInfoLeague] = useState<LeagueB>();
  const [leagueNews, setLeagueNews] = useState<swiperItem[]>([]);
  const [equipos, setEquipos] = useState<swiperItem[]>([]);
  const [loadingLeague, setLoadingLeague] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const getFavoriteList = async () => {
      setLoadingFavs(true);
      try {
        const { success, teams, message } = await getFavorites();
        if (!isMounted) return;

        if (success) {
          setEquipos(teams);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar los equipos favoritos");
      } finally {
        if (isMounted) setLoadingFavs(false);
      }
    };

    getFavoriteList();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getInfoLeague = async () => {
      setLoadingLeague(true);
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
        if (isMounted) setLoadingLeague(false);
      }
    };

    const leagueNews = async () => {
      setLoadingNews(true);
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
        if (isMounted) setLoadingNews(false);
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

  if (loadingLeague || loadingFavs || loadingNews) {
    return (
      <Loading
        visible={loadingLeague || loadingFavs || loadingNews}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
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
                  ...typography.titleLarge,
                  color: colors.textPrimary,
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
              <Chip
                textStyle={{
                  color:
                    selectedItem.id == infoLeague.league.id.toString()
                      ? colors.textOnPrimary
                      : colors.textPrimary,
                }}
              >
                {infoLeague.country.name}
              </Chip>
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
            {selectedItem.name.toLowerCase() === "noticias" &&
              leagueNews &&
              leagueNews?.length > 0 && (
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
            <SeasonResults league={infoLeague} equiposFavoritos={equipos} />
          )}

          {selectedItem.name.toLowerCase() === "estadísticas" && (
            <LeagueStatsScreen leagueId={id} />
          )}

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
    backgroundColor: colors.surface,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },

  leagueImage: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    marginRight: spacing.xs,
  },

  leagueChip: {
    backgroundColor: "transparent",
    borderColor: colors.primary,
  },

  chipContainer: {
    flexDirection: "row",
  },

  tabBar: {
    marginVertical: spacing.sm,
  },

  chip: {
    marginRight: spacing.xs,
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: "transparent",
    borderRadius: radius.round,
  },

  firstChip: {
    marginLeft: spacing.sm,
  },

  lastChip: {
    marginRight: spacing.sm,
  },

  chipSelected: {
    backgroundColor: colors.primary,
  },

  content: {
    paddingHorizontal: spacing.lg,
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
