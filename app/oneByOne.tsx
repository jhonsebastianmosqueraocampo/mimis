import OneByOneDetail from "@/components/OneByOneDetail";
import { useFetch } from "@/hooks/FetchContext";
import { OneByOne } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    SectionList,
    StyleSheet,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Text,
    TextInput,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

// Helpers
const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================
// COMPONENTE PRINCIPAL
// =========================
export default function OneByOne() {
  const { getOneByOne } = useFetch();

  const [list, setList] = useState<OneByOne[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"recent" | "old">("recent");
  const [selected, setSelected] = useState<OneByOne | null>(null);

  // Cargar del backend
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { success, oneByOneList } = await getOneByOne();
      if (success) setList(oneByOneList);
      setLoading(false);
    };
    load();
  }, []);

  // Filtros básicos
  const processed = useMemo(() => {
    let arr = [...list];

    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter((o) =>
        o.teams.home.name.toLowerCase().includes(s) ||
        o.teams.away.name.toLowerCase().includes(s)
      );
    }

    if (order === "recent") {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return arr;
  }, [list, search, order]);

  // Agrupación por fecha (section list)
  const sections = useMemo(() => {
    const map = new Map<string, OneByOne[]>();

    processed.forEach((o) => {
      const key = formatDateLabel(o.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });

    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [processed]);

  const renderItem = ({ item }: { item: OneByOne }) => {
    const avg =
      item.playerRatings && item.playerRatings.length
        ? item.playerRatings.reduce((a, b) => a + b.rating, 0) /
          item.playerRatings.length
        : 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.matchRow}>
            <View style={styles.teamCol}>
              <Image source={{ uri: item.teams.home.logo }} style={styles.logo} />
              <Text numberOfLines={1} style={styles.teamText}>
                {item.teams.home.name}
              </Text>
            </View>

            <View style={styles.centerCol}>
              <Text style={styles.avg}>{avg.toFixed(1)}</Text>
              <Text style={styles.vs}>Prom. general</Text>
            </View>

            <View style={styles.teamCol}>
              <Image source={{ uri: item.teams.away.logo }} style={styles.logo} />
              <Text numberOfLines={1} style={styles.teamText}>
                {item.teams.away.name}
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            style={styles.btn}
            onPress={() => setSelected(item)}
          >
            Ver análisis
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Análisis Uno por Uno
        </Text>

        <TextInput
          mode="outlined"
          placeholder="Buscar por equipo"
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon="magnify" />}
          style={styles.search}
        />

        <View style={styles.row}>
          <Chip selected={order === "recent"} onPress={() => setOrder("recent")} style={styles.chip}>
            Recientes
          </Chip>
          <Chip selected={order === "old"} onPress={() => setOrder("old")} style={styles.chip}>
            Antiguos
          </Chip>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}

        {selected && (
          <OneByOneDetail
            oneByOne={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 12, fontWeight: "700" },
  search: { marginBottom: 12 },
  row: { flexDirection: "row", marginBottom: 10 },
  chip: { marginRight: 8 },
  card: { marginBottom: 12 },
  matchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamCol: { flex: 1, alignItems: "center" },
  centerCol: { width: 90, alignItems: "center" },
  avg: { fontWeight: "bold", fontSize: 18 },
  vs: { opacity: 0.7, fontSize: 11 },
  logo: { width: 48, height: 48, resizeMode: "contain" },
  teamText: { textAlign: "center", marginTop: 4, fontSize: 12 },
  btn: { marginTop: 10 },
  sectionHeader: { paddingVertical: 6, alignItems: "center" },
  sectionTitle: { opacity: 0.7, fontWeight: "700" },
});