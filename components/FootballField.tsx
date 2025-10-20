import type { LiveEvent, PlayerLineup, TeamLineup } from "@/types";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Divider, IconButton, Text } from "react-native-paper";
import Svg, { Circle, Rect } from "react-native-svg";
import StarRating from "./StarRating";

const { width } = Dimensions.get("window");
const FIELD_WIDTH = width - 40;
const FIELD_HEIGHT = (FIELD_WIDTH * 3) / 2; // proporción vertical 2:3

type Props = {
  lineup: TeamLineup[];
  liveEvents?: LiveEvent[]; // opcional
};

// 🟩 Íconos de evento sobre jugador
const PlayerEventIcons = ({
  goals = 0,
  yellow = false,
  red = false,
  substituted = false,
}: {
  goals?: number;
  yellow?: boolean;
  red?: boolean;
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
      {substituted && <Text style={{ fontSize: 12, marginLeft: 2 }}>🔄</Text>}
    </View>
  );
};

// 🧤 Modal con info del jugador
const PlayerModal = ({ player, visible, onClose }: any) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const mockAverage = useMemo(
    () => (Math.random() * 2 + 3).toFixed(1),
    [player]
  );

  if (!player) return null;

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
          {/* Foto */}
          {player.photo ? (
            <Image
              source={{ uri: player.photo }}
              style={{ width: 90, height: 90, borderRadius: 45 }}
            />
          ) : (
            <Avatar.Text size={90} label={String(player.number)} />
          )}

          {/* Nombre e info */}
          <Text style={{ marginTop: 10, fontWeight: "bold", fontSize: 17 }}>
            {player.name}
          </Text>
          <Text style={{ color: "#666", marginTop: 2 }}>
            Posición: {player.pos}
          </Text>
          <Text style={{ color: "#666", marginTop: 2 }}>
            Tiempo jugado: {player.minutes ?? 0}'
          </Text>

          {/* Puntuación promedio */}
          <Text style={{ color: "#555", marginTop: 6, fontSize: 13 }}>
            Promedio global:{" "}
            <Text style={{ fontWeight: "600" }}>{mockAverage}</Text>
          </Text>

          {/* ⭐ Calificación del usuario */}
          <View style={{ marginTop: 10, alignItems: "center" }}>
            <Text style={{ color: "#222", fontWeight: "600", marginBottom: 4 }}>
              Tu calificación:
            </Text>
            <StarRating
              editable
              rating={userRating || 0}
              onChange={(v) => setUserRating(v)}
            />
            {userRating && (
              <Text style={{ color: "#777", marginTop: 4, fontSize: 13 }}>
                ({userRating.toFixed(1)} estrellas)
              </Text>
            )}
          </View>

          {/* Botón de acción */}
          <Pressable
            onPress={() => console.log("Ver detalle o enviar rating:")}
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

          {/* Botón cerrar */}
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

// 🧩 Marcador de jugador con eventos y modal
const PlayerMarker = ({
  player,
  events,
}: {
  player: PlayerLineup;
  events?: LiveEvent[];
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const playerEvents = useMemo(() => {
    const ev = events?.filter((e) => e.player?.id === player.id) || [];
    const goals = ev.filter((e) => e.type === "Goal").length;
    const yellow = ev.some(
      (e) => e.type === "Card" && e.detail?.includes("Yellow")
    );
    const red = ev.some((e) => e.type === "Card" && e.detail?.includes("Red"));
    const substituted = ev.some((e) => e.type === "Substitution");
    return { goals, yellow, red, substituted };
  }, [events]);

  // const rating = player.rating ?? null;
  const rating = player.rating ?? 7.8;

  return (
    <View style={{ alignItems: "center", marginHorizontal: 6 }}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
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
          {/* ⭐ Calificación mock (por ahora fija) */}
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
                {rating.toFixed(1)}
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
        player={player}
      />
    </View>
  );
};

// 🏟️ Componente principal
export default function FootballLineupField({
  lineup,
  liveEvents = [],
}: Props) {
  const [home, away] = lineup;
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");

  const renderTeam = (team: TeamLineup) => {
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
            <PlayerMarker key={p.id} player={p} events={liveEvents} />
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
            <PlayerMarker key={p.id} player={p} events={liveEvents} />
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
        padding: 10,
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

      {/* Campo */}
      <View
        style={{
          width: FIELD_WIDTH,
          height: FIELD_HEIGHT,
          backgroundColor: "#388E3C",
          borderWidth: 2,
          borderColor: "#fff",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
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
        {currentTeam.substitutes.map((s) => (
          <PlayerMarker key={s.id} player={s} events={liveEvents} />
        ))}
      </View>
    </View>
  );
}
