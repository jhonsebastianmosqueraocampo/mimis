import ProductCard from "@/components/ProductCard";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { loadInterstitial } from "@/services/ads/interstitial";
import { showRewardedAd } from "@/services/ads/rewarded";
import { Product } from "@/types";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  Text,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function StoreScreen() {
  const { productsList, descountLimitAdsPerDayAndAddPoint, getLimitAdsPerDay } =
    useFetch();
  const [category, setCategory] = useState<string>("Todos");

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);

  const [loadingFirst, setLoadingFirst] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [limitAdsPerDay, setLimitAdsPerDay] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterstitial();
  }, []);

  useEffect(() => {
    let isMounted = true;

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

    loadAdsLimitPerDay();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ categorías sacadas de products (backend)
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const c = (p.category || "").trim();
      if (c) set.add(c);
    }
    return ["Todos", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  // ✅ si el usuario tenía una categoría que ya no existe, vuelve a "Todos"
  useEffect(() => {
    if (category === "Todos") return;
    if (!categories.includes(category)) setCategory("Todos");
  }, [categories]);

  const filtered = useMemo(() => {
    return category === "Todos"
      ? products
      : products.filter((p) => p.category === category);
  }, [category, products]);

  useEffect(() => {
    loadPage(1, true);
  }, []);

  const getCurrentPosition = async () => {
    // pedir permisos
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Permiso de ubicación denegado");
    }

    // obtener ubicación
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  };

  const loadPage = async (nextPage: number, reset = false) => {
    try {
      if (reset) setLoadingFirst(true);
      else setLoadingMore(true);

      const { lat, lng } = await getCurrentPosition();

      const { success, products, hasNext, page, message } = await productsList(
        nextPage,
        lat,
        lng,
      );

      if (!success) {
        throw new Error(message || "No fue posible crear la orden.");
      }

      const incoming = (products || []) as Product[];

      setHasNext(Boolean(hasNext));
      setPage(Number(page) || nextPage);

      setProducts((prev) => {
        if (reset) return incoming;

        // evitar duplicados por id
        const map = new Map(prev.map((p) => [p.id, p]));
        for (const p of incoming) map.set(p.id, p);
        return Array.from(map.values());
      });
    } catch (e) {
      return;
    } finally {
      setLoadingFirst(false);
      setLoadingMore(false);
    }
  };

  const refresh = () => {
    setHasNext(true);
    setPage(1);
    loadPage(1, true);
  };

  const loadMore = () => {
    if (!hasNext) return;
    if (loadingFirst || loadingMore) return;
    loadPage(page + 1, false);
  };

  const handleReward = () => {
    showRewardedAd(async () => {
      try {
        const { success, limit, message } =
          await descountLimitAdsPerDayAndAddPoint();
        if (success) {
          setLimitAdsPerDay(limit);
        }
        console.log("Usuario ganó puntos 🎉");
      } catch (error) {
        console.log("Error aplicando recompensa", error);
      }
    });
  };

  return (
    <PrivateLayout>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content
          title="Tienda de Puntos"
          subtitle="Canjea tus productos favoritos"
          titleStyle={{ color: "white" }}
          subtitleStyle={{ color: "white" }}
        />
        <Appbar.Action icon="refresh" onPress={refresh} />
      </Appbar.Header>

      {/* CTA */}
      {limitAdsPerDay > 0 && (
        <Card style={{ margin: 10, borderRadius: 12 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 6 }}>
              ¿Quieres más puntos?
            </Text>
            <Text variant="bodySmall" style={{ marginBottom: 10 }}>
              Mira videos publicitarios y gana puntos adicionales.
            </Text>
            <Button mode="contained-tonal" onPress={handleReward}>
              🎥 Presiona aquí para obtener más puntos
            </Button>
          </Card.Content>
        </Card>
      )}

      {/*Banner tienda */}
      <View style={{ marginVertical: 6 }}>
        <AdBanner />
      </View>

      {/* Categorías (dinámicas) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 10, marginVertical: 10 }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat}
            selected={category === cat}
            onPress={() => setCategory(cat)}
            style={{ marginRight: 8 }}
          >
            {cat}
          </Chip>
        ))}
      </ScrollView>

      <Divider />

      {/* Lista */}
      <ScrollView
        style={{ padding: 10 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {loadingFirst ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, opacity: 0.7 }}>
              Cargando productos…
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {filtered.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>

            {!filtered.length && (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ opacity: 0.7 }}>
                  No hay productos en esta categoría.
                </Text>
              </View>
            )}

            <View style={{ paddingTop: 10 }}>
              {hasNext ? (
                <Button
                  mode="contained"
                  onPress={loadMore}
                  loading={loadingMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Cargando…" : "Cargar más"}
                </Button>
              ) : (
                <Text style={{ textAlign: "center", opacity: 0.6 }}>
                  Ya viste todos los productos.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 14,
  },
});
