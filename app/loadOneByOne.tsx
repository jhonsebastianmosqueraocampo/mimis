import Loading from "@/components/Loading";
import OneByOneForm from "@/components/OneByOneForm";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { LeagueItem, OneByOneType, Section } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Searchbar,
  Text,
  TextInput,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function LoadOneByOne() {
  const { getOneByOne, deleteOneByOneItem, getMatchesToday } = useFetch();

  const [search, setSearch] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [leagues, setLeagues] = useState<LeagueItem[]>([]);
  const [searchLeague, setSearchLeague] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const [oneByOneList, setOneByOneList] = useState<OneByOneType[]>([]);

  const [oneByOne, setOneByOne] = useState<OneByOneType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      const { success, oneByOneList } = await getOneByOne();

      if (!isMounted || !success) return;

      setOneByOneList(oneByOneList);

      setLoading(false);
    };

    const loadLeaguesTeams = async () => {
      const { success, leagues, sections } = await getMatchesToday({
        status: "FINISHED",
      });

      if (success) {
        setLeagues(leagues || []);
        setSections(sections || []);
      }
    };

    load();
    loadLeaguesTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredList = useMemo(() => {
    let result = oneByOneList;

    if (search.trim()) {
      const s = search.toLowerCase();

      result = result.filter(
        (item) =>
          item.teams.home.name.toLowerCase().includes(s) ||
          item.teams.away.name.toLowerCase().includes(s),
      );
    }

    if (selectedChip) {
      const sChip = selectedChip.toLowerCase();

      result = result.filter(
        (item) =>
          item.teams.home.name.toLowerCase().includes(sChip) ||
          item.teams.away.name.toLowerCase().includes(sChip),
      );
    }

    return result;
  }, [search, selectedChip, oneByOneList]);

  const handleCreate = () => {
    setEditingId(null);
    setOneByOne(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const found = oneByOneList.find((i) => i.id === id);

    if (!found) return;

    setEditingId(id);
    setOneByOne(found);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar este uno por uno?", [
      { text: "Cancelar", style: "cancel" },

      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const { success } = await deleteOneByOneItem(id);

          if (!success) return;

          setOneByOneList((prev) => prev.filter((i) => i.id !== id));
        },
      },
    ]);
  };

  const handleSave = (saved: OneByOneType) => {
    setOneByOneList((prev) => {
      if (editingId) {
        return prev.map((i) => (i.id === saved.id ? saved : i));
      }

      return [saved, ...prev];
    });

    setShowForm(false);
    setEditingId(null);
    setOneByOne(null);
  };

  const filteredLeagues = leagues.filter((league) =>
    league.name.toLowerCase().includes(searchLeague.toLowerCase()),
  );

  if (loading) {
    return <Loading visible title="Cargando" subtitle="Preparando datos" />;
  }

  if (showForm) {
    return (
      <PrivateLayout>
        <OneByOneForm
          oneByOneId={editingId}
          oneByOne={oneByOne}
          onCancel={() => setShowForm(false)}
          onSave={handleSave}
          leagues={leagues}
          sections={sections}
          existingOneByOnes={oneByOneList}
        />
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[g.title]}>Calificación uno por uno</Text>

        <Text style={{ marginBottom: spacing.md }}>
          Gestiona las valoraciones jugador por jugador.
        </Text>

        <Button
          mode="contained"
          buttonColor={colors.primary}
          icon="plus"
          style={{ marginBottom: spacing.md }}
          onPress={handleCreate}
        >
          Crear uno por uno
        </Button>

        <Searchbar
          placeholder="Buscar liga"
          value={searchLeague}
          onChangeText={setSearchLeague}
          style={{
            marginBottom: spacing.sm,
            borderRadius: radius.lg,
          }}
        />

        {/* Chips ligas */}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredLeagues.map((league) => {
            const selected = selectedChip === league.name;

            return (
              <Chip
                key={league.id}
                selected={selected}
                onPress={() =>
                  setSelectedChip((prev) =>
                    prev === league.name ? null : league.name,
                  )
                }
                style={{
                  marginRight: spacing.sm,
                  backgroundColor: selected ? colors.primary : colors.border,
                }}
                textStyle={{
                  color: selected ? "#fff" : colors.textSecondary,
                }}
              >
                {league.name}
              </Chip>
            );
          })}
        </ScrollView>

        <TextInput
          mode="outlined"
          placeholder="Buscar equipo"
          value={search}
          onChangeText={setSearch}
          style={{ marginTop: spacing.md }}
        />

        <View style={{ marginTop: spacing.md }}>
          {filteredList.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: spacing.lg }}>
              No hay datos todavía
            </Text>
          ) : (
            filteredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleEdit(item.id!)}
              >
                <Card
                  style={[
                    g.card,
                    {
                      marginBottom: spacing.md,
                      borderRadius: radius.lg,
                    },
                  ]}
                >
                  <Card.Content>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ alignItems: "center", flex: 1 }}>
                        <Image
                          source={{ uri: item.teams.home.logo }}
                          style={{ width: 32, height: 32 }}
                        />

                        <Text numberOfLines={1}>{item.teams.home.name}</Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        {item.result.home} - {item.result.away}
                      </Text>

                      <View style={{ alignItems: "center", flex: 1 }}>
                        <Image
                          source={{ uri: item.teams.away.logo }}
                          style={{ width: 32, height: 32 }}
                        />

                        <Text numberOfLines={1}>{item.teams.away.name}</Text>
                      </View>
                    </View>
                  </Card.Content>

                  <Card.Actions style={{ justifyContent: "center" }}>
                    <Button
                      icon="delete"
                      textColor="red"
                      onPress={() => handleDelete(item.id!)}
                    >
                      Borrar
                    </Button>
                  </Card.Actions>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </PrivateLayout>
  );
}
