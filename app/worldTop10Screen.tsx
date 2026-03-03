import Loading from "@/components/Loading";
import WorldVideoFeed from "@/components/worldVideoFeed";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadInterstitial } from "@/services/ads/interstitial";
import { WeeklyWorldTopVideo } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Menu, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function WorldTop10Screen() {
  const { getVideosWorldTop10, getLimitAdsPerDay } = useFetch();
  const [videos, setVideos] = useState<WeeklyWorldTopVideo[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [openFeed, setOpenFeed] = useState(false);
  const [initialVideo, setInitialVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [limitAdsPerDay, setLimitAdsPerDay] = useState(20);

  useEffect(() => {
    loadInterstitial();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getVideos = async () => {
      setLoading(true);
      try {
        const { videos, success, message } = await getVideosWorldTop10();
        if (!isMounted) return;

        if (success) {
          setVideos(videos);
        } else {
          setMessage(message!);
        }
      } catch (err) {
        if (isMounted) setMessage("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadAdsLimitPerDay = async () => {
      setLoading(true);
      try {
        const { success, limit, message } = await getLimitAdsPerDay();
        if (!isMounted) return;

        if (success) {
          setLimitAdsPerDay(limit);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar los equipos favoritos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getVideos();
    loadAdsLimitPerDay();

    return () => {
      isMounted = false;
    };
  }, []);

  const allWeeks = useMemo(
    () =>
      Array.from(new Set(videos.map((v) => v.week))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [],
  );

  const filtered =
    selectedWeek === null
      ? videos
      : videos.filter((v) => v.week === selectedWeek);

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
    <PrivateLayout>
      <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 10 }}>
          🌍 Top 10 Goles del Mundo
        </Text>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="calendar"
            >
              {selectedWeek ? `Semana: ${selectedWeek}` : "Todas las semanas"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedWeek(null);
              setMenuVisible(false);
            }}
            title="Todas las semanas"
          />
          {allWeeks.map((w) => (
            <Menu.Item
              key={w}
              onPress={() => {
                setSelectedWeek(w);
                setMenuVisible(false);
              }}
              title={w}
            />
          ))}
        </Menu>

        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            paddingTop: 16,
          }}
        >
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                width: "48%",
                borderRadius: 10,
                overflow: "hidden",
              }}
              onPress={() => {
                setInitialVideo(item.id);
                setOpenFeed(true);
              }}
            >
              <Image
                source={{
                  uri: item.thumbail,
                }}
                style={{ width: "100%", height: 180 }}
              />
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  alignItems: "center",
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: "white" }}>{item.week}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ marginVertical: 20, alignItems: "center" }}>
          <AdBanner />
        </View>

        {openFeed && initialVideo && (
          <WorldVideoFeed
            videos={filtered}
            item={filtered.find((v) => v.id === initialVideo)!}
            onClose={() => setOpenFeed(false)}
            limitAdsPerDay={limitAdsPerDay}
            setLimitAdsPerDay={setLimitAdsPerDay}
          />
        )}
      </View>
    </PrivateLayout>
  );
}
