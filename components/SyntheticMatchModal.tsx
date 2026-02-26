import type { SyntheticMatch, SyntheticMatchStatus } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import {
    Button,
    Chip,
    Divider,
    IconButton,
    Text,
    TextInput,
} from "react-native-paper";

type Form = {
  homeName: string;
  homeLogo: string;
  awayName: string;
  awayLogo: string;

  scheduledAt: string; // ISO o "YYYY-MM-DDTHH:mm"
  status: SyntheticMatchStatus;

  scoreHome: string; // para inputs
  scoreAway: string;

  city: string;
  field: string;
  address: string;
  mapsUrl: string;

  youtubeUrl: string;
  liveUrl: string;
};

type Props = {
  visible: boolean;
  editing: SyntheticMatch | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    data: {
      homeTeam: { name: string; logo?: string };
      awayTeam: { name: string; logo?: string };
      scheduledAt: string;
      status: SyntheticMatchStatus;
      score: { home: number | null; away: number | null };
      location: {
        city: string;
        field: string;
        address?: string;
        mapsUrl?: string;
      };
      youtubeUrl?: string;
      liveUrl?: string;
    };
  }) => Promise<boolean>;
};

const STATUSES: { key: SyntheticMatchStatus; label: string }[] = [
  { key: "scheduled", label: "Próximo" },
  { key: "live", label: "En vivo" },
  { key: "finished", label: "Finalizado" },
  { key: "cancelled", label: "Cancelado" },
];

