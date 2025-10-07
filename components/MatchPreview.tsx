import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, Text } from "react-native-paper";

import { useFetch } from "@/hooks/FetchContext";
import { Fixture, swiperItem, VideoYoutube } from "@/types";
import FixtureLineups from "./FixtureLineups";
import MatchAnalysisPreview from "./MatchAnalysisPreview";
import MatchBanner from "./MatchBanner";
import MatchHistoryPreview from "./MatchHistoryPreview";
import MatchPredictions from "./MatchPredictions";
import MatchStatsPreview from "./MatchStatsPreview";
import VerticalScroll from "./VerticalScroll";

const items = [
  { id: "1", name: "Entrevistas" },
  { id: "2", name: "Predicciones" },
  { id: "3", name: "Estadísticas" },
  { id: "4", name: "Análisis de partidos" },
  { id: "5", name: "Historial de resultados" },
  { id: "6", name: "Alineaciones" },
];

type MatchPreviewProps = {
  fixtureId: string;
};

export default function MatchPreview({ fixtureId }: MatchPreviewProps) {
  const { getFixture, getVideoFromYoutube } = useFetch();
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [fixture, setFixture] = useState<Fixture>();
  const [videoPreview, setVideoPreview] = useState<VideoYoutube>();
  const [videoPreviewInterviews, setVideoPreviewInterviews] =
    useState<swiperItem[]>();
  const [showBlock, setShowBlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const getFixtureMatch = async () => {
      setLoading(true);
      try {
        const { success, fixture, message } = await getFixture(fixtureId);

        if (!isMounted) return;

        if (success) {
          setFixture(fixture!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el fixture");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const getPreviewVideo = async () => {
      setLoading(true);
      if (!fixture?.date) return null;
      const query = `${fixture.teams.home.name} ${fixture.teams.away.name}`;
      const matchDate = new Date(fixture.date);
      const now = new Date();
      const diffMs = matchDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24 && diffHours > 0) {
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
      const query = `${fixture.teams.home.name} ${fixture.teams.away.name} rueda de prensa`;
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
              })
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

    if (fixtureId && selectedItem) {
      getFixtureMatch();
      getPreviewVideo();
      getPreviewVideoInterviews();
    }

    return () => {
      isMounted = false;
    };
  }, [fixtureId]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
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
              backgroundColor: "#f5f5f5",
              color: "#222",
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
            buttonColor="#e53935"
            textColor="#fff"
            style={{ marginTop: 8 }}
            onPress={() =>
              Linking.openURL(
                `https://www.youtube.com/watch?v=${videoPreview?.videoId}`
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
                selectedItem.id === item.id ? "#1DB954" : "transparent",
              borderColor: "#1DB954",
              marginRight: 8,
            }}
            textStyle={{
              color: selectedItem.id === item.id ? "#fff" : "#000",
            }}
          >
            {item.name.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      <View>
        <Text
          variant="titleSmall"
          style={{ fontWeight: "bold", color: "#333" }}
        >
          {selectedItem.name.toUpperCase()}
        </Text>
        {
          (selectedItem.name.toLowerCase() === "entrevistas") &&  (
            showBlock ? 
            (
              <VerticalScroll
                listItems={videoPreviewInterviews!}
                actionGeneralList={actionInterviews}
              />
            )
            :
            (
              <Text
            variant="titleSmall"
            style={{ fontWeight: "bold", color: "#333" }}
          >
            Pronto estarán listas las entrevistas del partido
          </Text>
            )
          )

        }
        {selectedItem.name.toLowerCase() === "predicciones" && (
          <MatchPredictions fixtureId={fixtureId}/>
        )}
        {selectedItem.name.toLowerCase() === "estadísticas" && (
          <MatchStatsPreview fixtureId={fixtureId}/>
        )}
        {selectedItem.name.toLowerCase() === "análisis de partidos" && (
          <MatchAnalysisPreview />
        )}
        {selectedItem.name.toLowerCase() === "historial de resultados" && (
          <MatchHistoryPreview fixtureId={fixtureId}/>
        )}
        {selectedItem.name.toLowerCase() === "Alineaciones" && (
          <FixtureLineups fixtureId={fixtureId} />
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
