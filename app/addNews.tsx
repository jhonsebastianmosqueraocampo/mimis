import Loading from "@/components/Loading";
import NewsForm from "@/components/NewsForm";
import { useFetch } from "@/hooks/FetchContext";
import { NewsItem } from "@/types";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PrivateLayout from "./privateLayout";

const GREEN = "#2ecc71";

export default function AddNews() {
  const { getUsersNews, deleteUsersNews } = useFetch();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      setLoading(true);
      try {
        const { success, userNews, message } = await getUsersNews();
        if (!isMounted) return;

        if (success) {
          setNews(userNews);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar videos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNews();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { success, userNews, message } = await deleteUsersNews(id);
      if (success) {
        setNews(userNews);
      } else {
        setError(message!);
      }
    } catch (error) {
      setError("Hubo un error eliminando la tarea. Inténtelo de nuevo");
    }
  };

  const handleEdit = (item: NewsItem) => {
    setSelectedNews(item);
    setOpenForm(true);
  };

  const handleCreate = () => {
    setSelectedNews(null);
    setOpenForm(true);
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando noticias"
        subtitle="Estamos obteniendo las noticias"
      />
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <Text style={{ color: "red", margin: 20 }}>{error}</Text>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <View style={{ padding: 16 }}>
        {/* Encabezado */}
        <Text
          variant="headlineMedium"
          style={{
            marginBottom: 20,
            fontWeight: "700",
            textAlign: "center",
            color: GREEN,
          }}
        >
          📰 Noticias creadas
        </Text>

        {/* Botón agregar */}
        <Button
          mode="contained"
          onPress={handleCreate}
          icon="plus"
          style={{
            marginBottom: 20,
            backgroundColor: GREEN,
            borderRadius: 10,
            paddingVertical: 6,
          }}
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          Agregar Noticia
        </Button>

        {/* Listado */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {news.map((n) => (
            <Card
              key={n.id}
              mode="elevated"
              style={{
                marginBottom: 16,
                borderRadius: 15,
                padding: 12,
                backgroundColor: "#fff",
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                {/* Miniatura */}
                <Image
                  source={{
                    uri: `http://192.168.10.16:3001/api/userNews/image/${n.fotoPrincipal}`,
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                />

                {/* Info */}
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "bold", marginBottom: 4 }}
                  >
                    {n.titulo}
                  </Text>
                  <Text
                    style={{
                      color: "#888",
                      fontSize: 13,
                    }}
                  >
                    Entidad: {n.entidad}
                  </Text>
                </View>

                {/* Acciones */}
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <TouchableOpacity onPress={() => handleEdit(n)}>
                    <Icon name="pencil" size={26} color={GREEN} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(n.id!)}>
                    <Icon name="trash-can-outline" size={26} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>

        {/* Modal Form */}
        {openForm && (
          <NewsForm
            visible={openForm}
            onClose={() => setOpenForm(false)}
            existingNews={selectedNews}
            setNews={setNews}
          />
        )}
      </View>
    </PrivateLayout>
  );
}
