import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import type { SyntheticMatch } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function SyntheticMatchScreen() {
  const { getSyntheticMatches } = useFetch();

  const [finished, setFinished] = useState<SyntheticMatch[]>([]);
  const [upcoming, setUpcoming] = useState<SyntheticMatch[]>([]);

  const [activeTab, setActiveTab] = useState<"historial" | "proximos">(
    "historial",
  );
  const [search, setSearch] = useState("");
  const [orderAsc, setOrderAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const { success, matches, message } = await getSyntheticMatches();

        if (!isMounted) return;

        if (!success) throw new Error(message || "Error cargando partidos");

        const finishedMatches = matches.filter(
          (m: SyntheticMatch) => m.status === "finished",
        );

        const upcomingMatches = matches.filter(
          (m: SyntheticMatch) => m.status === "scheduled",
        );

        setFinished(finishedMatches);
        setUpcoming(upcomingMatches);
      } catch (e: any) {
        if (isMounted) setError(e.message || "Error al cargar partidos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const filterFn = (m: SyntheticMatch) => {
    const s = search.toLowerCase();

    return (
      m.location?.city?.toLowerCase().includes(s) ||
      m.location?.field?.toLowerCase().includes(s) ||
      m.homeTeam?.name?.toLowerCase().includes(s) ||
      m.awayTeam?.name?.toLowerCase().includes(s)
    );
  };

  const sortByDate = (a: SyntheticMatch, b: SyntheticMatch) => {
    const da = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const db = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;

    return orderAsc ? da - db : db - da;
  };

  const filteredFinished = useMemo(
    () => finished.filter(filterFn).sort(sortByDate),
    [finished, search, orderAsc],
  );

  const filteredUpcoming = useMemo(
    () =>
      upcoming.filter(filterFn).sort((a, b) => {
        const da = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const db = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return da - db;
      }),
    [upcoming, search],
  );

  if (loading) {
    return (
      <Loading
        visible
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "Fecha pendiente";

    return new Date(iso).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ScoreLine = ({ m }: { m: SyntheticMatch }) => {
    if (m.status === "scheduled")
      return <Text style={styles.resultMuted}>Programado</Text>;

    if (m.status === "cancelled")
      return (
        <Text style={[styles.resultMuted, { color: "#e53935" }]}>
          Cancelado
        </Text>
      );

    if (m.status === "invitation")
      return <Text style={styles.resultMuted}>Pendiente</Text>;

    const home = m.score?.home;
    const away = m.score?.away;

    if (typeof home !== "number" || typeof away !== "number") {
      return <Text style={styles.resultMuted}>Marcador no disponible</Text>;
    }

    return (
      <Text style={styles.result}>
        {home} - {away}
      </Text>
    );
  };

  const MatchCard = ({
    m,
    showLinks,
  }: {
    m: SyntheticMatch;
    showLinks?: boolean;
  }) => (
    <Card key={m.id} style={styles.card}>
      <View style={styles.matchHeader}>
        <Text style={styles.date}>{formatDate(m.scheduledAt)}</Text>

        {showLinks && m.youtubeUrl ? (
          <TouchableOpacity
            style={styles.youtubeRow}
            onPress={() => Linking.openURL(m.youtubeUrl!)}
          >
            <Ionicons name="logo-youtube" size={18} color="red" />
            <Text style={styles.youtubeText}>Ver resumen</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.matchInfo}>
        <Image
          source={{
            uri: m.homeTeam?.logo || "https://via.placeholder.com/40",
          }}
          style={styles.teamLogo}
        />

        <Text style={styles.vsText}>
          {m.homeTeam?.name || "TBD"} vs {m.awayTeam?.name || "TBD"}
        </Text>

        <Image
          source={{
            uri: m.awayTeam?.logo || "https://via.placeholder.com/40",
          }}
          style={styles.teamLogo}
        />
      </View>

      <ScoreLine m={m} />

      <Text style={styles.location}>
        📍 {m.location?.field || "Cancha por confirmar"},{" "}
        {m.location?.city || "Ciudad pendiente"}
      </Text>

      {!!m.location?.mapsUrl && (
        <TouchableOpacity onPress={() => Linking.openURL(m.location!.mapsUrl!)}>
          <Text style={styles.mapsLink}>Abrir en Maps</Text>
        </TouchableOpacity>
      )}

      {m.status === "scheduled" && m.liveUrl ? (
        <TouchableOpacity
          style={styles.liveButton}
          onPress={() => Linking.openURL(m.liveUrl!)}
        >
          <Text style={styles.liveButtonText}>🎥 Ver transmisión</Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );

  const renderHistorial = () => (
    <>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Buscar por equipos, ciudad o cancha..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={[styles.search, { flex: 1 }]}
        />
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={() => setOrderAsc(!orderAsc)}
        >
          <Ionicons
            name={orderAsc ? "arrow-up" : "arrow-down"}
            size={20}
            color="#1DB954"
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredFinished.map((m) => MatchCard({ m, showLinks: true }))}
        {filteredFinished.length === 0 && (
          <Text style={styles.emptyText}>No hay partidos jugados aún.</Text>
        )}
      </ScrollView>
    </>
  );

  const renderProximos = () => (
    <>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Buscar próximos..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={[styles.search, { flex: 1 }]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredUpcoming.map((m) => MatchCard({ m }))}
        {filteredUpcoming.length === 0 && (
          <Text style={styles.emptyText}>No hay próximos partidos.</Text>
        )}
      </ScrollView>
    </>
  );

  return (
    <PrivateLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🏟️ Partidos de Sintética</Text>

        {!!error && (
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        )}

        <View style={styles.chipsRow}>
          {[
            { key: "historial", label: "Historial" },
            { key: "proximos", label: "Próximos" },
            { key: "envivo", label: "En Vivo" },
          ].map((tab) => (
            <Chip
              key={tab.key}
              mode={activeTab === tab.key ? "flat" : "outlined"}
              style={[
                styles.chip,
                activeTab === tab.key && styles.chipSelected,
              ]}
              textStyle={{ color: activeTab === tab.key ? "#FFF" : "#000" }}
              onPress={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </Chip>
          ))}
        </View>

        <View style={{ marginVertical: 12, alignItems: "center" }}>
          <AdBanner />
        </View>

        {activeTab === "historial" && renderHistorial()}
        {activeTab === "proximos" && renderProximos()}
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  chip: { borderRadius: 20 },
  chipSelected: { backgroundColor: "#1DB954" },

  filterRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  search: { backgroundColor: "#fff", padding: 10, borderRadius: 12 },
  orderBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  card: { marginBottom: 12, padding: 12, borderRadius: 14 },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 13, color: "#666" },

  youtubeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  youtubeText: { color: "#444", fontSize: 13 },

  matchInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  vsText: { fontSize: 15, fontWeight: "700" },

  result: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  resultMuted: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
  },

  location: { marginTop: 8, color: "#444" },
  mapsLink: { marginTop: 6, color: "#1DB954", fontWeight: "700" },

  liveButton: {
    marginTop: 10,
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  liveButtonText: { color: "#fff", fontWeight: "800" },

  emptyText: { marginTop: 16, textAlign: "center", opacity: 0.7 },
});
