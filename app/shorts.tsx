// ShortsScreen.tsx
import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadInterstitial } from "@/services/ads/interstitial";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { typography } from "@/theme/typography";
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
    return <Loading visible={loading} />;
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
        <Text style={g.titleLarge}>🔥 Shorts</Text>
        <Text style={g.bodySecondary}>Los mejores momentos en video</Text>
      </View>

      <TextInput
        placeholder="Buscar por descripción…"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" />}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      <View style={styles.filters}>
        <Button
          mode={orderBy === "fecha_desc" ? "contained" : "outlined"}
          onPress={() => setOrderBy("fecha_desc")}
          buttonColor={orderBy === "fecha_desc" ? colors.primary : undefined}
        >
          Recientes
        </Button>

        <Button
          mode={orderBy === "fecha_asc" ? "contained" : "outlined"}
          onPress={() => setOrderBy("fecha_asc")}
          buttonColor={orderBy === "fecha_asc" ? colors.primary : undefined}
        >
          Antiguos
        </Button>

        <Button
          mode={orderBy === "favoritos" ? "contained" : "outlined"}
          onPress={() => setOrderBy("favoritos")}
          buttonColor={orderBy === "favoritos" ? colors.primary : undefined}
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
  row: {
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  card: {
    width: width * 0.47,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },

  video: {
    width: "100%",
    height: 220,
  },

  thumbnail: {
    width: "100%",
    height: 220,
  },

  info: {
    padding: spacing.xs,
  },

  fecha: {
    ...typography.small,
  },

  desc: {
    ...typography.body,
    marginTop: spacing.xs,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardWrapper: {
    width: "48%",
    marginBottom: spacing.md,
  },

  overlay: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.round,
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
    fontFamily: typography.subtitle.fontFamily,
    color: colors.textOnPrimary,
    fontSize: 12,
  },

  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceVariant,
  },

  filters: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
