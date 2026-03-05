import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";

import FavoriteBadge from "@/components/FavoriteBadge";
import Loading from "@/components/Loading";
import MatchesTeamInfo from "@/components/MatchesTeamInfo";
import SigningsAndRumors from "@/components/SigningsAndRumors";
import TemplateTeam from "@/components/TemplateTeam";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList, swiperItem, Team } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import AvatarCard from "../components/AvatarCard";
import SeasonResults from "../components/SeasonResults";
import TeamStats from "../components/TeamStats";
import VerticalScroll from "../components/VerticalScroll";
import PrivateLayout from "./privateLayout";

const items = [
  { id: "1", name: "Noticias" },
  { id: "2", name: "Partidos" },
  { id: "3", name: "Temporada" },
  { id: "4", name: "Estadísticas" },
  { id: "5", name: "Plantilla" },
  { id: "6", name: "Fichajes y Rumores" },
  // { id: "8", name: "Crear Jugadores" },
];

type TeamScreenRouteProp = RouteProp<RootStackParamList, "team">;

export default function TeamScreen() {
  const { getTeam, getNewsTeam } = useFetch();
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [team, setTeam] = useState<Team>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [news, setNews] = useState<swiperItem[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingNews, setLoadingNews] = useState(false);
  const [error, setError] = useState("");

  const route = useRoute<TeamScreenRouteProp>();
  const { id } = route.params;

  useEffect(() => {
    setSelectedItem(items[0]);
    getInfoTeam();
  }, [id]);

  useEffect(() => {
    if (team) {
      manageInfo();
    }
  }, [selectedItem, team]);

  const actionGeneralListNews = (id: string) => {
    console.log("noticia seleccionada", id);
  };

  const getInfoTeam = async () => {
    setLoadingTeam(true);
    setError("");

    try {
      const { success, team, isFavorite, message } = await getTeam(id);
      if (success) {
        setTeam(team);
        setIsFavorite(isFavorite ?? false);
      } else {
        setError(message || "Error al cargar equipo");
      }
    } finally {
      setLoadingTeam(false);
    }
  };

  const manageInfo = () => {
    switch (selectedItem.name) {
      case "Noticias":
        getNews();
        break;

      default:
        break;
    }
  };

  const getNews = async () => {
    if (!team) return;

    setLoadingNews(true);
    setError("");
    setNews([]); // opcional: limpia para que no muestre noticias viejas

    try {
      const response = await getNewsTeam(team.name);
      if (response.success) {
        setNews(response.news || []);
      } else {
        setNews([]);
      }
    } finally {
      setLoadingNews(false);
    }
  };

  if (loadingNews || loadingTeam) {
    return (
      <Loading
        visible={loadingNews || loadingTeam}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <PrivateLayout>
      <AvatarCard
        name={team?.name || "Equipo"}
        imageUrl={team ? team.logo : ""}
        typographyProps={{
          variant: "titleLarge",
          style: { textAlign: "center", fontWeight: "bold", color: "#333" },
        }}
      />

      <FavoriteBadge
        isFavorite={isFavorite}
        onToggle={() => {
          // si quieres luego llamar al endpoint toggleFavorites aquí (backend)
          setIsFavorite((prev) => !prev);
        }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {items.map((item) => (
          <Chip
            key={item.id}
            mode={selectedItem.id === item.id ? "flat" : "outlined"}
            onPress={() => setSelectedItem(item)}
            style={[
              styles.chip,
              selectedItem.id === item.id && styles.chipSelected,
            ]}
            textStyle={{
              color: selectedItem.id === item.id ? "#fff" : "#000",
              lineHeight: 20,
            }}
          >
            {item.name.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      <View style={styles.sectionContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {selectedItem.name.toUpperCase()}
        </Text>

        {selectedItem.name.toLowerCase() === "noticias" && (
          <VerticalScroll
            listItems={news}
            actionGeneralList={actionGeneralListNews}
          />
        )}

        {selectedItem.name.toLowerCase() === "partidos" && (
          <MatchesTeamInfo teamId={team?.teamId!} />
        )}

        {selectedItem.name.toLowerCase() === "temporada" && (
          <SeasonResults teamId={team?.teamId!} />
        )}

        {selectedItem.name.toLowerCase() === "estadísticas" && (
          <TeamStats teamId={team?.teamId!} />
        )}
        {selectedItem.name.toLowerCase() === "plantilla" && (
          <TemplateTeam teamId={team?.teamId!} />
        )}
        {selectedItem.name.toLowerCase() === "fichajes y rumores" && (
          <SigningsAndRumors teamId={team?.teamId!} />
        )}
        {/* {selectedItem.name.toLowerCase() === "crear jugadores" && (
          <VerticalScroll
            listItems={news}
            actionGeneralList={actionGeneralListNews}
          />
        )} */}
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  chipScroll: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  chip: {
    marginHorizontal: 4,
    borderColor: "#1DB954",
    backgroundColor: "transparent",
    height: 36,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#1DB954",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
});
