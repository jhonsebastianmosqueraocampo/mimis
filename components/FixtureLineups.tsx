import { useFetch } from "@/hooks/FetchContext";
import { LiveEvent, TeamLineup } from "@/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import FootballLineupField from "./FootballField";

type FixtureLineupsProps = {
  events?: LiveEvent[];
  fixtureId: string;
  status: {
    long: string;
    short: string;
    elapsed?: number | null;
  };
};

export default function FixtureLineups({
  fixtureId,
  events,
  status,
}: FixtureLineupsProps) {
  const { getLineUp } = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lineup, setLineup] = useState<TeamLineup[]>();

  useEffect(() => {
    let isMounted = true;
    const fetchLineup = async () => {
      setLoading(true);
      try {
        const { success, lineup, message } = await getLineUp(fixtureId);
        if (!isMounted) return;
        if (success) setLineup(lineup?.lineups!);
        else setError(message!);
      } catch {
        if (isMounted) setError("Error al cargar el lineup");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (fixtureId) {
      fetchLineup();
    }
    return () => {
      isMounted = false;
    };
  }, [fixtureId]);

  if (loading) {
    return <ActivityIndicator animating={true} style={{ marginTop: 20 }} />;
  }

  return (
    <Card style={{ margin: 10, borderRadius: 12, elevation: 2 }}>
      <Card.Title title="Alineaciones" titleVariant="titleMedium" />
      <Card.Content>
        {/* Caso error o no disponible */}
        {error || !lineup || lineup.length === 0 ? (
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
            lineup={lineup}
            liveEvents={events}
            status={status}
          />
        )}
      </Card.Content>
    </Card>
  );
}