const toInputDate = (iso: string) => {
  // intentamos dejarlo como "YYYY-MM-DDTHH:mm"
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function SyntheticMatchModal({
  visible,
  editing,
  onClose,
  onSave,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [f, setF] = useState<Form>({
    homeName: "",
    homeLogo: "",
    awayName: "",
    awayLogo: "",
    scheduledAt: toInputDate(new Date().toISOString()),
    status: "scheduled",
    scoreHome: "",
    scoreAway: "",
    city: "",
    field: "",
    address: "",
    mapsUrl: "",
    youtubeUrl: "",
    liveUrl: "",
  });

  useEffect(() => {
    setErr(null);

    if (!editing) {
      setF((prev) => ({
        ...prev,
        homeName: "",
        homeLogo: "",
        awayName: "",
        awayLogo: "",
        scheduledAt: toInputDate(new Date().toISOString()),
        status: "scheduled",
        scoreHome: "",
        scoreAway: "",
        city: "",
        field: "",
        address: "",
        mapsUrl: "",
        youtubeUrl: "",
        liveUrl: "",
        notes: "",
      }));
      return;
    }

    setF({
      homeName: editing.homeTeam?.name ?? "",
      homeLogo: editing.homeTeam?.logo ?? "",
      awayName: editing.awayTeam?.name ?? "",
      awayLogo: editing.awayTeam?.logo ?? "",
      scheduledAt: toInputDate(editing.scheduledAt),
      status: editing.status,
      scoreHome: editing.score?.home == null ? "" : String(editing.score.home),
      scoreAway: editing.score?.away == null ? "" : String(editing.score.away),
      city: editing.location?.city ?? "",
      field: editing.location?.field ?? "",
      address: editing.location?.address ?? "",
      mapsUrl: editing.location?.mapsUrl ?? "",
      youtubeUrl: editing.youtubeUrl ?? "",
      liveUrl: editing.liveUrl ?? "",
    });
  }, [editing, visible]);

  const showScore = f.status === "live" || f.status === "finished";

  const valid = useMemo(() => {
    if (!f.homeName.trim() || !f.awayName.trim()) return false;
    if (!f.city.trim() || !f.field.trim()) return false;
    if (!f.scheduledAt.trim()) return false;

    if (showScore) {
      const h = Number(f.scoreHome);
      const a = Number(f.scoreAway);
      if (!Number.isFinite(h) || h < 0) return false;
      if (!Number.isFinite(a) || a < 0) return false;
    }
    return true;
  }, [f, showScore]);

  const handleSave = async () => {
    setErr(null);
    if (!valid) {
      setErr("Completa los campos obligatorios.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: editing?.id,
        data: {
          homeTeam: {
            name: f.homeName.trim(),
            ...(f.homeLogo.trim() ? { logo: f.homeLogo.trim() } : {}),
          },
          awayTeam: {
            name: f.awayName.trim(),
            ...(f.awayLogo.trim() ? { logo: f.awayLogo.trim() } : {}),
          },
          scheduledAt: new Date(f.scheduledAt).toISOString(), // normalizamos
          status: f.status,
          score: {
            home: showScore ? Number(f.scoreHome) : null,
            away: showScore ? Number(f.scoreAway) : null,
          },
          location: {
            city: f.city.trim(),
            field: f.field.trim(),
            ...(f.address.trim() ? { address: f.address.trim() } : {}),
            ...(f.mapsUrl.trim() ? { mapsUrl: f.mapsUrl.trim() } : {}),
          },
          ...(f.youtubeUrl.trim() ? { youtubeUrl: f.youtubeUrl.trim() } : {}),
          ...(f.liveUrl.trim() ? { liveUrl: f.liveUrl.trim() } : {}),
        },
      };

      const ok = await onSave(payload);
      if (!ok) setErr("No se pudo guardar. Revisa el error.");
    } catch (e: any) {
      setErr(e.message || "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={{ fontWeight: "900" }}>
              {editing
                ? `Editar partido #${editing.matchNumber}`
                : "Crear partido"}
            </Text>
            <IconButton icon="close" onPress={onClose} />
          </View>

          <Divider />

          <ScrollView
            style={{ marginTop: 10 }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {!!err && (
              <Text
                style={{
                  color: "#b71c1c",
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                {err}
              </Text>
            )}

            <Text style={styles.section}>Equipos</Text>

            <TextInput
              mode="outlined"
              label="Equipo local (home)"
              value={f.homeName}
              onChangeText={(v) => setF((p) => ({ ...p, homeName: v }))}
            />
            <TextInput
              mode="outlined"
              label="Logo local (URL opcional)"
              value={f.homeLogo}
              onChangeText={(v) => setF((p) => ({ ...p, homeLogo: v }))}
              style={{ marginTop: 10 }}
            />

            <TextInput
              mode="outlined"
              label="Equipo visitante (away)"
              value={f.awayName}
              onChangeText={(v) => setF((p) => ({ ...p, awayName: v }))}
              style={{ marginTop: 10 }}
            />
            <TextInput
              mode="outlined"
              label="Logo visitante (URL opcional)"
              value={f.awayLogo}
              onChangeText={(v) => setF((p) => ({ ...p, awayLogo: v }))}
              style={{ marginTop: 10 }}
            />

            <Text style={styles.section}>Fecha y estado</Text>

            <TextInput
              mode="outlined"
              label="Fecha y hora (YYYY-MM-DDTHH:mm)"
              value={f.scheduledAt}
              onChangeText={(v) => setF((p) => ({ ...p, scheduledAt: v }))}
            />

            <View style={styles.chipsRow}>
              {STATUSES.map((s) => (
                <Chip
                  key={s.key}
                  selected={f.status === s.key}
                  onPress={() => setF((p) => ({ ...p, status: s.key }))}
                  style={[
                    styles.chip,
                    f.status === s.key && styles.chipSelected,
                  ]}
                  textStyle={{ color: f.status === s.key ? "#fff" : "#111" }}
                >
                  {s.label}
                </Chip>
              ))}
            </View>

            {showScore && (
              <>
                <Text style={styles.section}>Marcador</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    mode="outlined"
                    label="Home"
                    keyboardType="numeric"
                    value={f.scoreHome}
                    onChangeText={(v) => setF((p) => ({ ...p, scoreHome: v }))}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Away"
                    keyboardType="numeric"
                    value={f.scoreAway}
                    onChangeText={(v) => setF((p) => ({ ...p, scoreAway: v }))}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}

            <Text style={styles.section}>Ubicación</Text>

            <TextInput
              mode="outlined"
              label="Ciudad"
              value={f.city}
              onChangeText={(v) => setF((p) => ({ ...p, city: v }))}
            />
            <TextInput
              mode="outlined"
              label="Cancha"
              value={f.field}
              onChangeText={(v) => setF((p) => ({ ...p, field: v }))}
              style={{ marginTop: 10 }}
            />
            <TextInput
              mode="outlined"
              label="Dirección (opcional)"
              value={f.address}
              onChangeText={(v) => setF((p) => ({ ...p, address: v }))}
              style={{ marginTop: 10 }}
            />
            <TextInput
              mode="outlined"
              label="Link Maps (opcional)"
              value={f.mapsUrl}
              onChangeText={(v) => setF((p) => ({ ...p, mapsUrl: v }))}
              style={{ marginTop: 10 }}
            />

            <Text style={styles.section}>Links y notas</Text>

            <TextInput
              mode="outlined"
              label="YouTube (resumen, opcional)"
              value={f.youtubeUrl}
              onChangeText={(v) => setF((p) => ({ ...p, youtubeUrl: v }))}
            />
            <TextInput
              mode="outlined"
              label="Live URL (opcional)"
              value={f.liveUrl}
              onChangeText={(v) => setF((p) => ({ ...p, liveUrl: v }))}
              style={{ marginTop: 10 }}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={!valid || saving}
              style={{ marginTop: 16 }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>

            <Button
              mode="text"
              onPress={onClose}
              disabled={saving}
              style={{ marginTop: 6 }}
            >
              Cancelar
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: { marginTop: 14, marginBottom: 8, fontWeight: "900", opacity: 0.85 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { borderRadius: 999 },
  chipSelected: { backgroundColor: "#1DB954" },
});
