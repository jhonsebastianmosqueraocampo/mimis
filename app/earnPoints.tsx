import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { RootStackParamList } from "@/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

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
        const { success, points } = await getUserPoints();

        if (!mounted) return;

        if (success) setUserPoints(points);
      } catch {
        return;
      }

      setLoading(false);
    };

    loadUserPoints();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRedeem = () => {
    navigation.navigate("store");
  };

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <View style={sx({ p: 20 }) as any}>
        <Text style={[g.title, { marginBottom: 8 }]}>Gana puntos</Text>

        <Text style={[g.small, { marginBottom: 20 }]}>
          Participa en actividades dentro de la app para ganar puntos y
          redimirlos por productos.
        </Text>

        {/* CARD PUNTOS */}
        <Card
          style={[
            shadows.md,
            {
              borderRadius: radius.lg,
              paddingVertical: 24,
              alignItems: "center",
              marginBottom: 30,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={g.caption}>Tus puntos actuales</Text>

          <Text
            style={[
              g.title,
              {
                fontSize: 42,
                marginTop: 6,
                color: colors.primary,
              },
            ]}
          >
            {userPoints}
          </Text>
        </Card>

        {/* INFO */}
        <View style={[sx({ center: true }) as any]}>
          <Text
            style={[
              g.small,
              {
                textAlign: "center",
                marginBottom: 12,
              },
            ]}
          >
            💡 Puedes redimir tus puntos por productos en la tienda de la app
          </Text>

          <Button
            mode="outlined"
            onPress={handleRedeem}
            style={{
              borderColor: colors.primary,
              borderRadius: radius.md,
            }}
            labelStyle={g.body}
          >
            Redimir puntos
          </Button>
        </View>
      </View>
    </PrivateLayout>
  );
}
