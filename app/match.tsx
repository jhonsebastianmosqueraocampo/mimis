import Loading from "@/components/Loading";
import MatchLive from "@/components/MatchLive";
import MatchPost from "@/components/MatchPost";
import MatchPreview from "@/components/MatchPreview";
import { useFetch } from "@/hooks/FetchContext";
import { Fixture, LiveMatch, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";
import PrivateLayout from "./privateLayout";

type MatchState = "Previa" | "En vivo" | "Resumen";
type TeamScreenRouteProp = RouteProp<RootStackParamList, "match">;

const LIVE_SHORT = new Set(["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"]);
const FINISHED_SHORT = new Set(["FT", "AET", "PEN", "AWD", "WO"]);
const BLOCK_LIVE_SHORT = new Set(["PST", "CANC", "ABD", "SUSP"]);
const FIVE_MIN_MS = 5 * 60 * 1000;

export default function Match() {
  const { getFixture } = useFetch();
  const [matchState, setMatchState] = useState<MatchState>("Previa");
  const [kickoffISO, setKickoffISO] = useState<string>("");
  const [statusShort, setStatusShort] = useState<string>("NS");
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [liveMatchFixture, setLiveMatchFixture] = useState<LiveMatch | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const route = useRoute<TeamScreenRouteProp>();
  const { id } = route.params;

  useEffect(() => {
    let isMounted = true;
    const getFixtureMatch = async () => {
      setLoading(true);
      try {
        const { success, fixture, liveMatchFixture, message } =
          await getFixture(id);

        if (!isMounted) return;

        if (success) {
          setFixture(fixture!);
          setLiveMatchFixture(liveMatchFixture);
          setKickoffISO(fixture?.date.toString() ?? "");
          setStatusShort(fixture?.status?.short ?? "NS");
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el fixture");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      getFixtureMatch();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ✅ flags
  const isLive = useMemo(() => LIVE_SHORT.has(statusShort), [statusShort]);
  const isFinished = useMemo(
    () => FINISHED_SHORT.has(statusShort),
    [statusShort],
  );

  const canShowLiveTab = useMemo(() => {
    if (BLOCK_LIVE_SHORT.has(statusShort)) return false;
    if (isLive) return true;
    if (!kickoffISO) return false;

    const kickoff = new Date(kickoffISO).getTime();
    const now = Date.now();

    return kickoff - now <= FIVE_MIN_MS;
  }, [isLive, kickoffISO, statusShort]);

  const canShowSummaryTab = isFinished;

  // ✅ lista de tabs visible
  const visibleTabs: MatchState[] = useMemo(() => {
    // ✅ partido finalizado: solo tiene sentido "Resumen"
    if (isFinished) return ["Resumen"];

    const arr: MatchState[] = ["Previa"];
    if (canShowLiveTab) arr.push("En vivo");
    // OJO: aquí resumen NO se agrega porque isFinished ya lo maneja arriba
    return arr;
  }, [isFinished, canShowLiveTab]);

  // ✅ si el usuario estaba en una tab que ya no existe, lo devolvemos a Previa
  useEffect(() => {
    // ✅ si terminó, siempre cae en Resumen
    if (isFinished) {
      if (matchState !== "Resumen") setMatchState("Resumen");
      return;
    }

    // ✅ si no terminó y la tab actual no existe, vuelve a Previa
    if (!visibleTabs.includes(matchState)) {
      setMatchState("Previa");
    }
  }, [isFinished, visibleTabs, matchState]);

  useEffect(() => {
    if (isFinished) setMatchState("Resumen");
  }, [isFinished]);

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
      {/* 🔹 Chips de navegación */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {visibleTabs.map((item) => {
          const active = matchState === item;
          return (
            <Chip
              key={item}
              onPress={() => setMatchState(item)}
              mode={active ? "flat" : "outlined"}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? "#1DB954" : "transparent",
                  borderColor: "#1DB954",
                },
              ]}
              textStyle={{
                color: active ? "#fff" : "#000",
                fontWeight: "bold",
                fontSize: 13,
                lineHeight: 16,
              }}
            >
              {item.toUpperCase()}
            </Chip>
          );
        })}
      </ScrollView>

      {/* 🔹 Contenedor principal */}
      <Animated.View
        style={{
          flex: 1,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        {matchState === "Previa" && (
          <MatchPreview fixtureId={id} fixture={fixture} />
        )}
        {matchState === "En vivo" && canShowLiveTab && (
          <MatchLive fixtureId={id} />
        )}

        {matchState === "Resumen" &&
          canShowSummaryTab &&
          fixture &&
          liveMatchFixture && (
            <View style={styles.finishedContainer}>
              <MatchPost fixtureId={id} liveMatchFixture={liveMatchFixture} />
            </View>
          )}
      </Animated.View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    height: 36,
    justifyContent: "center",
    borderRadius: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  finishedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  finalTitle: {
    textAlign: "center",
    color: "#333",
    marginBottom: 6,
  },
  finalSubtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: "100%",
  },
  summaryTitle: {
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
});
