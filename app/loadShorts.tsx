import ShortModal from "@/components/ShortModal";
import { LoadShortItem, ShortItem } from "@/types";
import { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Card, IconButton, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export const SHORTS_MOCK: ShortItem[] = [
  {
    id: "1",
    video: "https://example.com/vid1.mp4",
    thumbnail: "https://picsum.photos/200/300",
    fecha: "2025-12-01T10:00:00Z",
    descripcion: "Golazo desde mitad de cancha",
    favoritos: 120,
    comentarios: [
      {
        user: {
          id: "",
          nickName: "",
          email: "",
          points: 0,
          xp: 0,
          level: "Novato",
          betsWon: 0,
          betsLost: 0,
          redeemed: 0,
          badges: [],
        },
        comment: "🔥🔥🔥",
      },
      {
        user: {
          id: "",
          nickName: "",
          email: "",
          points: 0,
          xp: 0,
          level: "Novato",
          betsWon: 0,
          betsLost: 0,
          redeemed: 0,
          badges: [],
        },
        comment: "Qué jugada!",
      },
    ],
  },
  {
    id: "2",
    video: "https://example.com/vid2.mp4",
    thumbnail: "https://picsum.photos/200/301",
    fecha: "2025-11-29T18:20:00Z",
    descripcion: "Mejor jugada del partido",
    favoritos: 34,
    comentarios: [],
  },
];

export default function LoadShorts() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShortItem | null>(null);
  const [shorts, setShorts] = useState<ShortItem[]>(SHORTS_MOCK);

  const openNew = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const openEdit = (item: ShortItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSaveShort = (item: LoadShortItem | ShortItem) => {
    // SI VIENE CON ID → es edición
    if ("id" in item) {
      setShorts((prev) =>
        prev.map((s) => (s.id === item.id ? (item as ShortItem) : s))
      );
    }

    // SI NO TIENE ID → es nuevo
    else {
      const newShort: ShortItem = {
        ...item,
        id: Date.now().toString(),
        favoritos: 0,
        comentarios: [],
      };

      setShorts((prev) => [newShort, ...prev]);
    }

    setModalVisible(false);
  };

  const handleDeleteShort = (id: string) => {
    setShorts((prev) => prev.filter((s) => s.id !== id));
  };

  const dataWithAddButton: ShortItem[] = [
    {
      id: "add",
      thumbnail: "",
      video: "",
      fecha: "",
      descripcion: "",
      comentarios: [],
      favoritos: 0,
    },
    ...shorts,
  ];

  return (
    <PrivateLayout>
      <Text variant="headlineMedium" style={styles.header}>
        Cargar Shorts
      </Text>

      <FlatList
        data={dataWithAddButton}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) =>
          item.id === "add" ? (
            <TouchableOpacity style={styles.addCard} onPress={openNew}>
              <Text style={styles.addPlus}>＋</Text>
              <Text style={styles.addText}>Agregar short</Text>
            </TouchableOpacity>
          ) : (
            <Card style={styles.card}>
              <View>
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumbnail}
                />

                {/* Botones flotantes */}
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => openEdit(item)}
                    style={styles.actionBtn}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="red"
                    onPress={() => handleDeleteShort(item.id)}
                  />
                </View>
              </View>

              <View style={styles.info}>
                <Text style={styles.fecha}>{item.fecha}</Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.descripcion}
                </Text>
              </View>
            </Card>
          )
        }
      />
      <ShortModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveShort}
        editing={editingItem}
      />
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "700",
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  // ADD BUTTON
  addCard: {
    width: "48%",
    height: 180,
    borderWidth: 2,
    borderColor: "#bbb",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addPlus: {
    fontSize: 42,
    fontWeight: "300",
    color: "#777",
  },
  addText: {
    marginTop: 8,
    color: "#777",
  },

  // SHORT ITEM
  card: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
  },

  thumbnail: {
    width: "100%",
    height: 150,
  },

  actions: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    gap: 4,
  },

  actionBtn: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
  },

  info: {
    padding: 8,
  },
  fecha: {
    fontSize: 12,
    opacity: 0.7,
  },
  desc: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "500",
  },
});
