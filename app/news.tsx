import Loading from "@/components/Loading";
import NewsDetail from "@/components/NewsDetail";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { NewsItem } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
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
  }, [news, search, dateFilter]);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
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
          <Icon name="magnify" size={22} color="#555" />

          <TextInput
            mode="flat"
            placeholder="Buscar por entidad, jugador o usuario..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            textColor="#000"
            placeholderTextColor="#777"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
        </View>

        {/* 📅 FILTRO POR FECHA */}
        <TextInput
          mode="outlined"
          placeholder="Filtrar por fecha (YYYY-MM-DD)"
          value={dateFilter}
          onChangeText={setDateFilter}
          style={styles.dateInput}
          textColor="#000"
          placeholderTextColor="#777"
          outlineColor="#ccc"
          activeOutlineColor="#2ecc71"
        />

        <View style={{ marginVertical: 12 }}>
          <AdBanner />
        </View>

        {/* 📰 GRID DE NOTICIAS */}
        <ScrollView contentContainerStyle={styles.grid}>
          {filteredNews.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && index % 6 === 0 && (
                <View style={{ marginVertical: 12 }}>
                  <AdBanner />
                </View>
              )}
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => setSelectedNews(item)}
              >
                <Image
                  source={{
                    uri: `http://192.168.10.16:3001/api/userNews/image/${item.fotoPrincipal}`,
                  }}
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
            </React.Fragment>
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
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    fontSize: 14,
  },

  dateInput: {
    backgroundColor: "#fff",
    marginBottom: 15,
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
