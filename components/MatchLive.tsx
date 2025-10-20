import { useFetch } from "@/hooks/FetchContext";
import { LiveEvent, LiveMatch } from "@/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  Divider,
  Text,
} from "react-native-paper";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import FixtureLineups from "./FixtureLineups";
import StarRating from "./StarRating";

const { width } = Dimensions.get("window");
const FIELD_W = width - 40;
const FIELD_H = (FIELD_W * 2) / 3;

type MatchLiveProps = { fixtureId: string };

const StatRow = ({
  label,
  home,
  away,
}: {
  label: string;
  home: number;
  away: number;
}) => {
  const total = Math.max(home + away, 1);
  const left = Math.round((home / total) * 100);
  const right = 100 - left;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>{home}</Text>
        <Text style={{ fontWeight: "600" }}>{label}</Text>
        <Text>{away}</Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: "#eee",
          borderRadius: 4,
          overflow: "hidden",
          marginTop: 4,
        }}
      >
        <View
          style={{ width: `${left}%`, height: 8, backgroundColor: "#2e7d32" }}
        />
      </View>
    </View>
  );
};

const FootballField = ({ children }: { children?: React.ReactNode }) => (
  <View style={{ alignItems: "center", marginVertical: 10 }}>
    <Svg
      width={FIELD_W}
      height={FIELD_H}
      style={{ backgroundColor: "#388e3c", borderRadius: 10 }}
    >
      <Rect
        x="2"
        y="2"
        width={FIELD_W - 4}
        height={FIELD_H - 4}
        stroke="white"
        strokeWidth="2"
        fill="none"
        rx="10"
      />
      <Line
        x1={FIELD_W / 2}
        y1={0}
        x2={FIELD_W / 2}
        y2={FIELD_H}
        stroke="white"
        strokeWidth="2"
      />
      <Circle
        cx={FIELD_W / 2}
        cy={FIELD_H / 2}
        r={30}
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <Circle cx={FIELD_W / 2} cy={FIELD_H / 2} r={3} fill="white" />
    </Svg>
    <View style={{ position: "absolute", width: FIELD_W, height: FIELD_H }}>
      {children}
    </View>
  </View>
);

// Posiciona un punto según tipo de evento y qué equipo lo generó (home/away)
function eventToGrid(e: LiveEvent, homeId: number) {
  // Grid 1..6 x 1..6
  const zones = {
    goal: { row: 5, col: 5 },
    shot: { row: 5, col: 4 },
    attack: { row: 4, col: 4 },
    foul: { row: 3, col: 3 },
    card: { row: 3, col: 3 },
    var: { row: 3, col: 3 },
    kickoff: { row: 3, col: 3 },
    default: { row: 3, col: 3 },
  };

  const t = (e.type || "").toLowerCase();
  const d = (e.detail || "").toLowerCase();

  let zone = zones.default;
  if (t === "goal" || d.includes("goal")) zone = zones.goal;
  else if (d.includes("shot") || d.includes("attempt")) zone = zones.shot;
  else if (d.includes("dangerous attack") || d.includes("attack"))
    zone = zones.attack;
  else if (t === "foul" || d.includes("foul")) zone = zones.foul;
  else if (t === "card" || d.includes("card")) zone = zones.card;
  else if (t === "var") zone = zones.var;
  else if (d.includes("kick-off")) zone = zones.kickoff;

  // Si el evento es del visitante, espejar horizontalmente
  const isHome = e.team?.id === homeId;
  const col = isHome ? zone.col : 7 - zone.col;
  return { row: zone.row, col };
}

const PlayerDot = ({
  x,
  y,
  label,
  sub,
}: {
  x: number;
  y: number;
  label: string;
  sub?: boolean;
}) => (
  <View
    style={{
      position: "absolute",
      left: x - 18,
      top: y - 18,
      alignItems: "center",
    }}
  >
    <Avatar.Text
      size={36}
      label={label}
      style={{ backgroundColor: sub ? "#1565c0" : "#1b5e20" }}
    />
  </View>
);

const LineupOnField = ({
  startXI,
}: {
  startXI: { name: string; number: number; grid: string; isSub?: boolean }[];
}) => {
  const rows = 6,
    cols = 6;
  return (
    <FootballField>
      {startXI.map((p, idx) => {
        const [r, c] = p.grid.split(":").map((n) => parseInt(n, 10));
        const x = (c / (cols + 1)) * FIELD_W;
        const y = (r / (rows + 1)) * FIELD_H;
        return (
          <PlayerDot
            key={idx}
            x={x}
            y={y}
            label={String(p.number || "•")}
            sub={p.isSub}
          />
        );
      })}
    </FootballField>
  );
};

