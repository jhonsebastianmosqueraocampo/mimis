import { useStore } from "@/hooks/storeContext";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, IconButton, Menu, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

type ProductDetailRouteProp = RouteProp<RootStackParamList, "productDetail">;

export default function ProductDetail() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;

  const { addToStore } = useStore();

  /* -------------------- VARIANTE (COLOR) -------------------- */
  const [selectedColor, setSelectedColor] = useState(
    product.variants?.[0]?.color ?? "",
  );
  const [sizeMenuVisible, setSizeMenuVisible] = useState(false);

  const variant = useMemo(() => {
    return (
      product.variants.find((v) => v.color === selectedColor) ??
      product.variants[0]
    );
  }, [product.variants, selectedColor]);

  /* -------------------- TALLAS "UNIFICADAS" -------------------- */
  // Para cada talla, escogemos el cfg con stock y menor precio (puedes cambiar la regla).
  const sizeOptions = useMemo(() => {
    const cfgs = (variant?.storeConfigs ?? []).filter(
      (c) => (c.stock ?? 0) > 0,
    );

    const map = new Map<string, (typeof cfgs)[number]>();
    for (const c of cfgs) {
      const prev = map.get(c.size);
      if (!prev) {
        map.set(c.size, c);
        continue;
      }
      // regla: elegir el más barato; si empatan, el de más stock
      const prevPrice = Number(prev.price ?? 0);
      const currPrice = Number(c.price ?? 0);
      if (currPrice < prevPrice) map.set(c.size, c);
      else if (currPrice === prevPrice && (c.stock ?? 0) > (prev.stock ?? 0))
        map.set(c.size, c);
    }

    return Array.from(map.values()).sort((a, b) =>
      String(a.size).localeCompare(String(b.size)),
    );
  }, [variant]);

  const [selectedSize, setSelectedSize] = useState<string>(
    sizeOptions?.[0]?.size ?? "",
  );

  // Cuando cambia el color (variant), recalcula talla por defecto válida
  useEffect(() => {
    const first = sizeOptions?.[0]?.size ?? "";
    setSelectedSize(first);
    setQuantity(1);
    setImageIndex(0);
  }, [selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const cfgSelected = useMemo(() => {
    return sizeOptions.find((s) => s.size === selectedSize);
  }, [sizeOptions, selectedSize]);

  /* -------------------- IMÁGENES -------------------- */
  const [imageIndex, setImageIndex] = useState(0);
  const images = variant?.images ?? [];
  const image = images[imageIndex];
  const totalImages = images.length;

  const goPrev = () => {
    if (imageIndex > 0) {
      setTimeout(() => {
        setImageIndex((i) => i - 1);
      }, 120);
    }
  };

  const goNext = () => {
    if (imageIndex < totalImages - 1) {
      setTimeout(() => {
        setImageIndex((i) => i + 1);
      }, 120);
    }
  };

  /* -------------------- CANTIDAD -------------------- */
  const maxStock = cfgSelected?.stock ?? 0;
  const [quantity, setQuantity] = useState(1);

  // si cambia maxStock o selectedSize, asegurar cantidad válida
  useEffect(() => {
    if (quantity > maxStock && maxStock > 0) setQuantity(maxStock);
    if (maxStock === 0) setQuantity(1);
  }, [maxStock]); // eslint-disable-line react-hooks/exhaustive-deps

  const increment = () => setQuantity((q) => Math.min(q + 1, maxStock || 1));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  /* -------------------- AGREGAR AL CARRITO -------------------- */
  const handleAddToCart = () => {
    if (!cfgSelected) return; // no hay talla válida
    const storeId = String(cfgSelected.storeId);
    const price = Number(cfgSelected.price ?? 0);

    // id único estable
    const cartId = `${product.id}-${selectedColor}-${selectedSize}-${storeId}`;

    addToStore({
      id: cartId,
      productId: product.id,
      storeId,
      name: product.name,
      image: image,
      category: product.category,
      color: selectedColor,
      // si tu model ya trae colorHex, pásalo aquí (si no, omítelo)
      //colorHex: variant.colorHex,
      size: selectedSize,
      price,
      quantity,
      stock: maxStock,
    });

    navigation.goBack();
  };

  const disableAdd = !cfgSelected || !selectedSize || maxStock === 0;

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ================= COLORES + TALLA ================= */}
        <View style={styles.variantRow}>
          <View style={styles.colors}>
            {product.variants.map((v) => {
              const isSelected = v.color === selectedColor;

              return (
                <View
                  key={v.color}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: (v.color || "#ccc") as string,
                      borderColor: isSelected ? "#1DB954" : "#ddd",
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onTouchEnd={() => setSelectedColor(v.color)}
                />
              );
            })}
          </View>

          <View style={styles.sizeSelector}>
            <Menu
              visible={sizeMenuVisible}
              onDismiss={() => setSizeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setSizeMenuVisible(true)}
                  style={styles.selectButton}
                  contentStyle={{ justifyContent: "space-between" }}
                  icon="chevron-down"
                >
                  {selectedSize || "Seleccionar"}
                </Button>
              }
            >
              {sizeOptions.map((s) => (
                <Menu.Item
                  key={`${s.size}-${String(s.storeId)}`}
                  onPress={() => {
                    setSelectedSize(s.size);
                    setQuantity(1);
                    setSizeMenuVisible(false);
                  }}
                  title={`${s.size}   •   ${Number(s.price).toLocaleString()} pts`}
                />
              ))}
            </Menu>
          </View>
        </View>

        {/* ================= IMAGEN ================= */}
        <View style={styles.imageWrapper}>
          {totalImages > 1 && imageIndex > 0 && (
            <IconButton
              icon="chevron-left"
              size={28}
              onPress={goPrev}
              style={styles.arrowLeft}
            />
          )}

          <Image
            source={{
              uri: `http://192.168.10.16:3001/api/store/image/${encodeURIComponent(
                image,
              )}`,
            }}
            style={styles.image}
          />

          {totalImages > 1 && imageIndex < totalImages - 1 && (
            <IconButton
              icon="chevron-right"
              size={28}
              onPress={goNext}
              style={styles.arrowRight}
            />
          )}
        </View>

        {/* ================= INFO ================= */}
        <Text variant="headlineSmall" style={styles.title}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {Number(cfgSelected?.price ?? 0).toLocaleString()} pts
        </Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Divider style={{ marginVertical: 20 }} />

        {/* ================= PANEL PEDIDO ================= */}
        <Text variant="titleMedium">Cantidad</Text>
        <View style={styles.qtyRow}>
          <IconButton
            icon="minus"
            onPress={decrement}
            disabled={quantity <= 1}
          />
          <Text variant="titleLarge">{quantity}</Text>
          <IconButton
            icon="plus"
            onPress={increment}
            disabled={maxStock === 0 || quantity >= maxStock}
          />
        </View>

        {/* (Opcional) Info rápida */}
        {cfgSelected && (
          <Text style={{ opacity: 0.7, marginTop: 6 }}>
            Stock disponible: {maxStock} · Precio:{" "}
            {Number(cfgSelected.price ?? 0).toLocaleString()} pts
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleAddToCart}
          disabled={disableAdd}
          buttonColor="#1DB954"
          style={{ marginTop: 24, borderRadius: 12 }}
          contentStyle={{ paddingVertical: 6 }}
        >
          Agregar al carrito
        </Button>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  colors: { flexDirection: "row", flexWrap: "wrap" },
  sizeSelector: { flexDirection: "row", flexWrap: "wrap" },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    padding: 12,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    resizeMode: "contain",
    backgroundColor: "#f7f7f7",
  },
  arrowLeft: { position: "absolute", left: 0, top: "45%", zIndex: 2 },
  arrowRight: { position: "absolute", right: 0, top: "45%", zIndex: 2 },
  title: { fontWeight: "700", marginBottom: 4 },
  category: { color: "#666", marginBottom: 10 },
  description: { lineHeight: 20, color: "#444" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  sizeChip: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1DB954",
    marginTop: 4,
  },

  selectLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.6,
  },

  selectButton: {
    borderRadius: 10,
  },

  stockIndicator: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },
});
