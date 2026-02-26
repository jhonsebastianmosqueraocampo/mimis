import { useAuth } from "@/hooks/AuthContext";
import { useFetch } from "@/hooks/FetchContext";
import type {
  LiveEvent,
  PlayerLive,
  RootStackParamList,
  TeamLineup,
  TeamLineupLive,
  UserPlayerRating,
} from "@/types";
import { useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Divider, IconButton, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import Svg, { Circle, Rect } from "react-native-svg";
import Loading from "./Loading";
import StarRating from "./StarRating";

type Props = {
  fixtureId: string;
  lineup: TeamLineup[] | TeamLineupLive[];
  liveEvents?: LiveEvent[]; // opcional
  status: {
    long: string;
    short: string;
    elapsed?: number | null;
  };
};

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "P",
  "BT",
  "LIVE",
  "INT",
  "BREAK",
  "SUSP",
  "INTERRUPTED",
];

const FINISHED_STATUSES = ["FT", "AET", "PEN"];

const isValidRating = (r: any) => {
  const n = typeof r === "string" ? Number(r) : r;
  return typeof n === "number" && !isNaN(n) && n > 0;
};

const safeNumber = (v: any) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && !isNaN(n) ? n : 0;
};

// arma un mapa rápido de stats por playerId desde los eventos en vivo
const buildEventStatsMap = (events: LiveEvent[]) => {
  const map: Record<
    string,
    { goals: number; assists: number; yellow: number; red: number }
  > = {};

  const ensure = (id?: number | null) => {
    if (!id) return null;
    const key = String(id);
    if (!map[key]) map[key] = { goals: 0, assists: 0, yellow: 0, red: 0 };
    return key;
  };

  for (const e of events || []) {
    const pid = ensure(e.player?.id);
    const aid = ensure(e.assist?.id);

    if (e.type === "Goal") {
      if (pid) map[pid].goals += 1;
      if (aid) map[aid].assists += 1;
    }

    if (e.type === "Card") {
      const detail = (e.detail || "").toLowerCase();
      if (pid) {
        if (detail.includes("yellow")) map[pid].yellow += 1;
        if (detail.includes("red")) map[pid].red += 1;
      }
    }
  }

  return map;
};

// score compuesto (rating manda; luego impacto ofensivo; castigo tarjetas; +minutos)
const calcMvpScore = ({
  rating,
  goals,
  assists,
  yellow,
  red,
  minutes,
}: {
  rating: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  minutes: number;
}) => {
  const r = isValidRating(rating) ? rating : 0;

  return (
    r * 100 + // rating pesa MUCHO
    goals * 60 +
    assists * 40 +
    Math.min(minutes, 120) * 0.2 -
    yellow * 15 -
    red * 60
  );
};

type PlayerModalProps = {
  fixtureId: string;
  player: PlayerLive & { minutes?: number }; // ✅ añadimos minutes opcional
  visible: boolean;
  onClose: (event: GestureResponderEvent) => void;
  canRate: boolean;
};

// 🟩 Íconos de evento sobre jugador
const PlayerEventIcons = ({
  goals = 0,
  yellow = false,
  red = false,
  entered = false,
  substituted = false,
}: {
  goals?: number;
  yellow?: boolean;
  red?: boolean;
  entered?: boolean;
  substituted?: boolean;
}) => {
  return (
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {goals > 0 && (
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            padding: 2,
            marginLeft: 2,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 10 }}>⚽</Text>
          {goals > 1 && (
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>×{goals}</Text>
          )}
        </View>
      )}
      {yellow && (
        <View
          style={{
            width: 10,
            height: 14,
            backgroundColor: "#ffeb3b",
            borderColor: "#555",
            borderWidth: 0.5,
            marginLeft: 2,
          }}
        />
      )}
      {red && (
        <View
          style={{
            width: 10,
            height: 14,
            backgroundColor: "#f44336",
            borderColor: "#555",
            borderWidth: 0.5,
            marginLeft: 2,
          }}
        />
      )}
      {entered && <Text style={{ fontSize: 12, marginLeft: 2 }}>⬆️</Text>}
      {substituted && <Text style={{ fontSize: 12, marginLeft: 2 }}>⬇️</Text>}
    </View>
  );
};

