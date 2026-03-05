import Loading from "@/components/Loading";
import MatchLive from "@/components/MatchLive";
import MatchPost from "@/components/MatchPost";
import MatchPreview from "@/components/MatchPreview";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Fixture, LiveMatch, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
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

  const route = useRoute<TeamScreenRouteProp>();
  const { id } = route.params;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      const { success, fixture, liveMatchFixture } = await getFixture(id);

      if (!isMounted) return;

      if (success) {
        setFixture(fixture!);
        setLiveMatchFixture(liveMatchFixture);
        setKickoffISO(fixture?.date.toString() ?? "");
        setStatusShort(fixture?.status?.short ?? "NS");
      }

      setLoading(false);
    };

    if (id) load();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const visibleTabs: MatchState[] = useMemo(() => {
    if (isFinished) return ["Resumen"];

    const arr: MatchState[] = ["Previa"];

    if (canShowLiveTab) arr.push("En vivo");

    return arr;
  }, [isFinished, canShowLiveTab]);

  useEffect(() => {
    if (isFinished) {
      if (matchState !== "Resumen") setMatchState("Resumen");
      return;
    }

    if (!visibleTabs.includes(matchState)) {
      setMatchState("Previa");
    }
  }, [isFinished, visibleTabs, matchState]);

  if (loading) {
    return (
      <Loading
        visible
        title="Cargando partido"
        subtitle="Preparando información"
      />
    );
  }

  return (
    <PrivateLayout>
      {/* CHIPS */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        }}
      >
        {visibleTabs.map((item) => {
          const active = matchState === item;

          return (
            <Chip
              key={item}
              onPress={() => setMatchState(item)}
              style={{
                height: 36,
                borderRadius: radius.lg,
                backgroundColor: active ? colors.primary : colors.border,
              }}
              textStyle={{
                color: active ? "#fff" : colors.textSecondary,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {item.toUpperCase()}
            </Chip>
          );
        })}
      </ScrollView>

      {/* CONTENIDO */}

      <Animated.View
        style={{
          flex: 1,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
        }}
      >
        {matchState === "Previa" && (
          <MatchPreview fixtureId={id} fixture={fixture} />
        )}

        {matchState === "En vivo" && canShowLiveTab && (
          <MatchLive fixtureId={id} />
        )}

        {matchState === "Resumen" && fixture && liveMatchFixture && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: spacing.lg,
            }}
          >
            <MatchPost fixtureId={id} liveMatchFixture={liveMatchFixture} />
          </View>
        )}
      </Animated.View>
    </PrivateLayout>
  );
}
