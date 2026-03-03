import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Linking, View } from "react-native";
import { ActivityIndicator, Card, IconButton, Text } from "react-native-paper";

export default function FunFactsScreen() {
  const { getFunFacts } = useFetch();

  const [facts, setFacts] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = async (p = 1) => {
    const { success, list, hasMore } = await getFunFacts(p);

    if (success) {
      if (p === 1) {
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

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    if (index > 0 && index % 8 === 0) {
      return (
        <View>
          <AdBanner />
          <FactCard text={item} onShare={() => shareOnWhatsApp(item)} />
        </View>
      );
    }

    return <FactCard text={item} onShare={() => shareOnWhatsApp(item)} />;
  };

  const shareOnWhatsApp = async (text: string) => {
    const message = `⚽ Dato curioso:\n\n${text}\n\nDescubre más en MIMIS 🔥`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("WhatsApp no está instalado");
    }
  };

  return (
    <FlatList
      data={facts}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ margin: 20 }} /> : null
      }
      contentContainerStyle={{ padding: 12 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const FactCard = ({ text, onShare }: { text: string; onShare: () => void }) => (
  <Card
    style={{
      marginBottom: 16,
      borderRadius: 20,
      padding: 20,
      elevation: 3,
    }}
  >
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          fontWeight: "500",
          flex: 1,
        }}
      >
        ⚽ {text}
      </Text>

      <IconButton
        icon="whatsapp"
        iconColor="#25D366"
        size={22}
        onPress={onShare}
      />
    </View>
  </Card>
);
