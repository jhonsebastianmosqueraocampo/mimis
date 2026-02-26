import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

export default function EarnPoints() {
  const { getUserPoints } = useFetch();
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  const handleStart = () => {
    console.log("Iniciar actividades para ganar puntos");
  };

  const handleRedeem = () => {
    navigation.navigate("store");
  };

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando paises"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <PrivateLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Gana puntos</Text>
        <Text style={styles.subtitle}></Text>

        <Card style={styles.card}>
          <Text style={styles.pointsLabel}>Tus puntos actuales</Text>
          <Text style={styles.pointsValue}>{userPoints}</Text>
        </Card>

        <View style={styles.redeemSection}>
          <Text style={styles.redeemText}>
            💡 Puedes redimir tus puntos por productos en la tienda de la app
          </Text>

          <Button
            mode="outlined"
            onPress={handleRedeem}
            style={styles.buttonSecondary}
            labelStyle={{ fontSize: 16 }}
          >
            Redimir puntos
          </Button>
        </View>
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1DB954",
  },
  buttonPrimary: {
    backgroundColor: "#1DB954",
    marginBottom: 24,
    borderRadius: 8,
    paddingVertical: 4,
  },
  redeemSection: {
    alignItems: "center",
  },
  redeemText: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 18,
  },
  buttonSecondary: {
    borderColor: "#1DB954",
    borderRadius: 8,
  },
});
