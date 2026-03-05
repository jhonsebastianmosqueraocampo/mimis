import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { FunFact } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Linking, RefreshControl, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Text,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

export default function FunFactsScreen() {
  const { getFunFacts } = useFetch();

  const [facts, setFacts] = useState<FunFact[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const load = async (p = 1, reset = false) => {
    const { success, list, hasMore } = await getFunFacts(p);

    if (success) {
      if (p === 1 || reset) {
        setFacts(list);
      } else {
        setFacts((prev) => [...prev, ...list]);
      }

      setHasMore(hasMore);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await load(nextPage);
    setPage(nextPage);

    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);

    await load(1, true);

    setRefreshing(false);
  };

  /* =========================
     FILTRO FECHA
  ========================== */

  const filteredFacts = useMemo(() => {
    if (!selectedDate) return facts;

    return facts.filter(
      (fact) =>
        new Date(fact.createdAt).toDateString() ===
        new Date(selectedDate).toDateString(),
    );
  }, [facts, selectedDate]);

  /* =========================
     WHATSAPP SHARE
  ========================== */

  const shareOnWhatsApp = async (text: string) => {
    const message = `⚽ Dato curioso:\n\n${text}\n\nDescubre más en MIMIS 🔥`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) await Linking.openURL(url);
    else Alert.alert("WhatsApp no está instalado");
  };

  return (
    <PrivateLayout>
      <View style={sx({ px: 16, pt: 10 }) as any}>
        {/* FILTRO */}
        <View style={[sx({ row: true, mb: 14 }) as any]}>
          <Button
            mode={selectedDate === null ? "contained" : "outlined"}
            buttonColor={selectedDate === null ? colors.primary : undefined}
            onPress={() => setSelectedDate(null)}
            style={{ marginRight: 10 }}
          >
            Todos
          </Button>

          <Button
            mode="outlined"
            onPress={() => setSelectedDate(new Date().toISOString())}
          >
            Hoy
          </Button>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;

            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 100;

            if (isCloseToBottom) loadMore();
          }}
          scrollEventThrottle={400}
        >
          {filteredFacts.map((fact, index) => (
            <View key={index}>
              {index > 0 && index % 8 === 0 && <AdBanner />}

              <FactCard
                text={fact.text}
                date={fact.createdAt}
                onShare={() => shareOnWhatsApp(fact.text)}
              />
            </View>
          ))}

          {loadingMore && <ActivityIndicator style={{ marginVertical: 20 }} />}
        </ScrollView>
      </View>
    </PrivateLayout>
  );
}

/* =========================
   FACT CARD
========================== */

const FactCard = ({
  text,
  date,
  onShare,
}: {
  text: string;
  date: string;
  onShare: () => void;
}) => (
  <Card
    style={[
      shadows.sm,
      {
        marginBottom: 16,
        borderRadius: radius.lg,
        padding: 18,
        backgroundColor: colors.card,
      },
    ]}
  >
    <View
      style={[
        sx({ row: true }) as any,
        { justifyContent: "space-between", alignItems: "flex-start" },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={g.body}>⚽ {text}</Text>

        <Text
          style={[g.caption, { marginTop: 6, color: colors.textSecondary }]}
        >
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>

      <IconButton
        icon="whatsapp"
        iconColor="#25D366"
        size={22}
        onPress={onShare}
      />
    </View>
  </Card>
);
