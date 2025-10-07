import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Chip,
  Surface,
  Text,
} from "react-native-paper";

// Tipos
type Player = {
  name: string;
  position: string;
};

type TeamLineup = {
  teamName: string;
  color: string;
  formation: Player[][];
  substitutes: string[];
  injured: string[];
};

// Datos
const teams: TeamLineup[] = [
  {
    teamName: "FC Barcelona",
    color: "#004d98",
    formation: [
      [{ name: "Ter Stegen", position: "GK" }],
      [
        { name: "Balde", position: "LB" },
        { name: "Christensen", position: "CB" },
        { name: "Araujo", position: "CB" },
        { name: "Koundé", position: "RB" },
      ],
      [
        { name: "Gündogan", position: "CM" },
        { name: "De Jong", position: "CM" },
        { name: "Pedri", position: "CAM" },
      ],
      [
        { name: "Ferran Torres", position: "RW" },
        { name: "Lewandowski", position: "ST" },
        { name: "Raphinha", position: "LW" },
      ],
    ],
    substitutes: ["Iñaki Peña", "Cancelo", "Fermín López", "João Félix"],
    injured: ["Gavi", "Marcos Alonso"],
  },
  {
    teamName: "Real Madrid",
    color: "#ae0c27",
    formation: [
      [{ name: "Lunin", position: "GK" }],
      [
        { name: "Mendy", position: "LB" },
        { name: "Alaba", position: "CB" },
        { name: "Rüdiger", position: "CB" },
        { name: "Carvajal", position: "RB" },
      ],
      [
        { name: "Valverde", position: "RM" },
        { name: "Tchouaméni", position: "CDM" },
        { name: "Kroos", position: "CM" },
        { name: "Bellingham", position: "LM" },
      ],
      [
        { name: "Rodrygo", position: "ST" },
        { name: "Vinícius Jr.", position: "ST" },
      ],
    ],
    substitutes: ["Courtois", "Nacho", "Modric", "Camavinga", "Joselu"],
    injured: ["Militão", "Arda Güler"],
  },
];

// Componentes
const PlayerBall = ({ name, color }: { name: string; color: string }) => (
  <View style={styles.playerBall}>
    <Avatar.Text label={name[0]} size={42} style={{ backgroundColor: color }} />
    <Text variant="labelSmall" style={{ textAlign: "center", marginTop: 4 }}>
      {name}
    </Text>
  </View>
);

const FormationRow = ({ row, color }: { row: Player[]; color: string }) => (
  <View style={styles.formationRow}>
    {row.map((player, idx) => (
      <PlayerBall key={idx} name={player.name} color={color} />
    ))}
  </View>
);

export default function MatchLineupViewPreview() {
  const [selectedTeam, setSelectedTeam] = useState("FC Barcelona");
  const team = teams.find((t) => t.teamName === selectedTeam)!;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        🧩 Posibles Alineaciones
      </Text>

      {/* Selector de equipos */}
      <View style={styles.selector}>
        {teams.map((t) => (
          <Button
            key={t.teamName}
            mode={selectedTeam === t.teamName ? "contained" : "outlined"}
            onPress={() => setSelectedTeam(t.teamName)}
            style={styles.teamButton}
          >
            {t.teamName}
          </Button>
        ))}
      </View>

      {/* Formación */}
      <Surface style={styles.field}>
        <Text variant="titleSmall" style={styles.centeredText}>
          {team.teamName}
        </Text>
        {team.formation.map((row, i) => (
          <FormationRow key={i} row={row} color={team.color} />
        ))}
      </Surface>

      {/* Suplentes */}
      <Text variant="titleSmall" style={{ color: team.color, fontWeight: "bold" }}>
        {team.teamName}
      </Text>

      <Text variant="labelLarge" style={styles.sectionTitle}>🪑 Suplentes</Text>
      <View style={styles.chipContainer}>
        {team.substitutes.map((s, i) => (
          <Chip key={i} style={styles.chip}>{s}</Chip>
        ))}
      </View>

      <Text variant="labelLarge" style={styles.sectionTitle}>❌ Lesionados</Text>
      <View style={styles.chipContainer}>
        {team.injured.map((s, i) => (
          <Chip key={i} style={styles.chip} textStyle={{ color: "#fff" }} selectedColor="#fff" selected>
            {s}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  selector: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  teamButton: {
    flexGrow: 1,
    marginVertical: 4,
  },
  field: {
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#e9f5e9",
    marginBottom: 24,
  },
  centeredText: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },
  formationRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 6,
    gap: 8,
    flexWrap: "wrap",
  },
  playerBall: {
    alignItems: "center",
    marginHorizontal: 4,
    maxWidth: 80,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    margin: 4,
  },
});