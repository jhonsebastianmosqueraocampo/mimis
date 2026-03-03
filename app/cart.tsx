import { AddressModal } from "@/components/AddressModal";
import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { useStore } from "@/hooks/storeContext";
import {
  AddressForm,
  CreateOrderPayload,
  ProductStore,
  RootStackParamList,
} from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

const isAddressValid = (a: AddressForm) => {
  // básico y claro (ajústalo)
  return (
    a.recipientName.trim().length >= 2 &&
    a.phone.trim().length >= 7 &&
    a.city.trim().length >= 2 &&
    a.neighborhood.trim().length >= 2 &&
    a.streetNumber.trim().length >= 1 &&
    a.streetNumber2.trim().length >= 1
  );
};

const formatAddress = (a: AddressForm) => {
  const line1 = `${a.streetType} ${a.streetNumber} # ${a.streetNumber2}`;
  const line2 = [a.complement, a.neighborhood, a.city]
    .filter(Boolean)
    .join(", ");

  const phone = a.phone ? `Tel: ${a.phone}` : "";
  const refs = a.references ? `Ref: ${a.references}` : "";
  const map = a.mapsUrl ? `Mapa: ${a.mapsUrl}` : "";

  return [line1, line2, phone, refs, map].filter(Boolean).join(" · ");
};

