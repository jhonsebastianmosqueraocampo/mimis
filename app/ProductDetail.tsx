import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import { Image, ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Divider,
  Text
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type productDetailScreenRouteProp = RouteProp<RootStackParamList, "productDetail">;

export default function ProductDetailScreen() {
  const route = useRoute<productDetailScreenRouteProp>();
  const { product, pointsBalance, setPointsBalance } = route.params
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRedeem = () => {
    if (pointsBalance >= product.points) {
      setPointsBalance(pointsBalance - product.points);
      alert(`🎉 ¡Has redimido ${product.name}!`);
      navigation.goBack();
    } else {
      alert("⚠️ No tienes puntos suficientes.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* Header con back */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Detalle del Producto" />
      </Appbar.Header>

      <ScrollView>
        {/* Imagen principal */}
        <Image
          source={{ uri: product.image }}
          style={{ width: "100%", height: 250, resizeMode: "cover" }}
        />

        {/* Información del producto */}
        <Card style={{ margin: 10, borderRadius: 12 }}>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 6 }}>
              {product.name}
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
              {product.description}
            </Text>

            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", marginBottom: 10 }}
            >
              ⭐ {product.points.toLocaleString()} pts
            </Text>

            <Button
              mode="contained"
              onPress={handleRedeem}
              style={{ marginTop: 10 }}
            >
              Redimir ahora
            </Button>
          </Card.Content>
        </Card>

        {/* Información adicional */}
        {product.details && (
          <Card style={{ margin: 10, borderRadius: 12 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 6 }}>
                Detalles
              </Text>
              <Text variant="bodySmall">{product.details}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Productos relacionados */}
        <Card style={{ margin: 10, borderRadius: 12 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 6 }}>
              También te puede interesar
            </Text>
            <Divider style={{ marginBottom: 8 }} />
            {/* Aquí pondrías un scroll horizontal con otros productos */}
            <Text variant="bodySmall">• Otro producto 1</Text>
            <Text variant="bodySmall">• Otro producto 2</Text>
            <Text variant="bodySmall">• Otro producto 3</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}