import Loading from "@/components/Loading";
import VerticalScroll from "@/components/VerticalScroll";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { swiperItem } from "@/types";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Text, TextInput } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function TransferNews() {
  const { getNewsSignAndRumorFavoritesAndGeneral } = useFetch();
  const [newsFavorties, setNewsFavorties] = useState<swiperItem[]>();
  const [newsGeneral, setNewsGeneral] = useState<swiperItem[]>();
  const [selectedTab, setSelectedTab] = useState<"favorites" | "general">(
    "favorites",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  useEffect(() => {
    setPage(1);
  }, [selectedTab, search]);

  useEffect(() => {
    let isMounted = true;

    const newsSignAndRumorFavoritesAndGeneral = async () => {
      setLoading(true);
      try {
        const { success, newsFavorites, newsGeneral, message } =
          await getNewsSignAndRumorFavoritesAndGeneral();

        if (!isMounted) return;

        if (success) {
          setNewsFavorties(newsFavorites!);
          setNewsGeneral(newsGeneral!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    newsSignAndRumorFavoritesAndGeneral();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeNews =
    selectedTab === "favorites" ? (newsFavorties ?? []) : (newsGeneral ?? []);

  const filteredAndSortedNews = React.useMemo(() => {
    return activeNews.filter((n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [activeNews, search]);

  const paginatedNews = filteredAndSortedNews.slice(0, page * PAGE_SIZE);

  const hasMore = paginatedNews.length < filteredAndSortedNews.length;

  if (loading) {
    return <Loading visible={loading} />;
  }

  const actionGeneralListNews = (id: string) => console.log(id);

  return (
    <PrivateLayout>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsRow}>
              <Chip
                selected={selectedTab === "favorites"}
                onPress={() => setSelectedTab("favorites")}
                style={styles.chip}
                selectedColor={colors.primary}
              >
                ⭐ Favoritos
              </Chip>

              <Chip
                selected={selectedTab === "general"}
                onPress={() => setSelectedTab("general")}
                style={styles.chip}
                selectedColor={colors.primary}
              >
                🌍 Generales
              </Chip>
            </View>
          </ScrollView>
        </View>

        <TextInput
          placeholder="Buscar noticia..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          mode="outlined"
        />

        <View style={{ marginVertical: 12, alignItems: "center" }}>
          <AdBanner />
        </View>

        {/* 🟢 SECCIÓN: FAVORITOS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedTab === "favorites"
                ? "⭐ Tus equipos"
                : "🌍 Fútbol mundial"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {selectedTab === "favorites"
                ? "Fichajes y rumores de tus favoritos"
                : "Noticias generales y rumores del mercado"}
            </Text>
          </View>

          {paginatedNews.length > 0 ? (
            <>
              <VerticalScroll
                listItems={paginatedNews}
                actionGeneralList={actionGeneralListNews}
              />

              {hasMore && (
                <Button
                  mode="outlined"
                  onPress={() => setPage((p) => p + 1)}
                  style={{ marginTop: spacing.sm }}
                  textColor={colors.primary}
                >
                  Ver más noticias
                </Button>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>
              No hay resultados con estos filtros 🔍
            </Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },

  sectionSpacer: {
    height: spacing.lg,
  },

  emptyText: {
    textAlign: "center",
    ...typography.body,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  chipsContainer: {
    marginBottom: spacing.sm,
  },

  chipsRow: {
    flexDirection: "row",
  },

  chip: {
    marginRight: spacing.xs,
    backgroundColor: colors.surface,
  },

  searchInput: {
    marginBottom: spacing.xs,
  },

  orderRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
});
