import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "react-native-paper";

import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { Fixture, PreMatchStats, swiperItem, VideoYoutube } from "@/types";
import FixtureLineups from "./FixtureLineups";
import Loading from "./Loading";
import MatchAnalysisPreview from "./MatchAnalysisPreview";
import MatchBanner from "./MatchBanner";
import MatchHistoryPreview from "./MatchHistoryPreview";
import MatchPredictions from "./MatchPredictions";
import MatchStatsPreview from "./MatchStatsPreview";
import PenaltyGameSwipe from "./PenaltyGameSwipe";
import VerticalScroll from "./VerticalScroll";

const items = [
  { id: "1", name: "Entrevistas" },
  { id: "2", name: "Predicciones" },
  { id: "3", name: "Estadísticas" },
  { id: "4", name: "Análisis de partidos" },
  { id: "5", name: "Historial de resultados" },
  { id: "6", name: "Alineaciones" },
  { id: "7", name: "Suma puntos y gana" },
];

type MatchPreviewProps = {
  fixtureId: string;
  fixture: Fixture | null;
};

export default function MatchPreview({
  fixtureId,
  fixture,
}: MatchPreviewProps) {
  const { getVideoFromYoutube, getPreMatchStats } = useFetch();
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [videoPreview, setVideoPreview] = useState<VideoYoutube>();
  const [videoPreviewInterviews, setVideoPreviewInterviews] =
    useState<swiperItem[]>();
  const [stats, setStats] = useState<PreMatchStats>();
  const [showBlock, setShowBlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const STATUS = {
    long: "",
    short: "",
    elapsed: null,
  };

  useEffect(() => {
    let isMounted = true;
    const getPreviewVideo = async () => {
      setLoading(true);
      if (!fixture?.date) return null;
      const query = `${fixture.teams.home.name} vs ${
        fixture.teams.away.name
      } previa ${new Date().getFullYear()} fútbol`;
      const matchDate = new Date(fixture.date);
      const now = new Date();
      const diffMs = matchDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24) {
        try {
          const { success, videos, message } = await getVideoFromYoutube(query);

          if (!isMounted) return;

          if (success) {
            setVideoPreview(videos[0]!);
          } else {
            setError(message!);
          }
        } catch (err) {
          if (isMounted) setError("Error al cargar el fixture");
        } finally {
          if (isMounted) setLoading(false);
        }
        setShowBlock(true);
      } else {
        setLoading(false);
        setShowBlock(false);
      }
      setLoading(false);
    };

    const getPreviewVideoInterviews = async () => {
      setLoading(true);
      if (!fixture?.date) return null;
      const year = new Date().getFullYear();
      const query = `${fixture.teams.home.name} ${fixture.teams.away.name} ${year} fútbol`;
      const matchDate = new Date(fixture.date);
      const now = new Date();
      const diffMs = matchDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24 && diffHours > 0) {
        try {
          const { success, videos, message } = await getVideoFromYoutube(query);

          if (!isMounted) return;

          if (success) {
            const interviews: swiperItem[] = videos.map(
              (video: VideoYoutube) => ({
                id: video.videoId,
                title: video.title,
                img: video.thumbnail,
                pathTo: `https://www.youtube.com/watch?v=${video.videoId}`,
                description: video.description,
                date: new Date().toISOString(),
                source: video.channelTitle,
              }),
            );
            setVideoPreviewInterviews(interviews!);
          } else {
            setError(message!);
          }
        } catch (err) {
          if (isMounted) setError("Error al cargar el fixture");
        } finally {
          if (isMounted) setLoading(false);
        }
        setShowBlock(true);
      } else {
        setLoading(false);
        setShowBlock(false);
      }
      setLoading(false);
    };

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const { success, stats, message } = await getPreMatchStats(fixtureId);

        if (!isMounted) return;

        if (success) {
          setStats(stats!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el fixture");
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    if (fixtureId && selectedItem) {
      getPreviewVideo();
      getPreviewVideoInterviews();
      fetchStats();
    }

    return () => {
      isMounted = false;
    };
  }, [fixtureId]);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const actionInterviews = (id: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <MatchBanner
        homeTeam={{
          id: fixture?.teams.home.id.toString() ?? "",
          title: fixture?.teams.home.name ?? "",
          img: fixture?.teams.home.logo ?? "",
          pathTo: "",
        }}
        awayTeam={{
          id: fixture?.teams.away.id.toString() ?? "",
          title: fixture?.teams.away.name ?? "",
          img: fixture?.teams.away.logo ?? "",
          pathTo: "",
        }}
        datetime={fixture?.date.toString() ?? ""}
        stadium={fixture?.venue.name ?? ""}
        referee={fixture?.referee ?? ""}
        tournament={fixture?.league.name ?? ""}
        tournamentId={fixture?.league.id.toString() ?? ""}
      />

      {showBlock && (
        <View style={{ marginTop: 16 }}>
          <Text
            variant="titleMedium"
            style={{
              textAlign: "center",
              backgroundColor: colors.background,
              color: colors.textPrimary,
              padding: 8,
              borderRadius: 8,
              fontFamily: "BubbleSans",
              fontWeight: "600",
            }}
          >
            Previa del partido
          </Text>

          <Button
            icon="youtube"
            mode="contained"
            buttonColor={colors.error}
            textColor={colors.textOnPrimary}
            style={{ marginTop: 8 }}
            onPress={() =>
              Linking.openURL(
                `https://www.youtube.com/watch?v=${videoPreview?.videoId}`,
              )
            }
          >
            Ver en YouTube
          </Button>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={{ marginVertical: 16 }}
      >
        {items.map((item) => (
          <Chip
            key={item.id}
            onPress={() => setSelectedItem(item)}
            mode={selectedItem.id === item.id ? "flat" : "outlined"}
            style={{
              backgroundColor:
                selectedItem.id === item.id ? colors.primary : colors.border,
              borderColor: colors.primary,
              marginRight: 8,
            }}
            textStyle={{
              color:
                selectedItem.id === item.id
                  ? colors.textOnPrimary
                  : colors.textPrimary,
            }}
          >
            {item.name.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      <View>
        <Text
          variant="titleSmall"
          style={{ fontWeight: "bold", color: colors.textPrimary }}
        >
          {selectedItem.name.toUpperCase()}
        </Text>
        {selectedItem.name.toLowerCase() === "entrevistas" &&
          (showBlock ? (
            <VerticalScroll
              listItems={videoPreviewInterviews ?? []}
              actionGeneralList={actionInterviews}
            />
          ) : (
            <Text
              variant="titleSmall"
              style={{ fontWeight: "bold", color: colors.textPrimary }}
            >
              Pronto estarán listas las entrevistas del partido
            </Text>
          ))}
        {selectedItem.name.toLowerCase() === "predicciones" && (
          <MatchPredictions fixtureId={fixtureId} />
        )}
        {selectedItem.name.toLowerCase() === "estadísticas" && stats && (
          <MatchStatsPreview stats={stats} />
        )}
        {selectedItem.name.toLowerCase() === "análisis de partidos" &&
          stats && <MatchAnalysisPreview stats={stats} fixtureId={fixtureId} />}
        {selectedItem.name.toLowerCase() === "historial de resultados" &&
          (statsLoading ? (
            <Loading
              visible
              title="Cargando historial"
              subtitle="Consultando enfrentamientos previos"
            />
          ) : stats ? (
            <MatchHistoryPreview stats={stats} />
          ) : (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: colors.textSecondary,
              }}
            >
              No hay historial disponible
            </Text>
          ))}
        {selectedItem.name.toLowerCase() === "alineaciones" && (
          <FixtureLineups fixtureId={fixtureId} status={STATUS} />
        )}
        {selectedItem.name.toLowerCase() === "Suma puntos y gana" && (
          <PenaltyGameSwipe />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipScroll: {
    flexDirection: "row",
    paddingVertical: 8,
  },
});
