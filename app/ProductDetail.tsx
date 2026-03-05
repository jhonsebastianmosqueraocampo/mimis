import { useStore } from "@/hooks/storeContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";
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

  useEffect(() => {
    const first = sizeOptions?.[0]?.size ?? "";
    setSelectedSize(first);
    setQuantity(1);
    setImageIndex(0);
  }, [selectedColor]);

  const cfgSelected = useMemo(() => {
    return sizeOptions.find((s) => s.size === selectedSize);
  }, [sizeOptions, selectedSize]);

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

  const maxStock = cfgSelected?.stock ?? 0;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quantity > maxStock && maxStock > 0) setQuantity(maxStock);
    if (maxStock === 0) setQuantity(1);
  }, [maxStock]);

  const increment = () => setQuantity((q) => Math.min(q + 1, maxStock || 1));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (!cfgSelected) return;

    const storeId = String(cfgSelected.storeId);
    const price = Number(cfgSelected.price ?? 0);

    const cartId = `${product.id}-${selectedColor}-${selectedSize}-${storeId}`;

    addToStore({
      id: cartId,
      productId: product.id,
      storeId,
      name: product.name,
      image: image,
      category: product.category,
      color: selectedColor,
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
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        {/* VARIANTES */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: spacing.lg,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {product.variants.map((v) => {
              const isSelected = v.color === selectedColor;

              return (
                <View
                  key={v.color}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    marginRight: spacing.sm,
                    backgroundColor: (v.color || "#ccc") as string,
                    borderColor: isSelected ? colors.primary : "#ddd",
                    borderWidth: isSelected ? 2 : 1,
                  }}
                  onTouchEnd={() => setSelectedColor(v.color)}
                />
              );
            })}
          </View>

          <Menu
            visible={sizeMenuVisible}
            onDismiss={() => setSizeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSizeMenuVisible(true)}
                style={{ borderRadius: radius.md }}
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
                title={`${s.size} • ${Number(s.price).toLocaleString()} pts`}
              />
            ))}
          </Menu>
        </View>

        {/* IMAGEN */}
        <View
          style={{
            position: "relative",
            alignItems: "center",
            marginBottom: spacing.xl,
            backgroundColor: colors.surfaceVariant,
            borderRadius: radius.lg,
            padding: spacing.md,
          }}
        >
          {totalImages > 1 && imageIndex > 0 && (
            <IconButton
              icon="chevron-left"
              size={28}
              onPress={goPrev}
              style={{
                position: "absolute",
                left: 0,
                top: "45%",
                zIndex: 2,
              }}
            />
          )}

          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 280,
              borderRadius: radius.lg,
              resizeMode: "contain",
              backgroundColor: colors.surfaceVariant,
            }}
          />

          {totalImages > 1 && imageIndex < totalImages - 1 && (
            <IconButton
              icon="chevron-right"
              size={28}
              onPress={goNext}
              style={{
                position: "absolute",
                right: 0,
                top: "45%",
                zIndex: 2,
              }}
            />
          )}
        </View>

        {/* INFO */}
        <Text
          variant="headlineSmall"
          style={{ fontWeight: "700", marginBottom: spacing.xs }}
        >
          {product.name}
        </Text>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.primary,
            marginTop: spacing.xs,
          }}
        >
          {Number(cfgSelected?.price ?? 0).toLocaleString()} pts
        </Text>

        <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
          {product.category}
        </Text>

        <Text style={{ lineHeight: 20, color: colors.text }}>
          {product.description}
        </Text>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* CANTIDAD */}
        <Text variant="titleMedium">Cantidad</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: spacing.md,
            backgroundColor: colors.surfaceVariant,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
          }}
        >
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

        {cfgSelected && (
          <Text
            style={{
              opacity: 0.7,
              marginTop: spacing.sm,
            }}
          >
            Stock disponible: {maxStock} · Precio:{" "}
            {Number(cfgSelected.price ?? 0).toLocaleString()} pts
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleAddToCart}
          disabled={disableAdd}
          buttonColor={colors.primary}
          style={{
            marginTop: spacing.xl,
            borderRadius: radius.lg,
          }}
          contentStyle={{ paddingVertical: spacing.xs }}
        >
          Agregar al carrito
        </Button>
      </ScrollView>
    </PrivateLayout>
  );
}
