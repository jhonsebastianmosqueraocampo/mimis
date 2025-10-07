import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, IconButton, Modal, Portal, Text } from "react-native-paper";
import ScrollSection from "./ScrollSection";

const equipos = [
  {
    id: "1",
    title: "Real Madrid",
    img: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    pathTo: "/realmadrid",
  },
  {
    id: "2",
    title: "Barcelona",
    img: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    pathTo: "/barcelona",
  },
  {
    id: "3",
    title: "Manchester City",
    img: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    pathTo: "/manchesterCity",
  },
  {
    id: "4",
    title: "Bayern Munich",
    img: "https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_München_logo_%282017%29.svg",
    pathTo: "/bayernMunchen",
  },
  {
    id: "5",
    title: "Juventus",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg",
    pathTo: "/juventus",
  },
];

const tournaments = [
  {
    id: "1",
    name: "LaLiga",
    img: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    description:
      "Las pruebas de fútbol son sesiones en las que se evalúa a los jugadores...",
  },
  {
    id: "2",
    name: "Champions League",
    img: "",
    description:
      "Estas pruebas pueden incluir ejercicios técnicos, pruebas físicas...",
  },
];

export default function AnalysisResult() {
  const [openModal, setOpenModal] = useState(false);

  const action = () => {
    setOpenModal(true);
  };

  return (
    <>
      <ScrollSection
        title="Análisis de Resultados"
        list={equipos}
        shape="square"
        action={action}
      />

      <Portal>
        <Modal
          visible={openModal}
          onDismiss={() => setOpenModal(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{equipos[0].title}</Text>
            <IconButton icon="close" onPress={() => setOpenModal(false)} />
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.chipContainer}>
              {tournaments.map((t) => (
                <Chip key={t.id} style={styles.chip} mode="outlined">
                  {t.name}
                </Chip>
              ))}
            </View>

            <View style={styles.description}>
              <Text variant="titleMedium">Análisis detallado</Text>
              <Text>{tournaments[0].description}</Text>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  modal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  chip: {
    margin: 4,
  },
  content: {
    marginTop: 12,
  },
  description: {
    marginTop: 12,
  },
});
