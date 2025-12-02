import NewsDetail from "@/components/NewsDetail";
import { useFetch } from "@/hooks/FetchContext";
import { NewsItem } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PrivateLayout from "./privateLayout";

const GREEN = "#2ecc71";

export default function News() {
  const { getGeneralUsersNews } = useFetch();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      setLoading(true);
      try {
        const { success, userNews, message } = await getGeneralUsersNews();
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

  // Filtrado inteligente
  const filteredNews = useMemo(() => {
    return news.filter((n) => {
      const matchText =
        n.titulo.toLowerCase().includes(search.toLowerCase()) ||
        n.entidad.toLowerCase().includes(search.toLowerCase()) ||
        n.user.name.toLowerCase().includes(search.toLowerCase());

      const matchDate = dateFilter ? n.fecha?.startsWith(dateFilter) : true;

      return matchText && matchDate;
    });
  }, [search, dateFilter]);

  if (loading) {
    return (
      <PrivateLayout>
        <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />
      </PrivateLayout>
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
      <View style={styles.container}>
        {/* 🟢 ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📰 Noticias del Fútbol</Text>
          <Text style={styles.headerSubtitle}>
            Últimas novedades de jugadores, equipos y entrenadores
          </Text>
        </View>

        {/* 🔍 BUSCADOR */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={22} color="#777" />
          <TextInput
            placeholder="Buscar por entidad, jugador o usuario..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* 📅 FILTRO POR FECHA */}
        <TextInput
          style={styles.dateInput}
          placeholder="Filtrar por fecha (YYYY-MM-DD)"
          value={dateFilter}
          onChangeText={setDateFilter}
        />

        {/* 📰 GRID DE NOTICIAS */}
        <ScrollView contentContainerStyle={styles.grid}>
          {filteredNews.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => setSelectedNews(item)}
            >
              <Image
                source={{ uri: item.fotoPrincipal }}
                style={styles.cardImage}
              />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.titulo}
                </Text>

                <Text style={styles.cardMeta}>
                  {item.entidad} • {item.user.name}
                </Text>

                <Text style={styles.cardDate}>{item.fecha}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 📄 MODAL DE NOTICIA COMPLETA */}
        {selectedNews && (
          <NewsDetail
            visible={!!selectedNews}
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },

  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: GREEN,
  },
  headerSubtitle: {
    color: "#555",
    fontSize: 14,
    marginTop: 4,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
  },

  dateInput: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 50,
  },

  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 130,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: "#666",
  },
  cardDate: {
    fontSize: 11,
    color: GREEN,
    marginTop: 4,
  },
});
