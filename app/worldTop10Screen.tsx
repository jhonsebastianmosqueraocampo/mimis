import Loading from "@/components/Loading";
import WorldVideoFeed from "@/components/worldVideoFeed";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadInterstitial } from "@/services/ads/interstitial";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { WeeklyWorldTopVideo } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Chip, Menu, Text, TextInput } from "react-native-paper";
import PrivateLayout from "./privateLayout";

const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function WorldTop10Screen() {
  const { getVideosWorldTop10, getLimitAdsPerDay } = useFetch();

  const [videos, setVideos] = useState<WeeklyWorldTopVideo[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  // ✅ Liga
  const [leagueQuery, setLeagueQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null); // null = todas

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

        if (success) setVideos(videos);
        else setMessage(message!);
      } catch (err) {
        if (isMounted) setMessage("Error al cargar los videos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadAdsLimitPerDay = async () => {
      setLoading(true);
      try {
        const { success, limit, message } = await getLimitAdsPerDay();
        if (!isMounted) return;

        if (success) setLimitAdsPerDay(limit);
        else setError(message!);
      } catch (err) {
        if (isMounted) setError("Error al cargar el límite de anuncios");
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

  // ✅ semanas disponibles (FIX: dependencias correctas)
  const allWeeks = useMemo(() => {
    return Array.from(new Set(videos.map((v) => v.week))).sort((a, b) =>
      b.localeCompare(a),
    );
  }, [videos]);

  // ✅ Ligas disponibles
  const allLeagues = useMemo(() => {
    const leagues = Array.from(
      new Set(
        videos.map((v) => (v.leagueName || "Sin liga").trim()).filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return leagues;
  }, [videos]);

  // ✅ chips filtrados por buscador
  const visibleLeagues = useMemo(() => {
    const q = normalize(leagueQuery);
    if (!q) return allLeagues;
    return allLeagues.filter((l) => normalize(l).includes(q));
  }, [allLeagues, leagueQuery]);

  // ✅ filtra por semana + liga + buscador
  const filtered = useMemo(() => {
    let list = [...videos];

    if (selectedWeek !== null) {
      list = list.filter((v) => v.week === selectedWeek);
    }

    if (selectedLeague !== null) {
      list = list.filter(
        (v) => (v.leagueName || "Sin liga").trim() === selectedLeague,
      );
    }

    const q = normalize(leagueQuery);
    if (q) {
      // además del chip, el buscador también filtra la lista (si no hay liga seleccionada)
      if (selectedLeague === null) {
        list = list.filter((v) =>
          normalize(v.leagueName || "Sin liga").includes(q),
        );
      }
    }

    return list;
  }, [videos, selectedWeek, selectedLeague, leagueQuery]);

  // ✅ Agrupar por liga para mostrar clasificado
  const groupedByLeague = useMemo(() => {
    const map = new Map<string, WeeklyWorldTopVideo[]>();

    filtered.forEach((v) => {
      const key = (v.leagueName || "Sin liga").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });

    // orden estable por nombre de liga
    const sortedEntries = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    // opcional: dentro de cada liga ordena por semana desc
    sortedEntries.forEach(([, list]) => {
      list.sort((a, b) => b.week.localeCompare(a.week));
    });

    return sortedEntries;
  }, [filtered]);

  // ✅ lista que se le pasa al feed según liga seleccionada
  const feedList = useMemo(() => {
    // si hay liga seleccionada -> feed = solo esa liga (y semana ya aplicada)
    if (selectedLeague) return filtered;

    // si no hay liga seleccionada, al abrir desde una sección,
    // igual vamos a abrir con SOLO la liga del item inicial
    if (!initialVideo) return filtered;

    const item = filtered.find((v) => v.id === initialVideo);
    const leagueKey = (item?.leagueName || "Sin liga").trim();
    return filtered.filter(
      (v) => (v.leagueName || "Sin liga").trim() === leagueKey,
    );
  }, [filtered, selectedLeague, initialVideo]);

  const initialItem = useMemo(() => {
    if (!initialVideo) return null;
    return feedList.find((v) => v.id === initialVideo) || null;
  }, [feedList, initialVideo]);

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.lg,
        }}
      >
        <Text variant="titleLarge" style={{ marginBottom: spacing.sm }}>
          🌍 Top 10 Goles del Mundo
        </Text>

        {/* ✅ Filtro por semana */}
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

        {/* ✅ Buscador liga */}
        <TextInput
          mode="outlined"
          label="Buscar liga"
          value={leagueQuery}
          onChangeText={setLeagueQuery}
          style={{ marginTop: 12 }}
          left={<TextInput.Icon icon="magnify" />}
          right={
            leagueQuery ? (
              <TextInput.Icon icon="close" onPress={() => setLeagueQuery("")} />
            ) : null
          }
        />

        {/* ✅ Chips ligas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          <Chip
            selected={selectedLeague === null}
            onPress={() => setSelectedLeague(null)}
            icon="apps"
          >
            Todas
          </Chip>

          {visibleLeagues.map((l) => (
            <Chip
              key={l}
              selected={selectedLeague === l}
              onPress={() => setSelectedLeague(selectedLeague === l ? null : l)}
            >
              {l}
            </Chip>
          ))}
        </ScrollView>

        {/* ✅ Clasificado por liga */}
        <ScrollView
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
        >
          {groupedByLeague.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>
              No hay videos con esos filtros.
            </Text>
          ) : (
            groupedByLeague.map(([league, list]) => (
              <View key={league} style={{ marginBottom: 18 }}>
                {/* Header liga */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text variant="titleMedium">{league}</Text>
                  <Text style={{ opacity: 0.6 }}>{list.length}</Text>
                </View>

                {/* Grid de esa liga */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {list.map((item) => (
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
                        source={{ uri: item.thumbail }}
                        style={{ width: "100%", height: 180 }}
                      />

                      <View
                        style={{
                          backgroundColor: colors.background + "cc",
                          position: "absolute",
                          bottom: 0,
                          width: "100%",
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                        }}
                      >
                        <Text style={{ color: "white" }}>{item.week}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}

          <View style={{ marginVertical: 12, alignItems: "center" }}>
            <AdBanner />
          </View>
        </ScrollView>

        {/* ✅ Feed */}
        {openFeed && initialItem && (
          <WorldVideoFeed
            videos={feedList}
            item={initialItem}
            onClose={() => setOpenFeed(false)}
            limitAdsPerDay={limitAdsPerDay}
            setLimitAdsPerDay={setLimitAdsPerDay}
          />
        )}
      </View>
    </PrivateLayout>
  );
}
