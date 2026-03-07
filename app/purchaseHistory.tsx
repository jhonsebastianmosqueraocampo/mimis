import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { Purchase, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { typography } from "@/theme/typography";

export default function PurchaseHistory() {
  const { ordersHistory } = useFetch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { success, purchases } = await ordersHistory();
      if (success) {
        setPurchases(purchases || []);
      }
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter ? p.status === filter : true;
      return matchesSearch && matchesFilter;
    });
  }, [purchases, search, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "confirmed":
        return colors.info;
      case "in_transit":
        return colors.secondary;
      case "delivered":
        return colors.success;
      case "cancelled":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[g.titleLarge, styles.title]}>
          🧾 Historial de compras
        </Text>

        {/* 🎯 Filtros */}
        <View style={styles.filterRow}>
          {["pending", "confirmed", "in_transit", "delivered"].map((s) => (
            <Chip
              key={s}
              selected={filter === s}
              onPress={() => setFilter(filter === s ? null : s)}
              style={{
                backgroundColor:
                  filter === s
                    ? getStatusColor(s) + "22"
                    : colors.surfaceVariant,
              }}
              textStyle={{
                color: filter === s ? getStatusColor(s) : colors.textSecondary,
                fontFamily: typography.body.fontFamily,
              }}
            >
              {s.replace("_", " ")}
            </Chip>
          ))}
        </View>

        {filteredPurchases.length === 0 ? (
          <View style={styles.empty}>
            <Text style={g.subtitle}>No hay resultados</Text>
          </View>
        ) : (
          filteredPurchases.map((purchase) => (
            <Card key={purchase.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.orderId}>
                  #{purchase.id.slice(-6).toUpperCase()}
                </Text>

                <Chip
                  style={{
                    backgroundColor:
                      getStatusColor(purchase.status ?? "") + "22",
                  }}
                  textStyle={{
                    color: getStatusColor(purchase.status ?? ""),
                    fontFamily: typography.subtitle.fontFamily,
                  }}
                >
                  {purchase.status?.replace("_", " ")}
                </Chip>
              </View>

              <Text style={styles.date}>
                {new Date(purchase.date).toLocaleDateString()}
              </Text>

              <Divider style={styles.divider} />

              {purchase.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>

                  <View style={styles.itemDetailRow}>
                    <View
                      style={[styles.colorDot, { backgroundColor: item.color }]}
                    />

                    <Text style={styles.itemDetailText}>
                      Talla {item.size} · x{item.quantity}
                    </Text>
                  </View>

                  <Text style={styles.price}>
                    {(item.price * item.quantity).toLocaleString()} pts
                  </Text>
                </View>
              ))}

              <Divider style={styles.divider} />

              <Text style={styles.total}>
                Total: {purchase.totalPoints.toLocaleString()} pts
              </Text>
            </Card>
          ))
        )}

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate("store" as never)}
        >
          Seguir comprando
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
    marginBottom: spacing.md,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  card: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    ...typography.subtitle,
  },

  date: {
    ...typography.small,
    marginTop: spacing.xs,
  },

  divider: {
    marginVertical: spacing.sm,
  },

  itemRow: {
    marginBottom: spacing.sm,
  },

  itemName: {
    fontFamily: typography.subtitle.fontFamily,
    color: colors.textPrimary,
  },

  price: {
    fontFamily: typography.subtitle.fontFamily,
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },

  total: {
    textAlign: "right",
    ...typography.subtitle,
  },

  empty: {
    marginTop: spacing.xl,
    alignItems: "center",
  },

  itemDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  colorDot: {
    width: 14,
    height: 14,
    borderRadius: radius.round,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  itemDetailText: {
    ...typography.small,
  },

  button: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
  },
});
