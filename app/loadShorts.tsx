import Loading from "@/components/Loading";
import ShortModal from "@/components/ShortModal";
import { useFetch } from "@/hooks/FetchContext";
import { LoadShortItem, ShortItem } from "@/types";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function LoadShorts() {
  const { getShorts, createShort, updateShort, deleteShort } = useFetch();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShortItem | null>(null);
  const [shorts, setShorts] = useState<ShortItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const getFavoriteList = async () => {
      setLoading(true);
      try {
        const { success, shorts, message } = await getShorts();
        if (!isMounted) return;

        if (success) {
          setShorts(shorts);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar los equipos favoritos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getFavoriteList();

    return () => {
      isMounted = false;
    };
  }, []);

  const openNew = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const openEdit = (item: ShortItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSaveShort = async (item: LoadShortItem | ShortItem) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("descripcion", item.descripcion);

      // 📌 SOLO agregar video si es un archivo nuevo (no URL string)
      if (typeof item.video !== "string") {
        formData.append("video", {
          uri: item.video.uri,
          name: item.video.name || "video.mp4",
          type: item.video.mimeType || "video/mp4",
        } as any);
      }

      // 📌 SOLO agregar thumbnail si es nuevo
      if (typeof item.thumbnail !== "string") {
        formData.append("thumbnail", {
          uri: item.thumbnail.uri,
          name: item.thumbnail.name || "thumb.jpg",
          type: item.thumbnail.mimeType || "image/jpeg",
        } as any);
      }

      // ======================
      // EDIT
      // ======================
      if ("id" in item) {
        const { success, short, message } = await updateShort(
          item.id,
          formData,
        );

        if (!success || !short) {
          throw new Error(message || "No fue posible editar el short.");
        }

        const merged: ShortItem = {
          ...short,
          fecha: item.fecha ?? short.fecha,
        };

        setShorts((prev) => prev.map((s) => (s.id === item.id ? merged : s)));
      }

      // ======================
      // CREATE
      // ======================
      else {
        const resp = await createShort(formData);

        if (!resp.success || !resp.short) {
          throw new Error(resp.message || "No fue posible crear el short.");
        }

        const created: ShortItem = {
          ...resp.short,
          fecha: item.fecha,
        };

        setShorts((prev) => [created, ...prev]);
      }

      setModalVisible(false);
      setEditingItem(null);
    } catch (e: any) {
      setError(e?.message || "Error guardando el short.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShort = async (id: string) => {
    setError(null);

    // optimista (se ve rápido)
    const snapshot = shorts;
    setShorts((prev) => prev.filter((s) => s.id !== id));

    const { success, message } = await deleteShort(id);
    if (!success) {
      setShorts(snapshot); // revertir
      setError(message || "No fue posible eliminar el short.");
    }
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
      liked: false,
    },
    ...shorts,
  ];

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
    <PrivateLayout>
      <Text variant="headlineMedium" style={styles.header}>
        Cargar Shorts
      </Text>

      <View style={styles.grid}>
        {dataWithAddButton.map((item) =>
          item.id === "add" ? (
            <TouchableOpacity
              key="add"
              style={styles.addCard}
              onPress={openNew}
            >
              <Text style={styles.addPlus}>＋</Text>
              <Text style={styles.addText}>Agregar short</Text>
            </TouchableOpacity>
          ) : (
            <Card key={item.id} style={styles.card}>
              <View>
                <Image
                  source={{
                    uri: item.thumbnail,
                  }}
                  style={styles.thumbnail}
                />
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
          ),
        )}
      </View>

      <ShortModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveShort}
        editing={editingItem}
        loading={loading}
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
  addPlus: {
    fontSize: 42,
    fontWeight: "300",
    color: "#777",
  },
  addText: {
    marginTop: 8,
    color: "#777",
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    width: "48%",
    marginBottom: 14,
    borderRadius: 12,
    overflow: "hidden",
  },

  addCard: {
    width: "48%",
    height: 180,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#bbb",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
