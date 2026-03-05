import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { LiveMatch, RootStackParamList } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Chip, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import FixtureAnalysis from "./FixtureAnalysis";
import FixtureLineups from "./FixtureLineups";
import MatchPostBanner from "./MatchPostBanner";
import MatchPostStats from "./MatchPostStats";
import MatchPostVideos from "./MatchPostVideos";

const items = [
  { id: "1", name: "Estadísticas" },
  { id: "2", name: "Calificaciones" },
  { id: "3", name: "Análisis del partido" },
  { id: "4", name: "Goles" },
  { id: "5", name: "Resumen jugadas" },
];

type MatchPostProps = {
  fixtureId: string;
  liveMatchFixture: LiveMatch;
};

export default function MatchPost({
  fixtureId,
  liveMatchFixture,
}: MatchPostProps) {
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goals = useMemo(
    () =>
      (liveMatchFixture?.events || []).filter(
        (e) =>
          (e.type || "").toLowerCase() === "goal" ||
          (e.detail || "").toLowerCase().includes("goal"),
      ),
    [liveMatchFixture],
  );

  const handlePlayer = (id: string) => {
    navigation.navigate("player", { id });
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 2 }}>
      <MatchPostBanner
        homeTeam={{
          id: liveMatchFixture?.teams.home.id.toString() ?? "",
          title: liveMatchFixture?.teams.home.name ?? "",
          img: liveMatchFixture?.teams.home.logo ?? "",
          pathTo: "",
        }}
        awayTeam={{
          id: liveMatchFixture?.teams.away.id.toString() ?? "",
          title: liveMatchFixture?.teams.away.name ?? "",
          img: liveMatchFixture?.teams.away.logo ?? "",
          pathTo: "",
        }}
        datetime={liveMatchFixture?.fixture.date.toString() ?? ""}
        stadium={liveMatchFixture?.fixture.venue.name ?? ""}
        referee={liveMatchFixture?.fixture.referee ?? ""}
        tournament={liveMatchFixture?.league.name ?? ""}
        tournamentId={liveMatchFixture?.league.id.toString() ?? ""}
        result={`${liveMatchFixture?.goals.home ?? 0} - ${liveMatchFixture?.goals.away ?? 0}`}
      />

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={{ marginVertical: 16 }}
      >
        {items.map((item) => (
          <Chip
            key={item.id}
            onPress={() => setSelectedItem(item)}
            mode={selectedItem.id === item.id ? "flat" : "outlined"}
            style={{
              backgroundColor:
                selectedItem.id === item.id ? colors.primary : colors.border,
              borderColor: colors.primary,
              marginRight: 8,
            }}
            textStyle={{
              color:
                selectedItem.id === item.id
                  ? colors.textOnPrimary
                  : colors.textSecondary,
            }}
          >
            {item.name.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      {/* Contenido dinámico */}
      {selectedItem.name === "Estadísticas" && (
        <MatchPostStats stats={liveMatchFixture?.statistics!} />
      )}

      {selectedItem.name === "Calificaciones" && (
        <>
          <Text style={styles.placeholder}>📊 Calificaciones de jugadores</Text>
          <FixtureLineups
            events={liveMatchFixture?.events}
            status={liveMatchFixture?.status!}
            fixtureId={fixtureId}
          />
        </>
      )}

      {selectedItem.name === "Análisis del partido" && (
        <FixtureAnalysis
          fixtureId={fixtureId}
          stats={liveMatchFixture?.statistics}
        />
      )}

      {selectedItem.name === "Goles" && (
        <View style={styles.container}>
          {goals.map((g, i) => (
            <View key={i} style={styles.itemRow}>
              {/* Línea vertical de tiempo */}
              <View style={styles.timeline}>
                <View style={styles.timelineDot} />
                {i !== goals.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Contenido del evento */}
              <View style={styles.content}>
                {/* Minuto */}
                <Text style={styles.minute}>
                  {g.time.elapsed}
                  {g.time.extra ? `+${g.time.extra}` : ""}'
                </Text>

                {/* Detalle del evento */}
                <View style={styles.eventRow}>
                  <Avatar.Image
                    size={28}
                    source={{ uri: g.team?.logo }}
                    style={{ backgroundColor: "transparent", marginRight: 6 }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.playerRow}>
                      <MaterialCommunityIcons
                        name={
                          g.detail?.includes("Own")
                            ? "soccer"
                            : g.detail?.includes("Penalty")
                              ? "soccer"
                              : "soccer"
                        }
                        size={16}
                        color={
                          g.detail?.includes("Own")
                            ? colors.error
                            : g.detail?.includes("Penalty")
                              ? colors.info
                              : colors.success
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={styles.playerName}
                        onPress={() =>
                          handlePlayer(g.player!.id!.toString() ?? "")
                        }
                      >
                        {g.player?.name}
                      </Text>
                    </View>

                    {g.assist?.name ? (
                      <Text
                        style={styles.assistText}
                        onPress={() => handlePlayer(g.assist!.id!.toString())}
                      >
                        Asistencia: {g.assist.name}
                      </Text>
                    ) : null}

                    <Text style={styles.teamText}>{g.team?.name}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          <View style={{ marginVertical: 24, alignItems: "center" }}>
            <AdBanner />
          </View>
        </View>
      )}

      {selectedItem.name === "Resumen jugadas" && (
        <ScrollView style={{ flex: 1 }}>
          <MatchPostVideos
            teamA={liveMatchFixture?.teams.home.name!}
            teamB={liveMatchFixture?.teams.away.name!}
            query={`${liveMatchFixture?.teams.home.name!} vs ${liveMatchFixture?.teams.away.name!} resumen partido highlights ${new Date(
              liveMatchFixture?.fixture.date!,
            )
              .getFullYear()
              .toString()} -reaction -eafc -fifa -game`}
            season={new Date(liveMatchFixture?.fixture.date!)
              .getFullYear()
              .toString()}
          />
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipScroll: {
    flexDirection: "row",
    paddingVertical: spacing.xs,
  },

  placeholder: {
    ...typography.body,
    textAlign: "center",
    marginVertical: spacing.md,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  videoCard: {
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceVariant ?? colors.surface,
  },

  videoThumbnail: {
    width: "100%",
    height: 220,
  },

  videoTitle: {
    padding: spacing.xs,
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  fullVideo: {
    width: "100%",
    height: "100%",
  },

  modalTitle: {
    position: "absolute",
    bottom: 60,
    textAlign: "center",
    width: "100%",
    ...typography.body,
    fontWeight: "700",
  },

  closeButton: {
    position: "absolute",
    top: 40,
    right: spacing.md,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
  },

  container: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },

  emptyText: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: spacing.xs,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },

  timeline: {
    width: 16,
    alignItems: "center",
  },

  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    marginTop: spacing.xs ?? 6,
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs ?? 4,
  },

  content: {
    flex: 1,
    marginLeft: spacing.xs,
    paddingVertical: spacing.xs ?? 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceVariant ?? colors.surface,
    paddingHorizontal: spacing.xs,
  },

  minute: {
    ...typography.small,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs ?? 4,
  },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  playerName: {
    ...typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  assistText: {
    ...typography.small,
    color: colors.textSecondary,
  },

  teamText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