export default function MatchLive({ fixtureId }: MatchLiveProps) {
  const { getLiveMatch } = useFetch();
  const [live, setLive] = useState<LiveMatch>();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("timeline");
  const [showAll, setShowAll] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tabs = [
    { key: "timeline", label: "Minuto a minuto", icon: "timeline" },
    { key: "dynamic", label: "Vista dinámica", icon: "soccer-field" },
    { key: "goals", label: "Goles", icon: "soccer" },
    { key: "lineups", label: "Alineación", icon: "account-group" },
    { key: "stats", label: "Estadísticas", icon: "chart-bar" },
  ];

  const fetchLive = async () => {
    try {
      const { success, live } = await getLiveMatch(fixtureId);
      if (success) setLive(live!);
    } catch (e) {
      // opcional: set error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLive();
    // refresh cada 30s si no está FT
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (live?.status?.short !== "FT") fetchLive();
    }, 30000);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  const goals = useMemo(
    () =>
      (live?.events || []).filter(
        (e) =>
          (e.type || "").toLowerCase() === "goal" ||
          (e.detail || "").toLowerCase().includes("goal")
      ),
    [live]
  );

  const lastEvent = useMemo(() => (live?.events || []).slice(-1)[0], [live]);

  const statsCombined = useMemo(() => {
    if (!live?.statistics || live.statistics.length < 2) return [];
    const home = live.statistics.find((s) => s.team.id === live.teams.home.id);
    const away = live.statistics.find((s) => s.team.id === live.teams.away.id);
    if (!home || !away) return [];

    // unir por tipo
    const map = new Map<
      string,
      { label: string; home: number; away: number }
    >();
    home.statistics.forEach((h) => {
      map.set(h.type, { label: h.type, home: toNum(h.value), away: 0 });
    });
    away.statistics.forEach((a) => {
      const cur = map.get(a.type);
      if (cur) cur.away = toNum(a.value);
      else map.set(a.type, { label: a.type, home: 0, away: toNum(a.value) });
    });
    return Array.from(map.values());
  }, [live]);

  function toNum(v: any) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const s = String(v);
    if (s.endsWith("%")) return parseInt(s, 10) || 0;
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  if (loading) {
    return <ActivityIndicator animating style={{ marginTop: 20 }} />;
  }

  if (!live) {
    return (
      <Card style={{ margin: 10, borderRadius: 12 }}>
        <Card.Title title="Partido en vivo" />
        <Card.Content>
          <Text>No se pudo cargar el partido en vivo.</Text>
        </Card.Content>
      </Card>
    );
  }

  const home = live.teams.home;
  const away = live.teams.away;

  // --- Encabezado marcador
  const Header = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginBottom: 10,
      }}
    >
      {/* Local */}
      <View style={{ alignItems: "center", flex: 1 }}>
        <Avatar.Image size={44} source={{ uri: home.logo }} />
        <Text numberOfLines={1} style={{ marginTop: 4, fontWeight: "600" }}>
          {home.name}
        </Text>
      </View>

      {/* Marcador */}
      <View style={{ alignItems: "center", flex: 1.2 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold" }}>
          {live.goals.home} - {live.goals.away}
        </Text>
        <Chip
          compact
          icon="clock-outline"
          style={{ marginTop: 6, backgroundColor: "#e8f5e9" }}
          textStyle={{ fontWeight: "600" }}
        >
          {live.status.short === "FT"
            ? "Finalizado"
            : `${live.status.elapsed}' ${live.status.short}`}
        </Chip>
      </View>

      {/* Visitante */}
      <View style={{ alignItems: "center", flex: 1 }}>
        <Avatar.Image size={44} source={{ uri: away.logo }} />
        <Text numberOfLines={1} style={{ marginTop: 4, fontWeight: "600" }}>
          {away.name}
        </Text>
      </View>
    </View>
  );

  return (
    <Card
      style={{
        margin: 0,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 14,
        elevation: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <Card.Title title="Partido en vivo" titleVariant="titleMedium" />
      <Divider />
      <Card.Content>
        {Header}

        {/* 🔹 Chips Tabs */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginVertical: 8,
            gap: 6,
          }}
        >
          {tabs.map((t) => (
            <Chip
              key={t.key}
              icon={t.icon}
              selected={tab === t.key}
              onPress={() => setTab(t.key)}
              style={{
                marginHorizontal: 4,
                backgroundColor: tab === t.key ? "#1B5E20" : "rgba(0,0,0,0.08)",
              }}
              textStyle={{
                color: tab === t.key ? "white" : "#333",
                fontWeight: "500",
              }}
            >
              {t.label}
            </Chip>
          ))}
        </View>

        {/* 🔹 Contenido por pestaña */}
        {tab === "timeline" && (
          <View>
            {(showAll ? live.events : live.events.slice(-12)).map((e, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    width: 44,
                    fontWeight: "bold",
                    color: "#1B5E20",
                  }}
                >
                  {e.time.elapsed}
                  {e.time.extra ? `+${e.time.extra}` : ""}'
                </Text>
                <Avatar.Image size={22} source={{ uri: e.team?.logo }} />
                <Text
                  style={{
                    marginLeft: 8,
                    flexShrink: 1,
                    color: "#333",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{e.team?.name}</Text> •{" "}
                  {e.type}
                  {e.detail ? ` (${e.detail})` : ""} — {e.player?.name}
                  {e.assist?.name ? ` (asist. ${e.assist?.name})` : ""}
                </Text>
              </View>
            ))}

            {live.events.length > 12 && (
              <TouchableOpacity
                onPress={() => setShowAll((s) => !s)}
                style={{ alignSelf: "center", marginTop: 8 }}
              >
                <Chip
                  icon={showAll ? "chevron-up" : "chevron-down"}
                  mode="outlined"
                >
                  {showAll ? "Ver menos" : "Ver todo"}
                </Chip>
              </TouchableOpacity>
            )}
          </View>
        )}

        {tab === "dynamic" && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ marginBottom: 8, color: "gray" }}>
              Último evento:{" "}
              {lastEvent
                ? `${lastEvent.time.elapsed}' • ${lastEvent.team?.name} • ${
                    lastEvent.type
                  }${lastEvent.detail ? " (" + lastEvent.detail + ")" : ""}`
                : "—"}
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 12,
                overflow: "hidden",
                height: 260,
                backgroundColor: "#0b6623",
              }}
            >
              {/* aquí iría tu componente FootballField */}
            </View>
          </View>
        )}

        {tab === "goals" && (
          <View style={{ marginTop: 8 }}>
            {goals.length === 0 ? (
              <Text
                style={{
                  color: "gray",
                  fontStyle: "italic",
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                Sin goles por ahora
              </Text>
            ) : (
              goals.map((g, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                    flexWrap: "nowrap",
                    width: "100%",
                  }}
                >
                  {/* Minuto */}
                  <View style={{ width: 50, alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#1B5E20",
                      }}
                    >
                      {g.time.elapsed}
                      {g.time.extra ? `+${g.time.extra}` : ""}'
                    </Text>
                  </View>

                  {/* Logo */}
                  <Avatar.Image
                    size={24}
                    source={{ uri: g.team?.logo }}
                    style={{ marginHorizontal: 8 }}
                  />

                  {/* Descripción */}
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        flexShrink: 1,
                        color: "#333",
                        fontSize: 13,
                      }}
                    >
                      ⚽{" "}
                      <Text style={{ fontWeight: "600" }}>
                        {g.player?.name}
                      </Text>
                      {g.assist?.name ? (
                        <Text style={{ color: "#555" }}>
                          {" "}
                          (asist. {g.assist?.name})
                        </Text>
                      ) : null}
                      <Text style={{ color: "#777" }}> — {g.team?.name}</Text>
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "lineups" && (
          <View style={{ marginVertical: 8 }}>
            <Text style={{ color: "gray", textAlign: "center" }}>
              Alineaciones
            </Text>
            <Divider style={{ marginVertical: 8 }} />
            <FixtureLineups fixtureId={fixtureId} events={live.events} />
          </View>
        )}

        {tab === "rating" && (
          <View style={{ marginVertical: 8 }}>
            <Text style={{ color: "gray", textAlign: "center" }}>
              Califica a los jugadores
            </Text>
            <Divider style={{ marginVertical: 8 }} />
            <StarRating />
          </View>
        )}

        {tab === "stats" && (
          <View style={{ marginTop: 8 }}>
            {statsCombined.length === 0 ? (
              <Text
                style={{
                  color: "gray",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Estadísticas no disponibles aún
              </Text>
            ) : (
              <>
                {statsCombined
                  .filter((s) =>
                    [
                      "Ball Possession",
                      "Total Shots",
                      "Shots on Goal",
                      "Shots off Goal",
                      "Fouls",
                      "Corner Kicks",
                      "Yellow Cards",
                      "Red Cards",
                      "Offsides",
                      "Passes Accurate",
                    ].includes(s.label)
                  )
                  .map((s, i) => (
                    <StatRow
                      key={i}
                      label={s.label}
                      home={s.home}
                      away={s.away}
                    />
                  ))}
                <Divider style={{ marginVertical: 10 }} />
                {statsCombined
                  .filter(
                    (s) =>
                      ![
                        "Ball Possession",
                        "Total Shots",
                        "Shots on Goal",
                        "Shots off Goal",
                        "Fouls",
                        "Corner Kicks",
                        "Yellow Cards",
                        "Red Cards",
                        "Offsides",
                        "Passes Accurate",
                      ].includes(s.label)
                  )
                  .slice(0, 6)
                  .map((s, i) => (
                    <StatRow
                      key={`o-${i}`}
                      label={s.label}
                      home={s.home}
                      away={s.away}
                    />
                  ))}
              </>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
