import Loading from "@/components/Loading";
import NewsDetail from "@/components/NewsDetail";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { NewsItem } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PrivateLayout from "./privateLayout";

export default function News() {
  const { getGeneralUsersNews } = useFetch();

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      const { success, userNews } = await getGeneralUsersNews();

      if (!isMounted) return;

      if (success) setNews(userNews);

      setLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

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
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <View style={{ flex: 1, padding: spacing.md }}>
        {/* HEADER */}

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[g.title, { color: colors.primary }]}>
            📰 Noticias del Fútbol
          </Text>

          <Text style={{ marginTop: 4, opacity: 0.7 }}>
            Últimas novedades de jugadores, equipos y entrenadores
          </Text>
        </View>

        {/* BUSCADOR */}

        <View
          style={[
            g.card,
            {
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: spacing.sm,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Icon name="magnify" size={22} color={colors.textSecondary} />

          <TextInput
            mode="flat"
            placeholder="Buscar jugador, equipo o usuario..."
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, backgroundColor: "transparent" }}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
        </View>

        {/* FILTRO FECHA */}

        <TextInput
          mode="outlined"
          placeholder="Filtrar por fecha (YYYY-MM-DD)"
          value={dateFilter}
          onChangeText={setDateFilter}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          style={{ marginBottom: spacing.md }}
        />

        <View style={{ marginBottom: spacing.md }}>
          <AdBanner />
        </View>

        {/* GRID */}

        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            paddingBottom: spacing.xl,
          }}
        >
          {filteredNews.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && index % 6 === 0 && (
                <View style={{ marginVertical: spacing.md }}>
                  <AdBanner />
                </View>
              )}

              <TouchableOpacity
                onPress={() => setSelectedNews(item)}
                style={{ width: "48%", marginBottom: spacing.md }}
              >
                <View
                  style={[
                    g.card,
                    {
                      borderRadius: radius.lg,
                      overflow: "hidden",
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.fotoPrincipal }}
                    style={{
                      width: "100%",
                      height: 130,
                    }}
                  />

                  <View style={{ padding: spacing.sm }}>
                    <Text numberOfLines={2} style={{ fontWeight: "700" }}>
                      {item.titulo}
                    </Text>

                    <Text style={{ fontSize: 12, opacity: 0.7 }}>
                      {item.entidad} • {item.user.name}
                    </Text>

                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.primary,
                        marginTop: 3,
                      }}
                    >
                      {item.fecha}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </ScrollView>

        {selectedNews && (
          <NewsDetail
            visible
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </View>
    </PrivateLayout>
  );
}
