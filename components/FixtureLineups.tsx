import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { LiveEvent, TeamLineup, TeamLineupLive } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import FootballLineupField from "./FootballField";
import Loading from "./Loading";

type FixtureLineupsProps = {
  fixtureId: string;

  // ✅ opcional: si viene, NO se hace fetch
  lineups?: TeamLineup[] | TeamLineupLive[] | null;

  // extras
  events?: LiveEvent[] | null;
  status?: {
    long: string;
    short: string;
    elapsed?: number | null;
  } | null;

  // ✅ opcional: fuerza a siempre consultar backend
  forceFetch?: boolean;
};

export default function FixtureLineups({
  fixtureId,
  lineups,
  events,
  status,
  forceFetch = false,
}: FixtureLineupsProps) {
  const { getLineUp } = useFetch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ fuente interna (cuando no vienen por props)
  const [fetchedLineups, setFetchedLineups] = useState<
    TeamLineup[] | TeamLineupLive[] | null
  >(null);

  const hasPropLineups = Array.isArray(lineups);
  const shouldFetch = !!fixtureId && (forceFetch || !hasPropLineups);

  const safeStatus = status ?? { long: "Unknown", short: "NS", elapsed: null };
  const safeEvents = events ?? [];

  const finalLineups = useMemo(() => {
    // prioridad: props -> fetch -> []
    return (hasPropLineups ? lineups : fetchedLineups) ?? [];
  }, [hasPropLineups, lineups, fetchedLineups]);

  const fetchLineups = async () => {
    setLoading(true);
    setError(null);

    try {
      const { success, lineup, message } = await getLineUp(fixtureId);

      if (!success) {
        setFetchedLineups([]);
        setError(message ?? "No se pudieron cargar las alineaciones");
        return;
      }

      // tu backend a veces devuelve { lineups: [...] }
      const arr = lineup?.lineups ?? lineup ?? [];
      setFetchedLineups(Array.isArray(arr) ? arr : []);
    } catch {
      setFetchedLineups([]);
      setError("Error al cargar el lineup");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldFetch) return;
    fetchLineups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, shouldFetch]);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const hasLineups = finalLineups.length > 0;

  return (
    <Card
      style={{ marginTop: 1, marginBottom: 1, borderRadius: 12, elevation: 2 }}
    >
      <Card.Title title="Alineaciones" titleVariant="titleMedium" />
      <Card.Content>
        {error ? (
          <>
            <Text
              style={{
                textAlign: "center",
                color: "gray",
                fontStyle: "italic",
                marginVertical: 10,
              }}
            >
              {error}
            </Text>
            {shouldFetch ? (
              <Button mode="outlined" onPress={fetchLineups}>
                Reintentar
              </Button>
            ) : null}
          </>
        ) : !hasLineups ? (
          <Text
            style={{
              textAlign: "center",
              color: "gray",
              fontStyle: "italic",
              marginVertical: 20,
            }}
          >
            Alineaciones no disponibles
          </Text>
        ) : (
          <FootballLineupField
            fixtureId={fixtureId}
            lineup={finalLineups}
            liveEvents={safeEvents}
            status={safeStatus}
          />
        )}
        <View style={{ marginVertical: 24, alignItems: "center" }}>
          <AdBanner />
        </View>
      </Card.Content>
    </Card>
  );
}
