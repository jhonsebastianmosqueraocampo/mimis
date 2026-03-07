import Loading from "@/components/Loading";
import ShortModal from "@/components/ShortModal";
import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { LoadShortItem, ShortItem } from "@/types";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
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

    const load = async () => {
      setLoading(true);

      try {
        const { success, shorts } = await getShorts();

        if (!isMounted) return;

        if (success) {
          setShorts(shorts);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

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

    try {
      const formData = new FormData();

      formData.append("descripcion", item.descripcion);

      if (typeof item.video !== "string") {
        formData.append("video", {
          uri: item.video.uri,
          name: item.video.name || "video.mp4",
          type: item.video.mimeType || "video/mp4",
        } as any);
      }

      if (typeof item.thumbnail !== "string") {
        formData.append("thumbnail", {
          uri: item.thumbnail.uri,
          name: item.thumbnail.name || "thumb.jpg",
          type: item.thumbnail.mimeType || "image/jpeg",
        } as any);
      }

      if ("id" in item) {
        const { success, short } = await updateShort(item.id, formData);

        if (success && short) {
          setShorts((prev) => prev.map((s) => (s.id === item.id ? short : s)));
        }
      } else {
        const resp = await createShort(formData);

        if (resp.success && resp.short) {
          const created: ShortItem = {
            ...resp.short,
            fecha: item.fecha,
          } as ShortItem;
          setShorts((prev) => [created, ...prev]);
        }
      }

      setModalVisible(false);
      setEditingItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShort = async (id: string) => {
    const snapshot = shorts;

    setShorts((prev) => prev.filter((s) => s.id !== id));

    const { success } = await deleteShort(id);

    if (!success) {
      setShorts(snapshot);
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
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <Text
        style={[g.title, { textAlign: "center", marginBottom: spacing.md }]}
      >
        Cargar Shorts
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          paddingHorizontal: spacing.md,
        }}
      >
        {dataWithAddButton.map((item) =>
          item.id === "add" ? (
            <TouchableOpacity
              key="add"
              onPress={openNew}
              style={{
                width: "48%",
                height: 180,
                borderWidth: 2,
                borderColor: colors.primary,
                borderStyle: "dashed",
                borderRadius: radius.lg,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.md,
              }}
            >
              <Text style={{ fontSize: 42, color: colors.primary }}>＋</Text>
              <Text style={{ marginTop: 6 }}>Agregar short</Text>
            </TouchableOpacity>
          ) : (
            <Card
              key={item.id}
              style={[
                g.card,
                {
                  width: "48%",
                  marginBottom: spacing.md,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <View>
                <Image
                  source={{ uri: item.thumbnail }}
                  style={{
                    width: "100%",
                    height: 150,
                  }}
                />

                {/* ACTIONS */}

                <View
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    flexDirection: "row",
                  }}
                >
                  <IconButton
                    icon="pencil"
                    size={18}
                    onPress={() => openEdit(item)}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                    }}
                  />

                  <IconButton
                    icon="delete"
                    size={18}
                    iconColor="red"
                    onPress={() => handleDeleteShort(item.id)}
                  />
                </View>
              </View>

              <View style={{ padding: spacing.sm }}>
                <Text style={{ fontSize: 12, opacity: 0.7 }}>{item.fecha}</Text>

                <Text numberOfLines={2} style={{ marginTop: 3 }}>
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