// 🧤 Modal con info del jugador
const PlayerModal = ({
  player,
  visible,
  onClose,
  canRate,
  fixtureId,
}: PlayerModalProps) => {
  const { ratePlayer, getRatePlayer } = useFetch();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [userRatings, setUserRatings] = useState<
    Record<string, UserPlayerRating>
  >({});
  if (!player) return null;

  useEffect(() => {
    getRatePlayer(fixtureId).then((res) => {
      if (res.success && res.ratings) {
        setUserRatings(res.ratings);
      }
    });
  }, [fixtureId]);

  const userRatingInfo = userRatings[player.id.toString()];

  const handleRate = async (newValue: number) => {
    setUserRating(newValue);
    setLoading(true);
    const { success } = await ratePlayer(
      newValue,
      fixtureId,
      player.id.toString(),
    );

    if (success) {
      setUserRatings((prev) => ({
        ...prev,
        [player.id.toString()]: {
          avg: newValue,
          votes: 1,
        },
      }));
    }
    setLoading(false);
  };

  const handlePlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
            width: "100%",
            maxWidth: 400,
            alignItems: "center",
          }}
        >
          {player.photo ? (
            <Image
              source={{ uri: player.photo }}
              style={{ width: 90, height: 90, borderRadius: 45 }}
            />
          ) : (
            <Avatar.Text size={90} label={String(player.number)} />
          )}

          <Text style={{ marginTop: 10, fontWeight: "bold", fontSize: 17 }}>
            {player.name}
          </Text>
          <Text style={{ color: "#666", marginTop: 2 }}>
            Posición: {player.pos}
          </Text>
          <Text style={{ color: "#666", marginTop: 2 }}>
            Tiempo jugado: {player.minutes ?? 0}'
          </Text>

          <Text style={{ color: "#555", marginTop: 6, fontSize: 13 }}>
            Rendimiento del partido:{" "}
            <Text style={{ fontWeight: "600" }}>{player.rating ?? "-"}</Text>
          </Text>

          <Text style={{ color: "#555", marginTop: 4, fontSize: 13 }}>
            Voto de la afición:{" "}
            <Text style={{ fontWeight: "600" }}>
              {userRatingInfo
                ? `${userRatingInfo.avg} ⭐ (${userRatingInfo.votes})`
                : "Sin votos"}
            </Text>
          </Text>

          {canRate && (
            <View style={{ marginTop: 10, alignItems: "center" }}>
              <Text
                style={{ color: "#222", fontWeight: "600", marginBottom: 4 }}
              >
                Tu calificación:
              </Text>
              <StarRating
                editable
                rating={userRating || 0}
                onChange={(v) => handleRate(v)}
              />
              {userRating && (
                <Text style={{ color: "#777", marginTop: 4, fontSize: 13 }}>
                  ({userRating.toFixed(1)} estrellas)
                </Text>
              )}
            </View>
          )}

          <Pressable
            onPress={() => handlePlayer(player.id.toString())}
            style={{
              backgroundColor: "#388E3C",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
              marginTop: 16,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Ver detalle
            </Text>
          </Pressable>

          <IconButton
            icon="close"
            onPress={onClose}
            style={{ position: "absolute", top: 4, right: 4 }}
          />
        </View>
      </View>
    </Modal>
  );
};

