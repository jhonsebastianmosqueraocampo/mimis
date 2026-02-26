import Loading from "@/components/Loading";
import SyntheticMatchModal from "@/components/SyntheticMatchModal";
import { useFetch } from "@/hooks/FetchContext";
import type {
  CreateSyntheticMatchDTO,
  SyntheticMatch,
  SyntheticMatchPayload,
  SyntheticMatchStatus,
  UpdateSyntheticMatchDTO,
} from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  Text,
  TextInput,
} from "react-native-paper";

const STATUS_TABS: { key: "all" | SyntheticMatchStatus; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "scheduled", label: "Próximos" },
  { key: "live", label: "En vivo" },
  { key: "finished", label: "Jugados" },
  { key: "cancelled", label: "Cancelados" },
];

export default function RegisterSyntheticMatch() {
  const { getSyntheticMatches, createSyntheticMatch, updateSyntheticMatch } =
    useFetch();

  const [active, setActive] = useState<"all" | SyntheticMatchStatus>("all");
  const [search, setSearch] = useState("");
  const [orderAsc, setOrderAsc] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [matches, setMatches] = useState<SyntheticMatch[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<SyntheticMatch | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (m: SyntheticMatch) => {
    setEditing(m);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditing(null);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // asumo que devuelve { success, data:{upcoming,finished,live}, message }
      const { success, syntheticMatches, message } =
        await getSyntheticMatches();
      if (!success) throw new Error(message || "Error cargando partidos");

      // unimos todo en un solo array
      const all = [
        ...(syntheticMatches?.upcoming ?? []),
        ...(syntheticMatches?.live ?? []),
        ...(syntheticMatches?.finished ?? []),
      ];

      // evita duplicados por id
      const map = new Map<string, SyntheticMatch>();
      for (const m of all) map.set(m.id, m);

      setMatches(Array.from(map.values()));
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return [...matches]
      .filter((m) => {
        if (active !== "all" && m.status !== active) return false;

        if (!s) return true;
        const blob = [
          m.homeTeam?.name,
          m.awayTeam?.name,
          m.location?.city,
          m.location?.field,
          m.status,
        ]
          .join(" ")
          .toLowerCase();

        return blob.includes(s);
      })
      .sort((a, b) => {
        const da = new Date(a.scheduledAt).getTime();
        const db = new Date(b.scheduledAt).getTime();
        return orderAsc ? da - db : db - da;
      });
  }, [matches, active, search, orderAsc]);

  const labelStatus = (st: SyntheticMatchStatus) => {
    switch (st) {
      case "scheduled":
        return "Próximo";
      case "live":
        return "En vivo";
      case "finished":
        return "Finalizado";
      case "cancelled":
        return "Cancelado";
      default:
        return st;
    }
  };

  const statusChipStyle = (st: SyntheticMatchStatus) => {
    if (st === "live") return { backgroundColor: "#111" };
    if (st === "finished") return { backgroundColor: "#1DB954" };
    if (st === "cancelled") return { backgroundColor: "#e53935" };
    return { backgroundColor: "#666" };
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderScore = (m: SyntheticMatch) => {
    if (m.status === "scheduled") return "Programado";
    if (m.status === "cancelled") return "Cancelado";

    const h = m.score?.home;
    const a = m.score?.away;
    if (typeof h !== "number" || typeof a !== "number") return "Sin marcador";

    return `${h} - ${a}`;
  };

  // Guardar desde modal (create / update)
  const handleSave = async (payload: {
    id?: string;
    data: SyntheticMatchPayload;
  }) => {
    try {
      if (payload.id) {
        const patch: UpdateSyntheticMatchDTO = {
          status: payload.data.status,
          scheduledAt: payload.data.scheduledAt,
          location: payload.data.location,
          youtubeUrl: payload.data.youtubeUrl,
          liveUrl: payload.data.liveUrl,
          homeTeam: payload.data.homeTeam,
          awayTeam: payload.data.awayTeam,
        };

        // solo mandamos score si aplica
        if (
          payload.data.status === "live" ||
          payload.data.status === "finished"
        ) {
          patch.score = {
            home: payload.data.score.home ?? 0,
            away: payload.data.score.away ?? 0,
          };
        }

        const { success, match, message } = await updateSyntheticMatch(
          payload.id,
          patch
        );
        if (!success) throw new Error(message || "No se pudo actualizar");

        setMatches((prev) =>
          prev.map((m) => (m.id === match!.id ? match! : m))
        );
      } else {
        const dataMatch: CreateSyntheticMatchDTO = {
          homeTeam: payload.data.homeTeam,
          awayTeam: payload.data.awayTeam,
          scheduledAt: payload.data.scheduledAt,
          location: payload.data.location,
          youtubeUrl: payload.data.youtubeUrl,
          liveUrl: payload.data.liveUrl,
          status: "scheduled",
        };

        const { success, match, message } =
          await createSyntheticMatch(dataMatch);
        if (!success) throw new Error(message || "No se pudo crear");

        setMatches((prev) => [match!, ...prev]);
      }

      closeModal();
      return true;
    } catch (e: any) {
      setError(e.message || "Error guardando");
      return false;
    }
  };

  if (loading) {
    return <Loading visible title="Cargando" subtitle="Trayendo partidos..." />;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content
          title="Sintética (Admin)"
          subtitle="Crear y editar partidos"
        />
        <Appbar.Action icon="refresh" onPress={load} />
      </Appbar.Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* TOP BAR */}
        <View style={styles.topRow}>
          <Button mode="contained" onPress={openCreate} icon="plus">
            Crear partido
          </Button>

          <Button
            mode="outlined"
            onPress={() => setOrderAsc((v) => !v)}
            icon="swap-vertical"
          >
            {orderAsc ? "Asc" : "Desc"}
          </Button>
        </View>

        {!!error && (
          <Card style={[styles.card, { backgroundColor: "#ffecec" }]}>
            <Card.Content>
              <Text style={{ color: "#b71c1c", fontWeight: "700" }}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* SEARCH */}
        <TextInput
          mode="outlined"
          label="Buscar"
          placeholder="Equipos, cancha o ciudad"
          value={search}
          onChangeText={setSearch}
          style={{ marginTop: 10 }}
        />

        {/* FILTER CHIPS */}
        <View style={styles.chipsRow}>
          {STATUS_TABS.map((t) => (
            <Chip
              key={t.key}
              selected={active === t.key}
              onPress={() => setActive(t.key)}
              style={[styles.chip, active === t.key && styles.chipSelected]}
              textStyle={{ color: active === t.key ? "#fff" : "#111" }}
            >
              {t.label}
            </Chip>
          ))}
        </View>

        <Divider style={{ marginVertical: 10 }} />

        {/* LIST */}
        {filtered.map((m) => (
          <Card key={m.id} style={styles.card} onPress={() => openEdit(m)}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>
                  #{m.matchNumber} · {m.homeTeam.name} vs {m.awayTeam.name}
                </Text>

                <Chip
                  style={[styles.statusPill, statusChipStyle(m.status)]}
                  textStyle={{ color: "#fff", fontWeight: "800" }}
                >
                  {labelStatus(m.status)}
                </Chip>
              </View>

              <Text style={styles.meta}>{formatDate(m.scheduledAt)}</Text>
              <Text style={styles.meta}>
                📍 {m.location.field}, {m.location.city}
              </Text>

              <Text style={styles.score}>{renderScore(m)}</Text>
            </Card.Content>
          </Card>
        ))}

        {filtered.length === 0 && (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <Text style={{ opacity: 0.7 }}>
              No hay partidos para ese filtro.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <SyntheticMatchModal
        visible={modalVisible}
        editing={editing}
        onClose={closeModal}
        onSave={handleSave}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { borderRadius: 999 },
  chipSelected: { backgroundColor: "#1DB954" },
  card: { marginTop: 12, borderRadius: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  title: { fontWeight: "900", flex: 1 },
  meta: { opacity: 0.75, marginTop: 4 },
  score: { marginTop: 8, fontSize: 18, fontWeight: "900", textAlign: "center" },
  statusPill: { borderRadius: 999, alignSelf: "flex-start" },
});
