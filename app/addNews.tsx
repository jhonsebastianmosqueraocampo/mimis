import Loading from "@/components/Loading";
import NewsForm from "@/components/NewsForm";
import { useFetch } from "@/hooks/FetchContext";
import { NewsItem } from "@/types";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PrivateLayout from "./privateLayout";

import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";
import { colors } from "@/theme/colors";

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
      } catch {
        if (isMounted) setError("Error al cargar noticias");
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
    } catch {
      setError("Hubo un error eliminando la noticia");
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
        <Text style={[g.body, { color: colors.error, marginVertical: 20 } as any]}>
          {error}
        </Text>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <View style={g.screen}>

        {/* Encabezado */}
        <Text style={[g.titleLarge, sx({ mb: 20, center: true, color: colors.primary }) as any]}>
          📰 Noticias creadas
        </Text>

        {/* Botón agregar */}
        <Button
          mode="contained"
          icon="plus"
          onPress={handleCreate}
          style={[g.button, sx({ mb: 20 })] as any}
          labelStyle={g.buttonText}
        >
          Agregar noticia
        </Button>

        {/* Listado */}
        <ScrollView showsVerticalScrollIndicator={false}>

          {news.map((n) => (
            <Card key={n.id} style={[g.card, sx({ mb: 16 })] as any}>

              <View style={g.row}>

                {/* Imagen */}
                <Image
                  source={{ uri: n.fotoPrincipal }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                />

                {/* Info */}
                <View style={{ flex: 1, justifyContent: "center" }}>

                  <Text style={g.subtitle}>
                    {n.titulo}
                  </Text>

                  <Text style={[g.small, sx({ mt: 4 })] as any}>
                    Entidad: {n.entidad}
                  </Text>

                </View>

                {/* Acciones */}
                <View style={[sx({ center: true }) as any, { gap: 14 }]}>

                  <TouchableOpacity onPress={() => handleEdit(n)}>
                    <Icon
                      name="pencil"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(n.id!)}>
                    <Icon
                      name="trash-can-outline"
                      size={24}
                      color={colors.error}
                    />
                  </TouchableOpacity>

                </View>

              </View>

            </Card>
          ))}

        </ScrollView>

        {/* Modal */}
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