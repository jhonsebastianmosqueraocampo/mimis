import { Product, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Auriculares Bluetooth",
    image: "https://falabella.scene7.com/is/image/FalabellaCO/12345678",
    category: "Tecnología",
    points: 2500,
    description: "Auriculares inalámbricos con cancelación de ruido.",
  },
  {
    id: 2,
    name: "Cafetera Espresso",
    image: "https://falabella.scene7.com/is/image/FalabellaCO/87654321",
    category: "Hogar",
    points: 4000,
    description: "Cafetera automática con espumador de leche.",
  },
  {
    id: 3,
    name: "Bono de Compras $100.000",
    image: "https://falabella.scene7.com/is/image/FalabellaCO/11223344",
    category: "Bonos",
    points: 10000,
    description: "Canjea este bono y úsalo en tiendas físicas y online.",
  },
];

export default function StoreScreen() {
  const theme = useTheme();
  const [category, setCategory] = useState<string>("Todos");
  const [pointsBalance, setPointsBalance] = useState<number>(12500);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const categories = ["Todos", "Tecnología", "Hogar", "Bonos"];

  const filtered =
    category === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === category);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* Header con puntos */}
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content
          title="Tienda de Puntos"
          subtitle="Canjea tus productos favoritos"
          titleStyle={{ color: "white" }}
          subtitleStyle={{ color: "white" }}
        />
        <Chip style={{ backgroundColor: "white", marginRight: 10 }}>
          <Text style={{ color: theme.colors.primary }}>
            ⭐ {pointsBalance.toLocaleString()} pts
          </Text>
        </Chip>
      </Appbar.Header>

      {/* CTA para obtener más puntos */}
      <Card
        style={{
          margin: 10,
          borderRadius: 12,
          backgroundColor: theme.colors.secondaryContainer,
        }}
      >
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 6 }}>
            ¿Quieres más puntos?
          </Text>
          <Text variant="bodySmall" style={{ marginBottom: 10 }}>
            Mira videos publicitarios y gana puntos adicionales.
          </Text>
          <Button
            mode="contained-tonal"
            onPress={() => alert("Abrir módulo de videos publicitarios")}
          >
            🎥 Presiona aquí para obtener más puntos
          </Button>
        </Card.Content>
      </Card>

      {/* Categorías */}
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

      {/* Lista de productos */}
      <ScrollView style={{ padding: 10 }}>
        {filtered.map((product) => (
          <Card
            key={product.id}
            style={{ marginBottom: 16 }}
            onPress={() =>
              navigation.navigate("productDetail", {
                product,
                pointsBalance,
                setPointsBalance,
              })
            }
          >
            <Card.Cover source={{ uri: product.image }} />
            <Card.Content style={{ marginTop: 10 }}>
              <Text variant="titleMedium">{product.name}</Text>
              <Text variant="bodySmall" style={{ marginBottom: 6 }}>
                {product.description}
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                ⭐ {product.points.toLocaleString()} pts
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => {
                  if (pointsBalance >= product.points) {
                    setPointsBalance(pointsBalance - product.points);
                    alert(`¡Redimiste ${product.name}!`);
                  } else {
                    alert("No tienes puntos suficientes.");
                  }
                }}
              >
                Redimir
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
