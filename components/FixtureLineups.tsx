import { useFetch } from "@/hooks/FetchContext";
import { Lineup } from "@/types";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
    ActivityIndicator,
    Avatar,
    Card,
    Text,
} from "react-native-paper";
import FootballField from "./FootballField";

type FixtureLineupsProps = {
  fixtureId: string;
};

const PlayerMarker = ({ name, number }: { name: string; number: number }) => (
  <View style={{ alignItems: "center", margin: 4 }}>
    <Avatar.Text
      size={36}
      label={String(number)}
      style={{ backgroundColor: "#2e7d32" }}
    />
    <Text style={{ fontSize: 10, marginTop: 2 }} numberOfLines={1}>
      {name}
    </Text>
  </View>
);

const FormationGrid = ({ players }: { players: any[] }) => {
  const grid: Record<number, any[]> = {};
  players.forEach((p) => {
    const [row, col] = p.grid.split(":").map(Number);
    if (!grid[row]) grid[row] = [];
    grid[row].push({ ...p, col });
  });

  return (
    <View style={{ backgroundColor: "#388e3c", padding: 8, borderRadius: 8 }}>
      {Object.keys(grid)
        .sort((a, b) => Number(a) - Number(b))
        .map((row) => (
          <View
            key={row}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginVertical: 10,
            }}
          >
            {grid[Number(row)]
              .sort((a, b) => a.col - b.col)
              .map((player) => (
                <PlayerMarker
                  key={player.id}
                  name={player.name}
                  number={player.number}
                />
              ))}
          </View>
        ))}
    </View>
  );
};

export default function FixtureLineups({ fixtureId }: FixtureLineupsProps) {
  const { getLineUp } = useFetch();
  const [lineup, setLineup] = useState<Lineup>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLineup = async () => {
      setLoading(true);
      try {
        const { success, lineup, message } = await getLineUp(fixtureId);
        if (!isMounted) return;
        if (success) setLineup(lineup!);
        else setError(message!);
      } catch {
        if (isMounted) setError("Error al cargar el lineup");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (fixtureId) fetchLineup();
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
        {error || !lineup || lineup.lineups.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              color: "gray",
              fontStyle: "italic",
              marginVertical: 20,
            }}
          >
            Alineaciones aún no disponibles
          </Text>
        ) : (
          lineup.lineups.map((team, i) => (
            <View key={i} style={{ marginBottom: 24 }}>
              {/* Encabezado */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Avatar.Image size={28} source={{ uri: team.team.logo }} />
                <Text style={{ fontWeight: "bold", marginLeft: 8 }}>
                  {team.team.name} ({team.team.formation})
                </Text>
              </View>

              <FootballField players={team.startXI} />

              <Text style={{ marginTop: 10, fontWeight: "600" }}>Suplentes</Text>
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}
              >
                {team.substitutes.map((sub) => (
                  <PlayerMarker
                    key={sub.id}
                    name={sub.name}
                    number={sub.number}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );
}