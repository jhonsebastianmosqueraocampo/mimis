import { colors } from "@/theme/colors";
import { Product, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import { useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Menu, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedColor, setSelectedColor] = useState(product.variants[0].color);
  const [imageIndex, setImageIndex] = useState(0);

  const variant = useMemo(
    () => product.variants.find((v) => v.color === selectedColor)!,
    [selectedColor, product.variants],
  );

  const [selectedSize, setSelectedSize] = useState(variant.storeConfigs[0]);

  const [menuVisible, setMenuVisible] = useState(false);

  useMemo(() => {
    const first = variant.storeConfigs[0];
    setSelectedSize(first);
  }, [variant]);

  const image = variant.images[imageIndex];
  const totalImages = variant.images.length;

  return (
    <Card style={styles.card} mode="elevated">
      {/* IMAGE SECTION */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: image,
          }}
          style={styles.image}
        />

        {/* Arrows */}
        {imageIndex > 0 && (
          <IconButton
            icon="chevron-left"
            size={20}
            onPress={() => setImageIndex((i) => i - 1)}
            style={[styles.arrow, { left: 8 }]}
          />
        )}
        {imageIndex < totalImages - 1 && (
          <IconButton
            icon="chevron-right"
            size={20}
            onPress={() => setImageIndex((i) => i + 1)}
            style={[styles.arrow, { right: 8 }]}
          />
        )}

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {variant.images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: i === imageIndex ? 1 : 0.3,
                  width: i === imageIndex ? 12 : 6,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <Card.Content style={{ paddingTop: 10 }}>
        {/* Product Name */}
        <Text variant="titleMedium" style={styles.title}>
          {product.name}
        </Text>

        {/* Price */}
        <Text style={styles.price}>
          ${selectedSize.price.toLocaleString("es-CO")}
        </Text>

        {/* Color Selector */}
        <View style={styles.colorSelector}>
          {product.variants.map((v) => (
            <View
              key={v.color}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: (v.color || "#ccc") as string,
                  borderWidth: v.color === selectedColor ? 2 : 0,
                  borderColor: colors.primary,
                },
              ]}
              onTouchEnd={() => {
                setSelectedColor(v.color);
                setImageIndex(0);
              }}
            />
          ))}
        </View>

        {/* Sizes + Stock */}
        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Talla</Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.selectButton}
              >
                {selectedSize.size}
              </Button>
            }
          >
            {variant.storeConfigs.map((cfg) => (
              <Menu.Item
                key={`${cfg.size}-${cfg.storeId}`}
                onPress={() => {
                  setSelectedSize(cfg);
                  setMenuVisible(false);
                }}
                title={`${cfg.size}  -  $${cfg.price.toLocaleString("es-CO")}`}
                disabled={cfg.stock === 0}
              />
            ))}
          </Menu>

          <Text
            style={[
              styles.stockIndicator,
              {
                color: selectedSize.stock === 0 ? colors.text : colors.success,
              },
            ]}
          >
            {selectedSize.stock === 0
              ? "Agotado"
              : `${selectedSize.stock} disponibles`}
          </Text>
        </View>
      </Card.Content>

      <Card.Actions style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Button
          mode="contained"
          buttonColor={colors.primary}
          style={{ flex: 1, borderRadius: 10 }}
          onPress={() => navigation.navigate("productDetail", { product })}
        >
          Ver detalle
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
  },

  imageContainer: {
    height: 190,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  image: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },

  arrow: {
    position: "absolute",
    top: "40%",
    backgroundColor: "rgba(255,255,255,0.8)",
  },

  dotsContainer: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    gap: 6,
  },

  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
  },

  title: {
    textAlign: "center",
    fontWeight: "600",
  },

  price: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },

  colorSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 10,
  },

  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },

  sizeGrid: {
    marginTop: 14,
    gap: 6,
  },

  sizeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stockChip: {
    height: 22,
  },

  sizeBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sizeText: {
    fontWeight: "600",
    fontSize: 13,
  },

  stockText: {
    fontSize: 12,
    fontWeight: "500",
  },

  selectContainer: {
    marginTop: 16,
    alignItems: "center",
  },

  selectLabel: {
    fontSize: 12,
    marginBottom: 6,
    opacity: 0.6,
  },

  selectButton: {
    width: 120,
    borderRadius: 10,
  },

  stockIndicator: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },
});
