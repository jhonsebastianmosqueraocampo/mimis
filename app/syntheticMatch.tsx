import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { ActivityIndicator, Card, Chip } from "react-native-paper";
import PrivateLayout from "./privateLayout";

type syntheticMatch = {
  id: string;
  date: Date;
  city: string;
  field: string;
  opponent: string;
  home: number;
  away: number;
  youtube: string;
};

export default function SyntheticMatch() {
  const [activeTab, setActiveTab] = useState<"historial" | "proximos" | "envivo">("historial");
  const [search, setSearch] = useState("");
  const [orderAsc, setOrderAsc] = useState(false);
  const [loading, setLoading] = useState(false);

  /* 🏟️ Mock: Historial */
  const matches: syntheticMatch[] = [
    {
      id: "1",
      date: new Date("2025-10-10"),
      city: "Medellín",
      field: "Cancha La 10",
      opponent: "F.C. Titanes",
      home: 5,
      away: 3,
      youtube: "https://www.youtube.com/watch?v=example1",
    },
    {
      id: "2",
      date: new Date("2025-09-25"),
      city: "Envigado",
      field: "Cancha La Central",
      opponent: "Atlético Verde",
      home: 4,
      away: 4,
      youtube: "https://www.youtube.com/watch?v=example2",
    },
    {
      id: "3",
      date: new Date("2025-09-02"),
      city: "Bello",
      field: "Cancha Los Álamos",
      opponent: "Los Cracks",
      home: 3,
      away: 1,
      youtube: "https://www.youtube.com/watch?v=example3",
    },
  ];

  /* 🏟️ Mock: Próximos partidos */
  const nextMatches: syntheticMatch[] = [
    {
      id: "4",
      date: new Date("2025-10-30"),
      city: "Itagüí",
      field: "Cancha Sintética del Sur",
      opponent: "Real Antioquia",
      home: 0,
      away: 0,
      youtube: "",
    },
    {
      id: "5",
      date: new Date("2025-11-10"),
      city: "Sabaneta",
      field: "Cancha El Golazo",
      opponent: "Deportivo Norte",
      home: 0,
      away: 0,
      youtube: "",
    },
  ];

  /* 🔍 Filtro + orden */
  const filteredMatches = matches
    .filter(
      (m) =>
        m.city.toLowerCase().includes(search.toLowerCase()) ||
        m.field.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      orderAsc
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime()
    );

  const filteredNext = nextMatches.filter(
    (m) =>
      m.city.toLowerCase().includes(search.toLowerCase()) ||
      m.field.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  /** 🏁 Render: Historial */
  const renderHistorial = () => (
    <>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Buscar por ciudad o cancha..."
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
        {filteredMatches.map((m) => (
          <Card key={m.id} style={styles.card}>
            <View style={styles.matchHeader}>
              <Text style={styles.date}>
                {m.date.toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <TouchableOpacity
                style={styles.youtubeRow}
                onPress={() => Linking.openURL(m.youtube)}
              >
                <Ionicons name="logo-youtube" size={18} color="red" />
                <Text style={styles.youtubeText}>Ver resumen</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.matchInfo}>
              <Image
                source={{ uri: "https://media.api-sports.io/football/teams/541.png" }}
                style={styles.teamLogo}
              />
              <Text style={styles.vsText}>MIMIS vs {m.opponent}</Text>
            </View>

            <Text style={styles.result}>
              {m.home} - {m.away}
            </Text>
            <Text style={styles.location}>
              📍 {m.field}, {m.city}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </>
  );

  /** ⏰ Render: Próximos partidos */
  const renderProximos = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {filteredNext.map((m) => (
        <Card key={m.id} style={styles.card}>
          <Text style={styles.date}>
            {m.date.toLocaleDateString("es-CO", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <View style={styles.matchInfo}>
            <Image
              source={{ uri: "https://media.api-sports.io/football/teams/541.png" }}
              style={styles.teamLogo}
            />
            <Text style={styles.vsText}>MIMIS vs {m.opponent}</Text>
          </View>
          <Text style={styles.location}>
            📍 {m.field}, {m.city}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );

  /** 🎥 Render: En vivo */
  const renderEnVivo = () => (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.title}>⚽ Cómo jugar un partido contra MIMIS</Text>
      {[
        "1️⃣ Crea tu equipo o inscríbelo en la app.",
        "2️⃣ Registra a tus jugadores (mínimo 5).",
        "3️⃣ Elige una fecha disponible para el encuentro.",
        "4️⃣ Espera confirmación del equipo MIMIS.",
        "5️⃣ Disfruta el partido y compártelo en redes.",
      ].map((step, i) => (
        <Card key={i} style={styles.stepCard}>
          <Text style={styles.stepText}>{step}</Text>
        </Card>
      ))}

      <TouchableOpacity
        style={styles.liveButton}
        onPress={() => console.log("Ver partido en vivo")}
      >
        <Text style={styles.liveButtonText}>🎥 Ver partido en vivo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PrivateLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🏟️ Partidos de Sintética</Text>

        {/* Chips */}
        <View style={styles.chipsRow}>
          {[
            { key: "historial", label: "Historial" },
            { key: "proximos", label: "Próximos Partidos" },
            { key: "envivo", label: "En Vivo" },
          ].map((tab) => (
            <Chip
              key={tab.key}
              mode={activeTab === tab.key ? "flat" : "outlined"}
              style={[styles.chip, activeTab === tab.key && styles.chipSelected]}
              textStyle={{ color: activeTab === tab.key ? "#FFF" : "#000" }}
              onPress={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </Chip>
          ))}
        </View>

        {activeTab === "historial" && renderHistorial()}
        {activeTab === "proximos" && renderProximos()}
        {activeTab === "envivo" && renderEnVivo()}
      </ScrollView>
    </PrivateLayout>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 12 },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  chip: { borderColor: "#1DB954" },
  chipSelected: { backgroundColor: "#1DB954" },
  search: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#000",
  },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  orderBtn: {
    borderWidth: 1,
    borderColor: "#1DB954",
    padding: 8,
    borderRadius: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 13, fontWeight: "bold", color: "#333" },
  youtubeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  youtubeText: { color: "red", fontSize: 12, fontWeight: "500" },
  matchInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
  },
  teamLogo: { width: 35, height: 35, borderRadius: 4 },
  vsText: { fontSize: 14, fontWeight: "bold", color: "#111" },
  result: { fontSize: 15, fontWeight: "bold", color: "#1DB954", marginTop: 6 },
  location: { fontSize: 12, color: "#555", marginTop: 4 },
  stepCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  stepText: { fontSize: 13, color: "#333" },
  liveButton: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  liveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});