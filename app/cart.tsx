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
import { Image, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
  Text,
} from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

const isAddressValid = (a: AddressForm) => {
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

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { productsStore, updateProduct, deleteProduct, calculateTotal } =
    useStore();

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
        const { success, points } = await getUserPoints();
        if (!mounted) return;

        if (success) setUserPoints(points);
      } catch (err) {
        console.error("Error cargando puntos", err);
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
  }, [productsStore, remainingPoints, addressForm]);

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

      navigation.navigate("purchaseSummary", {
        products: productsStore,
      } as any);

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
    return <Loading visible={loading} />;
  }

  if (productsStore.length === 0) {
    return (
      <PrivateLayout>
        <View style={sx({ flex: 1, center: true, p: 20 })}>
          <Text style={g.title}>🛒 Tu carrito está vacío</Text>

          <Text style={[g.body, sx({ mt: 10 }) as any]}>
            Explora la tienda y canjea tus puntos
          </Text>

          <Button
            mode="contained"
            buttonColor={colors.primary}
            style={sx({ mt: 16 }) as any}
            onPress={() => navigation.navigate("store")}
          >
            Ir a la tienda
          </Button>
        </View>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView
        style={sx({ flex: 1, bg: colors.background })}
        contentContainerStyle={sx({ p: 16, pb: 40 })}
      >
        <Text style={[g.title, sx({ mb: 16 }) as any]}>
          🛒 Mi carrito ({productsStore.length})
        </Text>

        {productsStore.map((item) => {
          const outOfStock =
            typeof item.stock === "number" ? item.stock <= 0 : false;

          const overStock =
            typeof item.stock === "number" ? item.quantity > item.stock : false;

          return (
            <Card
              key={item.id}
              style={[sx({ mb: 12 }) as any, { borderRadius: radius.lg }]}
            >
              <View style={sx({ row: true, p: 10 })}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: radius.md,
                      marginRight: 12,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: radius.md,
                      marginRight: 12,
                      backgroundColor: colors.border,
                    }}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={g.subtitle}>{item.name}</Text>

                  <Text style={[g.small, { opacity: 0.8 }]}>
                    {item.color} · {item.size}
                  </Text>

                  <Text style={[g.body, sx({ mt: 4 }) as any]}>
                    Precio{" "}
                    <Text style={{ fontWeight: "700" }}>
                      {item.price.toLocaleString()} pts
                    </Text>
                  </Text>

                  {(outOfStock || overStock) && (
                    <Text
                      style={[g.small, { color: colors.error, marginTop: 6 }]}
                    >
                      {outOfStock
                        ? "Sin stock."
                        : `Stock disponible: ${item.stock}`}
                    </Text>
                  )}

                  <View style={sx({ row: true, center: true, mt: 6 })}>
                    <IconButton
                      icon="minus"
                      size={18}
                      onPress={() => handleDecrease(item)}
                    />

                    <Text style={g.subtitle}>{item.quantity}</Text>

                    <IconButton
                      icon="plus"
                      size={18}
                      onPress={() => handleIncrease(item)}
                    />

                    <IconButton
                      icon="delete"
                      iconColor={colors.error}
                      onPress={() => deleteProduct(item.id)}
                    />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        <Card
          style={[sx({ mt: 14, p: 12 }) as any, { borderRadius: radius.lg }]}
        >
          <Text style={g.subtitle}>📍 Dirección de entrega</Text>

          {addressForm ? (
            <>
              <Text style={[g.body, sx({ mt: 6 }) as any]}>
                {addressString}
              </Text>

              <Button mode="text" onPress={() => setAddressModal(true)}>
                Editar dirección
              </Button>
            </>
          ) : (
            <>
              <Text style={[g.body, sx({ mt: 6 }) as any]}>
                Agrega una dirección clara para evitar confusiones.
              </Text>

              <Button
                mode="contained"
                buttonColor={colors.primary}
                style={sx({ mt: 10 }) as any}
                onPress={() => setAddressModal(true)}
              >
                Agregar dirección
              </Button>
            </>
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

        <Card
          style={[
            sx({ mt: 16, p: 12 }) as any,
            {
              borderRadius: radius.lg,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={g.subtitle}>🚚 Entrega estimada</Text>
          <Text style={g.body}>Entre 7 y 10 días hábiles</Text>
        </Card>

        <Card
          style={[sx({ mt: 16, p: 12 }) as any, { borderRadius: radius.lg }]}
        >
          <Text style={g.body}>Subtotal: {subtotal.toLocaleString()} pts</Text>

          <Text style={g.body}>
            Puntos disponibles: {userPoints.toLocaleString()} pts
          </Text>

          <Divider style={{ marginVertical: 8 }} />

          <Text
            style={[
              g.subtitle,
              {
                color: remainingPoints >= 0 ? colors.success : colors.error,
              },
            ]}
          >
            Saldo restante: {remainingPoints.toLocaleString()} pts
          </Text>
        </Card>

        <Button
          mode="contained"
          buttonColor={colors.primary}
          disabled={!canBuy || buying}
          style={sx({ mt: 16 }) as any}
          contentStyle={{ height: 48 }}
          onPress={handlePurchase}
        >
          {buying ? "Procesando..." : "Realizar compra"}
        </Button>

        {buying && (
          <View style={sx({ mt: 12, center: true })}>
            <ActivityIndicator />

            <Text style={[g.small, sx({ mt: 6 }) as any]}>
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
