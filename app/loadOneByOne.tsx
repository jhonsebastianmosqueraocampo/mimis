// app/LoadOneByOne.tsx
import OneByOneForm from "@/components/OneByOneForm";
import { useFetch } from "@/hooks/FetchContext";
import { OneByOne } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Text,
    TextInput,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

// Chips de ligas/tornos (por ahora solo visual / filtro simple)
const LEAGUE_CHIPS = [
  "LaLiga",
  "Premier League",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Liga Colombiana",
  "Champions League",
  "Europa League",
  "Libertadores",
  "Eliminatorias",
];

// ======================
// Componente principal
// ======================
export default function LoadOneByOne() {
  const { getOneByOne, deleteOneByOneItem } = useFetch();
  const [search, setSearch] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const [oneByOneList, setOneByOneList] = useState<OneByOne[]>([]);

  const [oneByOne, setOneByOne] = useState<OneByOne | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { success, message, oneByOneList } = await getOneByOne();

        if (!isMounted || !success) {
          setError(message!);
          return;
        }

        setOneByOneList(oneByOneList);
      } catch (err) {
        if (isMounted) setError("Error al cargar los datos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <PrivateLayout>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </PrivateLayout>
    );
  }

  // Filtro de la lista principal
  const filteredList = useMemo(() => {
    let result = oneByOneList;

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.teams.home.name.toLowerCase().includes(s) ||
          item.teams.away.name.toLowerCase().includes(s)
      );
    }

    if (selectedChip) {
      const sChip = selectedChip.toLowerCase();
      result = result.filter(
        (item) =>
          item.teams.home.name.toLowerCase().includes(sChip) ||
          item.teams.away.name.toLowerCase().includes(sChip)
      );
    }

    return result;
  }, [search, selectedChip, oneByOneList]);

  // Crear uno nuevo (form en modo crear)
  const handleCreate = () => {
    setEditingId(null);
    setOneByOne(null);
    setShowForm(true);
  };

  // Editar uno existente
  const handleEdit = (id: string) => {
    const found = oneByOneList.find((i) => i.id === id);
    if (!found) return;
    setEditingId(id);
    setOneByOne(found);
    setShowForm(true);
  };

  // Eliminar
  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar uno por uno",
      "¿Seguro que quieres eliminar este uno por uno?",
      [
        { text: "Cancelar", style: "cancel" },

        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { success, message } = await deleteOneByOneItem(id);

            if (!success) {
              Alert.alert("Error", message || "No se pudo eliminar");
              return;
            }

            // si sale todo bien, eliminar del estado local
            setOneByOneList((prev) => prev.filter((i) => i.id !== id));
          },
        },
      ]
    );
  };

  // Guardar (crear o actualizar)
  const handleSave = (saved: OneByOne) => {
    setOneByOneList((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      if (exists) {
        return prev.map((i) => (i.id === saved.id ? saved : i));
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditingId(null);
    setOneByOne(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setOneByOne(null);
  };

  // Card de cada uno por uno en la grilla
  const renderItem = ({ item }: { item: OneByOne }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleEdit(item.id)}
    >
      <Card style={{ flex: 1 }}>
        <Card.Content style={styles.gridCard}>
          <View style={styles.teamRow}>
            <View style={styles.teamCol}>
              <Image
                source={{ uri: item.teams.home.logo }}
                style={styles.logo}
              />
              <Text variant="labelMedium" numberOfLines={1}>
                {item.teams.home.name}
              </Text>
            </View>

            <View style={styles.vsCol}>
              <Text variant="titleMedium" style={styles.scoreText}>
                {item.result.home} - {item.result.away}
              </Text>
              <Text variant="labelSmall" style={styles.vsLabel}>
                VS
              </Text>
            </View>

            <View style={styles.teamCol}>
              <Image
                source={{ uri: item.teams.away.logo }}
                style={styles.logo}
              />
              <Text variant="labelMedium" numberOfLines={1}>
                {item.teams.away.name}
              </Text>
            </View>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            icon="delete"
            textColor="red"
            onPress={() => handleDelete(item.id)}
          >
            Borrar
          </Button>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );

  // Modo formulario
  if (showForm) {
    return (
      <PrivateLayout>
        <OneByOneForm
          oneByOneId={editingId}
          oneByOne={oneByOne}
          onCancel={handleCancelForm}
          onSave={handleSave}
        />
      </PrivateLayout>
    );
  }

  // Modo lista
  return (
    <PrivateLayout>
      <View style={styles.container}>
        {/* Header */}
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Calificación uno por uno
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Crea, edita y organiza las valoraciones jugador por jugador de cada
          partido.
        </Text>

        {/* Botón Crear */}
        <View style={styles.createButtonContainer}>
          <Button mode="contained" icon="plus" onPress={handleCreate}>
            Crear uno por uno
          </Button>
        </View>

        {/* Chips de ligas/torneos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          {LEAGUE_CHIPS.map((chip) => (
            <Chip
              key={chip}
              style={styles.chip}
              mode={selectedChip === chip ? "flat" : "outlined"}
              selected={selectedChip === chip}
              onPress={() =>
                setSelectedChip((prev) => (prev === chip ? null : chip))
              }
            >
              {chip}
            </Chip>
          ))}
        </ScrollView>

        {/* Buscador */}
        <TextInput
          mode="outlined"
          placeholder="Buscar fixture (ej. Real Madrid, Liverpool...)"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />

        {/* Grid de 2 columnas */}
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyMedium">
                Aún no has creado ningún uno por uno. Empieza pulsando “Crear
                uno por uno”.
              </Text>
            </View>
          }
        />
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.8,
    marginBottom: 12,
  },
  createButtonContainer: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  searchInput: {
    marginBottom: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridItem: {
    width: "48%",
  },
  gridCard: {
    alignItems: "center",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  teamCol: {
    flex: 1,
    alignItems: "center",
  },
  vsCol: {
    width: 60,
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: "contain",
    marginBottom: 4,
  },
  scoreText: {
    fontWeight: "700",
  },
  vsLabel: {
    opacity: 0.7,
  },
  cardActions: {
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    marginTop: 32,
    alignItems: "center",
  },
});
