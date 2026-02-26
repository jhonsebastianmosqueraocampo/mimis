import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Divider, Text, useTheme } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

type PurchaseSummaryRouteProp = RouteProp<
  RootStackParamList,
  "purchaseSummary"
>;

export default function PurchaseSummary() {
  const { getUserPoints } = useFetch();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadUserPoints = async () => {
      setLoading(true);
      try {
        const { success, points, message } = await getUserPoints();
        if (!mounted) return;
        if (success) {
          setUserPoints(points);
        }
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
      }
      setLoading(false);
    };

    loadUserPoints();

    return () => {
      mounted = false;
    };
  }, []);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PurchaseSummaryRouteProp>();

  const { products } = route.params;

  const total = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  const remainingPoints = userPoints - total;

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ================= HEADER ================= */}
        <Text variant="titleLarge" style={styles.title}>
          ✅ ¡Compra realizada con éxito!
        </Text>
        <Text style={styles.subtitle}>
          Gracias por tu compra 🙌 Hemos recibido tu pedido y pronto estará en
          camino.
        </Text>

        {/* ================= LISTA DE PRODUCTOS ================= */}
        {products.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text>
              Color: {item.color} · Talla: {item.size}
            </Text>
            <Text>Cantidad: {item.quantity}</Text>
            <Text style={styles.price}>{item.price.toLocaleString()} pts</Text>
          </Card>
        ))}

        {/* ================= RESUMEN ================= */}
        <Card style={styles.summary}>
          <Text variant="titleMedium">Resumen de puntos</Text>
          <Divider style={{ marginVertical: 8 }} />

          <Text>Total gastado: {total.toLocaleString()} pts</Text>
          <Text>Puntos disponibles: {userPoints.toLocaleString()} pts</Text>

          <Divider style={{ marginVertical: 8 }} />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color:
                remainingPoints >= 0
                  ? theme.colors.primary
                  : theme.colors.error,
            }}
          >
            Saldo restante: {remainingPoints.toLocaleString()} pts
          </Text>
        </Card>

        {/* ================= CTA ================= */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate("store")}
          style={{ marginTop: 24 }}
        >
          Volver a la tienda
        </Button>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  itemCard: {
    marginBottom: 12,
    padding: 12,
  },
  price: {
    marginTop: 6,
    fontWeight: "600",
  },
  summary: {
    marginTop: 20,
    padding: 14,
  },
});
