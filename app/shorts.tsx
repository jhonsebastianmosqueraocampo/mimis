// ShortsScreen.tsx
import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadInterstitial } from "@/services/ads/interstitial";
import { ShortItem } from "@/types";
import { ResizeMode, Video } from "expo-av";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Text, TextInput } from "react-native-paper";
import PrivateLayout from "./privateLayout";
import ShortsFull from "./ShortsFull";

const { width } = Dimensions.get("window");

export default function Shorts() {
  const { getShorts, getLimitAdsPerDay } = useFetch();
  const [fullScreenItem, setFullScreenItem] = useState<ShortItem | null>(null);
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [playPreview, setPlayPreview] = useState(true);
  const [limitAdsPerDay, setLimitAdsPerDay] = useState(20);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<
    "fecha_desc" | "fecha_asc" | "favoritos"
  >("fecha_desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterstitial();
  }, []);

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

    const loadAdsLimitPerDay = async () => {
      setLoading(true);
      try {
        const { success, limit, message } = await getLimitAdsPerDay();
        if (!isMounted) return;

        if (success) {
          setLimitAdsPerDay(limit);
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
    loadAdsLimitPerDay();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredShorts = useMemo(() => {
    let list = [...shorts];

    // 🔎 Buscar por descripción
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.descripcion.toLowerCase().includes(q));
    }

    // 🔀 Ordenar
    switch (orderBy) {
      case "fecha_asc":
        list.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        );
        break;

      case "favoritos":
        list.sort((a, b) => b.favoritos - a.favoritos);
        break;

      case "fecha_desc":
      default:
        list.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        break;
    }

    return list;
  }, [shorts, search, orderBy]);

  useFocusEffect(
    React.useCallback(() => {
      // pantalla activa
      setPlayPreview(true);

      return () => {
        // pantalla pierde foco
        setPlayPreview(false);
      };
    }, []),
  );

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const renderShortItem = ({
    item,
    index,
  }: {
    item: ShortItem;
    index: number;
  }) => {
    const isFirst = index === 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setFullScreenItem(item)}
        activeOpacity={0.9}
      >
        {/* Video o thumbnail */}
        {isFirst ? (
          <Video
            source={{ uri: item.video }}
            style={styles.video}
            shouldPlay={playPreview && !fullScreenItem}
            resizeMode={ResizeMode.COVER}
            isLooping
          />
        ) : (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        )}

        {/* Overlay contadores */}
        <View style={styles.overlay}>
          <View style={styles.counter}>
            <Text style={styles.counterIcon}>❤️</Text>
            <Text style={styles.counterText}>{item.favoritos}</Text>
          </View>

          <View style={styles.counter}>
            <Text style={styles.counterIcon}>💬</Text>
            <Text style={styles.counterText}>
              {item.comentarios?.length ?? 0}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.fecha}>{item.fecha.slice(0, 10)}</Text>
          <Text numberOfLines={2} style={styles.desc}>
            {item.descripcion}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PrivateLayout>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🔥 Shorts</Text>
        <Text style={styles.headerSubtitle}>Los mejores momentos en video</Text>
      </View>

      <TextInput
        placeholder="Buscar por descripción…"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" />}
      />

      <View style={styles.filters}>
        <Button
          mode={orderBy === "fecha_desc" ? "contained" : "outlined"}
          onPress={() => setOrderBy("fecha_desc")}
        >
          Recientes
        </Button>

        <Button
          mode={orderBy === "fecha_asc" ? "contained" : "outlined"}
          onPress={() => setOrderBy("fecha_asc")}
        >
          Antiguos
        </Button>

        <Button
          mode={orderBy === "favoritos" ? "contained" : "outlined"}
          onPress={() => setOrderBy("favoritos")}
        >
          ❤️ Favoritos
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredShorts.map((item, index) => (
            <View key={item.id} style={styles.cardWrapper}>
              {renderShortItem({ item, index })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginVertical: 10, alignItems: "center" }}>
        <AdBanner />
      </View>

      {fullScreenItem && (
        <ShortsFull
          item={fullScreenItem}
          shorts={shorts}
          setShorts={setShorts}
          onClose={() => setFullScreenItem(null)}
          limitAdsPerDay={limitAdsPerDay}
          setLimitAdsPerDay={setLimitAdsPerDay}
        />
      )}
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  card: {
    width: width * 0.47,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  video: {
    width: "100%",
    height: 220,
  },
  thumbnail: {
    width: "100%",
    height: 220,
  },
  info: { padding: 6 },
  fecha: {
    fontSize: 12,
    opacity: 0.6,
  },
  desc: {
    marginTop: 3,
    color: "white",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardWrapper: {
    width: "48%", // 👈 2 columnas estilo CSS
    marginBottom: 14,
  },

  overlay: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  counter: {
    flexDirection: "row",
    alignItems: "center",
  },

  counterIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  counterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
  },

  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
});