// 🧩 Marcador de jugador
const PlayerMarker = ({
  player,
  events,
  canRate,
  elapsed,
  fixtureId,
}: {
  player: PlayerLive;
  events?: LiveEvent[];
  canRate: boolean;
  elapsed?: number | null;
  fixtureId: string;
}) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const playerEvents = useMemo(() => {
    const goals =
      events?.filter((e) => e.type === "Goal" && e.player?.id === player.id)
        .length || 0;
    const yellow = events?.some(
      (e) =>
        e.type === "Card" &&
        e.player?.id === player.id &&
        e.detail?.includes("Yellow"),
    );
    const red = events?.some(
      (e) =>
        e.type === "Card" &&
        e.player?.id === player.id &&
        e.detail?.includes("Red"),
    );
    const entered = events?.some(
      (e) => e.type === "Substitution" && e.player?.id === player.id,
    );
    const substituted = events?.some(
      (e) => e.type === "Substitution" && e.assist?.id === player.id,
    );
    return { goals, yellow, red, entered, substituted };
  }, [events, player.id]);

  const rating = player.rating ?? 0;
  const minutes = typeof player.minutes === "number" ? player.minutes : 0;

  const canOpenModal =
    user?.role === "administrador" || user?.level !== "novato";

  return (
    <View style={{ alignItems: "center", marginHorizontal: 6 }}>
      <TouchableOpacity
        onPress={canOpenModal ? () => setModalVisible(true) : undefined}
        activeOpacity={0.9}
      >
        <View style={{ position: "relative" }}>
          {player.photo ? (
            <Image
              source={{ uri: player.photo }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          ) : (
            <Avatar.Text
              size={42}
              label={String(player.number || " ")}
              style={{
                backgroundColor: "#1B5E20",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          )}
          <PlayerEventIcons {...playerEvents} />

          {rating !== null && (
            <View
              style={{
                position: "absolute",
                top: -12,
                left: -12,
                backgroundColor: "rgba(0,0,0,0.7)",
                borderRadius: 12,
                paddingVertical: 2,
                paddingHorizontal: 5,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>
                {rating === 0 ? "-" : rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 10,
          marginTop: 2,
          color: "#fff",
          textAlign: "center",
          maxWidth: 70,
        }}
        numberOfLines={1}
      >
        {player.name}
      </Text>

      <PlayerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        player={{ ...player, minutes }}
        canRate={canRate}
        fixtureId={fixtureId}
      />
    </View>
  );
};

const MatchMvpBanner = ({
  mvp,
  stats,
  teamName,
}: {
  mvp: PlayerLive & {
    minutes?: number;
    teamId?: number | null;
    teamName?: string;
  };
  stats: {
    goals: number;
    assists: number;
    yellow: number;
    red: number;
    rating: number;
    minutes: number;
  };
  teamName?: string;
}) => {
  const chips: string[] = [];

  if (isValidRating(stats.rating))
    chips.push(`⭐ ${Number(stats.rating).toFixed(1)}`);
  if (stats.goals) chips.push(`⚽ ${stats.goals}`);
  if (stats.assists) chips.push(`🅰️ ${stats.assists}`);
  if (stats.yellow) chips.push(`🟨 ${stats.yellow}`);
  if (stats.red) chips.push(`🟥 ${stats.red}`);
  if (stats.minutes) chips.push(`⏱️ ${stats.minutes}'`);

  return (
    <View
      style={{
        width: "92%",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.35)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
        <View style={{ marginRight: 12 }}>
          {mvp.photo ? (
            <Image
              source={{ uri: mvp.photo }}
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          ) : (
            <Avatar.Text size={62} label={String(mvp.number || "MVP")} />
          )}

          <View
            style={{
              position: "absolute",
              bottom: -8,
              left: -6,
              right: -6,
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#FFD700",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#222" }}>
                MVP 🏆
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
            ¡Partido finalizado!
          </Text>
          <Text
            style={{
              color: "#fff",
              fontWeight: "900",
              fontSize: 18,
              marginTop: 2,
            }}
          >
            {mvp.name}
          </Text>

          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              marginTop: 2,
              fontSize: 12,
            }}
          >
            Mejor del partido {teamName ? `• ${teamName}` : ""}
          </Text>

          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
          >
            {chips.slice(0, 6).map((c) => (
              <View
                key={c}
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                >
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// 🏟️ Componente principal
export default function FootballLineupField({
  lineup,
  liveEvents = [],
  status,
  fixtureId,
}: Props) {
  const [home, away] = lineup;
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const isLive = LIVE_STATUSES.includes(status.short);
  const isFinished = FINISHED_STATUSES.includes(status.short);

  const mvpData = useMemo(() => {
    if (!isFinished) return null;

    const eventsMap = buildEventStatsMap(liveEvents || []);

    const allPlayers: (PlayerLive & { minutes?: number; teamName?: string })[] =
      [
        ...home.startXI,
        ...home.substitutes,
        ...away.startXI,
        ...away.substitutes,
      ].map((p) => ({
        ...p,
      }));

    let best: any = null;
    let bestScore = -Infinity;

    for (const p of allPlayers) {
      const key = String(p.id);
      const ev = eventsMap[key] || { goals: 0, assists: 0, yellow: 0, red: 0 };

      const rating = safeNumber(p.rating);
      const minutes = safeNumber((p as any).minutes);

      const score = calcMvpScore({
        rating,
        goals: ev.goals,
        assists: ev.assists,
        yellow: ev.yellow,
        red: ev.red,
        minutes,
      });

      // empate: gana el de mejor rating; si no hay rating, gana el de más goles
      if (
        score > bestScore ||
        (score === bestScore &&
          safeNumber(p.rating) > safeNumber(best?.rating)) ||
        (score === bestScore &&
          safeNumber(ev.goals) > safeNumber(best?.ev?.goals))
      ) {
        bestScore = score;
        best = { player: p, ev };
      }
    }

    if (!best?.player) return null;

    return {
      player: best.player,
      stats: {
        goals: best.ev.goals,
        assists: best.ev.assists,
        yellow: best.ev.yellow,
        red: best.ev.red,
        rating: safeNumber(best.player.rating),
        minutes: safeNumber((best.player as any).minutes),
      },
      teamName: best.player.teamName,
    };
  }, [isFinished, home, away, liveEvents]);

  const renderTeam = (team: TeamLineup | TeamLineupLive) => {
    const formation = team.team.formation
      ?.split("-")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n)) || [4, 3, 3];

    const gk = team.startXI.filter((p) => p.pos === "G");
    const outfieldPlayers = team.startXI.filter((p) => p.pos !== "G");
    const totalLines = formation.length;

    const gkTop = 80;
    const topLimit = 2;
    const step = (gkTop - topLimit) / (totalLines + 1);

    let playerIndex = 0;
    const lines = formation.map((count, i) => {
      const group = outfieldPlayers.slice(playerIndex, playerIndex + count);
      playerIndex += count;
      let top = gkTop - step * (i + 1);
      if (i === formation.length - 1) top = Math.max(top - 3, 1);

      return (
        <View
          key={`line-${i}`}
          style={{
            position: "absolute",
            width: "100%",
            top: `${top}%`,
            flexDirection: "row",
            justifyContent:
              group.length === 1
                ? "center"
                : group.length === 2
                  ? "space-around"
                  : "space-evenly",
            alignItems: "center",
          }}
        >
          {group.map((p) => (
            <PlayerMarker
              key={p.id}
              player={p}
              events={liveEvents}
              canRate={isLive}
              elapsed={status.elapsed}
              fixtureId={fixtureId}
            />
          ))}
        </View>
      );
    });

    return (
      <View style={{ position: "absolute", width: "100%", height: "100%" }}>
        <View
          style={{
            position: "absolute",
            width: "100%",
            top: `${gkTop}%`,
            alignItems: "center",
          }}
        >
          {gk.map((p) => (
            <PlayerMarker
              key={p.id}
              player={p}
              events={liveEvents}
              canRate={isLive}
              elapsed={status.elapsed}
              fixtureId={fixtureId}
            />
          ))}
        </View>
        {lines}
      </View>
    );
  };

  const currentTeam = selectedTeam === "home" ? home : away;

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#0b6623",
        padding: 0,
        borderRadius: 20,
        margin: 10,
        elevation: 4,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: 10,
        }}
      >
        {[home, away].map((t, idx) => (
          <TouchableOpacity
            key={t.team.id}
            style={{ alignItems: "center", flex: 1 }}
            onPress={() => setSelectedTeam(idx === 0 ? "home" : "away")}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: t.team.logo }}
              style={{
                width: 50,
                height: 50,
                opacity:
                  selectedTeam === (idx === 0 ? "home" : "away") ? 1 : 0.5,
              }}
            />
            <Text
              variant="titleMedium"
              style={{
                color:
                  selectedTeam === (idx === 0 ? "home" : "away")
                    ? "#fff"
                    : "#aaa",
                fontWeight:
                  selectedTeam === (idx === 0 ? "home" : "away")
                    ? "bold"
                    : "normal",
              }}
            >
              {t.team.name}
            </Text>
            <Text style={{ color: "#ccc" }}>{t.team.formation}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Divider
        bold
        style={{ backgroundColor: "#fff", width: "90%", marginBottom: 10 }}
      />

      {isFinished && mvpData?.player ? (
        <MatchMvpBanner
          mvp={mvpData.player}
          stats={mvpData.stats}
          teamName={mvpData.teamName}
        />
      ) : null}

      {/* Campo */}
      <View
        style={{
          width: "100%",
          aspectRatio: 2 / 3,
          backgroundColor: "#388E3C",
          borderWidth: 2,
          borderColor: "#fff",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
          alignSelf: "center",
        }}
      >
        <Svg width="100%" height="100%">
          <Rect width="100%" height="100%" fill="#388E3C" />
          <Rect
            x="2%"
            y="2%"
            width="96%"
            height="96%"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
          <Rect
            x="1.5%"
            y="49.5%"
            width="97%"
            height="0.5%"
            fill="#fff"
            opacity={0.8}
          />
          <Circle
            cx="50%"
            cy="50%"
            r="10%"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
          <Circle cx="50%" cy="50%" r="1%" fill="#fff" />
          <Rect
            x="25%"
            y="2%"
            width="50%"
            height="10%"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
          <Rect
            x="37%"
            y="2%"
            width="26%"
            height="5%"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
          <Rect
            x="25%"
            y="88%"
            width="50%"
            height="10%"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
          <Rect
            x="37%"
            y="93%"
            width="26%"
            height="5%"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
        </Svg>

        <View style={{ position: "absolute", inset: 0 }}>
          {renderTeam(currentTeam)}
        </View>
      </View>

      {/* Suplentes */}
      <Divider
        bold
        style={{ backgroundColor: "#fff", width: "90%", marginVertical: 10 }}
      />
      <Text style={{ color: "#fff", marginBottom: 5 }}>Suplentes</Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {currentTeam.substitutes.map((s) => {
          const hasEntered = liveEvents?.some(
            (e) => e.type === "Substitution" && e.player?.id === s.id,
          );

          return (
            <PlayerMarker
              key={s.id}
              player={s}
              events={liveEvents}
              canRate={isLive && hasEntered}
              elapsed={status.elapsed}
              fixtureId={fixtureId}
            />
          );
        })}
      </View>
    </View>
  );
}
