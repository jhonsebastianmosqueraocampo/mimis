import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { Purchase, RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function PurchaseHistory() {
  const { ordersHistory } = useFetch();
  const theme = useTheme();
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
        return "#F4B400";
      case "confirmed":
        return "#4285F4";
      case "in_transit":
        return "#9C27B0";
      case "delivered":
        return "#1DB954";
      case "cancelled":
        return theme.colors.error;
      default:
        return "#999";
    }
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando compras"
        subtitle="Un momento por favor"
      />
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.title}>
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
                  filter === s ? getStatusColor(s) + "22" : "#f1f1f1",
              }}
            >
              {s.replace("_", " ")}
            </Chip>
          ))}
        </View>

        {filteredPurchases.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="titleMedium">No hay resultados</Text>
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
                    fontWeight: "600",
                  }}
                >
                  {purchase.status?.replace("_", " ")}
                </Chip>
              </View>

              <Text style={styles.date}>
                {new Date(purchase.date).toLocaleDateString()}
              </Text>

              <Divider style={{ marginVertical: 10 }} />

              {purchase.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                  <View style={styles.itemDetailRow}>
                    {/* Círculo de color */}
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

              <Divider style={{ marginVertical: 10 }} />

              <Text style={styles.total}>
                Total: {purchase.totalPoints.toLocaleString()} pts
              </Text>
            </Card>
          ))
        )}

        <Button
          mode="contained"
          style={{ marginTop: 20 }}
          onPress={() => navigation.navigate("store" as never)}
        >
          Seguir comprando
        </Button>
      </ScrollView>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontWeight: "700", marginBottom: 12 },

  searchInput: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },

  card: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontWeight: "700",
    fontSize: 15,
  },

  date: {
    color: "#777",
    fontSize: 13,
    marginTop: 4,
  },

  itemRow: {
    marginBottom: 8,
  },

  itemDetail: {
    color: "#666",
    fontSize: 13,
  },

  price: {
    fontWeight: "600",
    marginTop: 2,
  },

  total: {
    textAlign: "right",
    fontWeight: "700",
    fontSize: 15,
  },

  empty: {
    marginTop: 40,
    alignItems: "center",
  },
  itemDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  itemDetailText: {
    color: "#666",
    fontSize: 13,
  },
});