export default function Cart() {
  const { createOrderUser, getUserPoints } = useFetch();
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { productsStore, updateProduct, deleteProduct, calculateTotal } =
    useStore();

  /* 🔹 Compra */
  const [addressForm, setAddressForm] = useState<AddressForm | null>(null);
  const [addressModal, setAddressModal] = useState(false);

  const [buying, setBuying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
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

  const subtotal = useMemo(() => calculateTotal(), [productsStore]);
  const remainingPoints = userPoints - subtotal;

  // 🔸 Validaciones de UI: no permitir qty > stock
  const clampQty = (item: ProductStore, nextQty: number) => {
    const max = typeof item.stock === "number" ? item.stock : Infinity;
    return Math.max(1, Math.min(nextQty, max));
  };

  const handleIncrease = (item: ProductStore) => {
    const nextQty = clampQty(item, item.quantity + 1);
    if (nextQty === item.quantity) return;
    updateProduct({ ...item, quantity: nextQty });
  };

  const handleDecrease = (item: ProductStore) => {
    const nextQty = clampQty(item, item.quantity - 1);
    if (nextQty === item.quantity) return;
    updateProduct({ ...item, quantity: nextQty });
  };

  const addressString = useMemo(() => {
    if (!addressForm) return "";
    return formatAddress(addressForm);
  }, [addressForm]);

  const canBuy = useMemo(() => {
    if (productsStore.length === 0) return false;
    if (remainingPoints < 0) return false;

    // si alguno supera stock o stock=0 => no comprar
    for (const it of productsStore) {
      if (typeof it.stock === "number") {
        if (it.stock <= 0) return false;
        if (it.quantity > it.stock) return false;
      }
      if (!it.storeId || !it.productId || !it.size || !it.color) return false;
      if (!Number.isFinite(it.price) || it.price <= 0) return false;
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) return false;
      if (!addressForm || !isAddressValid(addressForm)) return false;
    }
    return true;
  }, [productsStore, remainingPoints]);

  // 🔸 Agrupar items por storeId => orders[]
  const buildOrdersPayload = (): CreateOrderPayload => {
    const byStore = new Map<string, ProductStore[]>();
    for (const it of productsStore) {
      const key = String(it.storeId);
      byStore.set(key, [...(byStore.get(key) ?? []), it]);
    }

    const orders = Array.from(byStore.entries()).map(([storeId, items]) => ({
      storeId,
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        color: it.color,
        colorHex: (it as any).colorHex, // opcional
        size: it.size,
        price: it.price,
        quantity: it.quantity,
      })),
    }));

    return { address: addressString, orders };
  };

  const handlePurchase = async () => {
    if (!canBuy) {
      setToast("Revisa stock, puntos y datos del carrito.");
      return;
    }

    try {
      setBuying(true);

      const payload = buildOrdersPayload();
      const { success, message } = await createOrderUser(payload);

      if (!success) {
        throw new Error(message || "No fue posible crear la orden.");
      }

      // Navega al resumen (usa lo que tengas en tu pantalla)
      navigation.navigate("purchaseSummary", {
        products: productsStore,
      } as any);

      // Limpia carrito y descuenta puntos (mock)
      setUserPoints((p) => p - subtotal);
      productsStore.forEach((p) => deleteProduct(p.id));

      setToast("Compra realizada ✅");
    } catch (e: any) {
      setToast(e?.message || "No fue posible realizar la compra.");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  /* ================= EMPTY STATE ================= */
  if (productsStore.length === 0) {
    return (
      <PrivateLayout>
        <View style={styles.empty}>
          <Text variant="titleLarge">🛒 Tu carrito está vacío</Text>
          <Text style={{ marginVertical: 10 }}>
            Explora la tienda y canjea tus puntos
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate("store")}>
            Ir a la tienda
          </Button>
        </View>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          🛒 Mi carrito ({productsStore.length})
        </Text>
        {/* ================= LISTA DE PRODUCTOS ================= */}
        {productsStore.map((item) => {
          const outOfStock =
            typeof item.stock === "number" ? item.stock <= 0 : false;
          const overStock =
            typeof item.stock === "number" ? item.quantity > item.stock : false;

          return (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                {/* Imagen REAL */}
                {item.image ? (
                  <Image
                    source={{
                      uri: item.image ?? "",
                    }}
                    style={styles.image}
                  />
                ) : (
                  <View style={[styles.image, styles.imageFallback]} />
                )}

                {/* Info */}
                <View style={styles.info}>
                  <Text variant="titleMedium">{item.name}</Text>

                  <Text style={{ opacity: 0.8 }}>
                    {item.color} · {item.size}
                  </Text>

                  <Text style={{ marginTop: 4 }}>
                    Precio:{" "}
                    <Text style={{ fontWeight: "700" }}>
                      {item.price.toLocaleString()} pts
                    </Text>
                  </Text>

                  {/* Alertas stock */}
                  {(outOfStock || overStock) && (
                    <Text style={{ color: theme.colors.error, marginTop: 6 }}>
                      {outOfStock
                        ? "Sin stock."
                        : `Stock disponible: ${item.stock}. Ajusta cantidad.`}
                    </Text>
                  )}

                  {/* Cantidad */}
                  <View style={styles.qtyRow}>
                    <IconButton
                      icon="minus"
                      size={18}
                      onPress={() => handleDecrease(item)}
                      disabled={buying}
                    />
                    <Text variant="titleMedium">{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      size={18}
                      onPress={() => handleIncrease(item)}
                      disabled={
                        buying ||
                        (typeof item.stock === "number" &&
                          item.quantity >= item.stock)
                      }
                    />
                    <IconButton
                      icon="delete"
                      iconColor={theme.colors.error}
                      onPress={() => deleteProduct(item.id)}
                      disabled={buying}
                    />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}
        {/* // DIRECCION */}
        <Card style={{ marginTop: 14, padding: 12 }}>
          <Text variant="titleMedium">📍 Dirección de entrega</Text>

          {addressForm ? (
            <View>
              <Text style={{ marginTop: 6, opacity: 0.8 }}>
                {addressString}
              </Text>
              <Button mode="text" onPress={() => setAddressModal(true)}>
                Editar dirección
              </Button>
            </View>
          ) : (
            <View>
              <Text style={{ marginTop: 6, opacity: 0.7 }}>
                Agrega una dirección clara para evitar confusiones.
              </Text>
              <Button
                mode="contained"
                onPress={() => setAddressModal(true)}
                style={{ marginTop: 10 }}
              >
                Agregar dirección
              </Button>
            </View>
          )}
        </Card>
        <AddressModal
          visible={addressModal}
          initial={addressForm ?? undefined}
          onClose={() => setAddressModal(false)}
          onSave={(addr) => {
            setAddressForm(addr);
            setAddressModal(false);
            setToast("Dirección guardada ✅");
          }}
        />
        {/* ================= ENTREGA ================= */}
        <Card style={styles.delivery}>
          <Text variant="titleMedium">🚚 Entrega estimada</Text>
          <Text>Entre 7 y 10 días hábiles</Text>
        </Card>
        {/* ================= RESUMEN ================= */}
        <Card style={styles.summary}>
          <Text>Subtotal: {subtotal.toLocaleString()} pts</Text>
          <Text>Puntos disponibles: {userPoints.toLocaleString()} pts</Text>
          <Divider style={{ marginVertical: 8 }} />
          <Text
            style={{
              fontWeight: "700",
              color: remainingPoints >= 0 ? "#1DB954" : theme.colors.error,
            }}
          >
            Saldo restante: {remainingPoints.toLocaleString()} pts
          </Text>
        </Card>
        {/* ================= CTA ================= */}
        <Button
          mode="contained"
          onPress={handlePurchase}
          disabled={!canBuy || buying}
          style={{ marginTop: 16 }}
          contentStyle={{ height: 48 }}
        >
          {buying ? "Procesando..." : "Realizar compra"}
        </Button>
        {buying && (
          <View style={{ marginTop: 12, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 6, opacity: 0.7 }}>
              Validando stock y creando órdenes...
            </Text>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast(null)}
        duration={2500}
      >
        {toast}
      </Snackbar>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  itemCard: {
    marginBottom: 12,
    padding: 10,
  },
  itemRow: {
    flexDirection: "row",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  imageFallback: {
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  delivery: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  summary: {
    marginTop: 16,
    padding: 12,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
