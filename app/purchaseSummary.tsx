import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { typography } from "@/theme/typography";

type PurchaseSummaryRouteProp = RouteProp<
  RootStackParamList,
  "purchaseSummary"
>;

export default function PurchaseSummary() {
  const { getUserPoints } = useFetch();

  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUserPoints = async () => {
      setLoading(true);

      try {
        const { success, points } = await getUserPoints();

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
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ================= HEADER ================= */}

        <Text style={[g.titleLarge, styles.title]}>
          ✅ ¡Compra realizada con éxito!
        </Text>

        <Text style={[g.bodySecondary, styles.subtitle]}>
          Gracias por tu compra 🙌 Hemos recibido tu pedido y pronto estará en
          camino.
        </Text>

        {/* ================= LISTA DE PRODUCTOS ================= */}

        {products.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <Text style={g.subtitle}>{item.name}</Text>

            <Text style={g.bodySecondary}>
              Color: {item.color} · Talla: {item.size}
            </Text>

            <Text style={g.bodySecondary}>Cantidad: {item.quantity}</Text>

            <Text style={styles.price}>{item.price.toLocaleString()} pts</Text>
          </Card>
        ))}

        {/* ================= RESUMEN ================= */}

        <Card style={styles.summary}>
          <Text style={g.subtitle}>Resumen de puntos</Text>

          <Divider style={styles.divider} />

          <Text style={g.body}>
            Total gastado: {total.toLocaleString()} pts
          </Text>

          <Text style={g.body}>
            Puntos disponibles: {userPoints.toLocaleString()} pts
          </Text>

          <Divider style={styles.divider} />

          <Text
            style={[
              styles.remaining,
              {
                color: remainingPoints >= 0 ? colors.primary : colors.error,
              },
            ]}
          >
            Saldo restante: {remainingPoints.toLocaleString()} pts
          </Text>
        </Card>

        {/* ================= CTA ================= */}

        <Button
          mode="contained"
          onPress={() => navigation.navigate("store")}
          style={styles.button}
        >
          Volver a la tienda
        </Button>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  itemCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  price: {
    marginTop: spacing.xs,
    fontFamily: typography.subtitle.fontFamily,
    color: colors.textPrimary,
  },

  summary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  divider: {
    marginVertical: spacing.sm,
  },

  remaining: {
    fontSize: 16,
    fontFamily: typography.title.fontFamily,
  },

  button: {
    marginTop: spacing.xl,
    borderRadius: radius.md,
  },
});
