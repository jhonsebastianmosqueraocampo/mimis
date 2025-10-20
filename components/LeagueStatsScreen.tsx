import { useFetch } from "@/hooks/FetchContext";
import { PlayerStat, StatsByCategory } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  DataTable,
  Divider,
  Text,
} from "react-native-paper";

type Props = {
  leagueId: string;
};

const items = [
  { id: "topScorers", name: "Goleadores", valueKey: "goals" },
  { id: "topAssists", name: "Asistentes", valueKey: "assists" },
  { id: "topYellowCards", name: "Amarillas", valueKey: "yellow" },
  { id: "topRedCards", name: "Rojas", valueKey: "red" },
  { id: "topRating", name: "Rating", valueKey: "rating" },
  { id: "topDribblesSuccess", name: "Dribbles", valueKey: "dribblesSuccess" },
  { id: "topKeyPasses", name: "Pases clave", valueKey: "keyPasses" },
];

export default function LeagueStatsScreen({ leagueId }: Props) {
  const { getLeagueStats } = useFetch();

  const [stats, setStats] = useState<StatsByCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState(items[0]);

  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  useEffect(() => {
    setPage(0);
  }, [selectedItem, itemsPerPage]);

  useEffect(() => {
    let isMounted = true;

    const getStatsLeague = async () => {
      setLoading(true);
      try {
        const season = 0;
        const { success, stats, message } = await getLeagueStats(
          leagueId,
          season
        );

        if (!isMounted) return;

        if (success) {
          setStats(stats!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (leagueId) {
      getStatsLeague();
    }

    return () => {
      isMounted = false;
    };
  }, [leagueId]);

  const dataForSelected: PlayerStat[] = useMemo(() => {
    if (!stats) return [];
    const category = selectedItem.id as keyof StatsByCategory;
    return stats[category] ?? [];
  }, [stats, selectedItem]);

  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, dataForSelected.length);
  const pageSlice = dataForSelected.slice(from, to);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando estadísticas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={{ color: "white" }}>{error}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text>No hay datos para mostrar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" elevated>
        <Appbar.Content title="Estadísticas de la Liga" />
      </Appbar.Header>

      <View style={styles.content}>
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
                selected={selectedItem === item}
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

        <Divider />

        <Card style={styles.tableCard}>
          <Card.Title
            title={`Top 10 — ${selectedItem.name}`}
            titleVariant="titleMedium"
          />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={{ flex: 2 }}>Jugador</DataTable.Title>
                <DataTable.Title style={{ flex: 2 }}>Equipo</DataTable.Title>
                <DataTable.Title numeric>Valor</DataTable.Title>
              </DataTable.Header>

              {pageSlice.length > 0 ? (
                pageSlice.map((p, i) => (
                  <DataTable.Row key={`${selectedItem.id}-${from + i}`}>
                    <DataTable.Cell style={{ flex: 2 }}>
                      {p.name}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2 }}>
                      {p.teamName}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {p[selectedItem.valueKey as keyof PlayerStat]}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row>
                  <DataTable.Cell>No disponible</DataTable.Cell>
                </DataTable.Row>
              )}

              <DataTable.Pagination
                page={page}
                numberOfPages={Math.max(
                  1,
                  Math.ceil(dataForSelected.length / itemsPerPage)
                )}
                onPageChange={setPage}
                label={
                  dataForSelected.length
                    ? `${from + 1}-${to} de ${dataForSelected.length}`
                    : "0 de 0"
                }
                numberOfItemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                showFastPaginationControls
                numberOfItemsPerPageList={[5, 10]}
                selectPageDropdownLabel={"Filas por página"}
              />
            </DataTable>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  content: { padding: 12, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: { marginBottom: 8, fontWeight: "600" },
  switcherCard: {
    borderRadius: 16,
    elevation: 2,
  },
  tableCard: {
    borderRadius: 16,
    elevation: 3,
  },
  errorCard: {
    backgroundColor: "#d9534f",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipContainer: {
    flexDirection: "row",
  },
  tabBar: {
    marginVertical: 12,
  },
  chip: {
    marginRight: 8,
    borderColor: "#1DB954",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  firstChip: {
    marginLeft: 12,
  },

  lastChip: {
    marginRight: 12,
  },
  chipSelected: {
    backgroundColor: "#1DB954",
  },
});
