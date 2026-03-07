import Loading from "@/components/Loading";
import OneByOneDetail from "@/components/OneByOneDetail";
import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { OneByOneType } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";
import { Button, Chip, Text, TextInput } from "react-native-paper";
import PrivateLayout from "./privateLayout";

const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function OneByOne() {
  const { getOneByOne } = useFetch();

  const [list, setList] = useState<OneByOneType[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"recent" | "old">("recent");
  const [selected, setSelected] = useState<OneByOneType | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { success, oneByOneList } = await getOneByOne();
      if (success) setList(oneByOneList);
      setLoading(false);
    };
    load();
  }, []);

  const processed = useMemo(() => {
    let arr = [...list];

    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (o) =>
          o.teams.home.name.toLowerCase().includes(s) ||
          o.teams.away.name.toLowerCase().includes(s),
      );
    }

    if (order === "recent") {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return arr;
  }, [list, search, order]);

  const sections = useMemo(() => {
    const map = new Map<string, OneByOneType[]>();

    processed.forEach((o) => {
      const key = formatDateLabel(o.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });

    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [processed]);

  const renderItem = (item: OneByOneType) => {
    const avg = item.playerRatings?.length
      ? item.playerRatings.reduce((a, b) => a + b.rating, 0) /
        item.playerRatings.length
      : 0;

    return (
      <View key={item.id} style={{ marginBottom: spacing.md }}>
        <View style={[g.card, { padding: spacing.md }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* HOME */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Image
                source={{ uri: item.teams.home.logo }}
                style={{ width: 46, height: 46, resizeMode: "contain" }}
              />

              <Text
                numberOfLines={1}
                style={{ marginTop: 4, fontSize: 12, textAlign: "center" }}
              >
                {item.teams.home.name}
              </Text>

              <Text style={{ fontWeight: "700", marginTop: 2 }}>
                {item.result.home}
              </Text>
            </View>

            {/* AVG */}
            <View style={{ width: 80, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {avg.toFixed(1)}
              </Text>

              <Text style={{ fontSize: 11, opacity: 0.6 }}>rating</Text>
            </View>

            {/* AWAY */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Image
                source={{ uri: item.teams.away.logo }}
                style={{ width: 46, height: 46, resizeMode: "contain" }}
              />

              <Text
                numberOfLines={1}
                style={{ marginTop: 4, fontSize: 12, textAlign: "center" }}
              >
                {item.teams.away.name}
              </Text>

              <Text style={{ fontWeight: "700", marginTop: 2 }}>
                {item.result.away}
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            style={{ marginTop: spacing.sm }}
            buttonColor={colors.primary}
            onPress={() => setSelected(item)}
          >
            Ver análisis
          </Button>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <View style={{ flex: 1, padding: spacing.md }}>
        <Text style={[g.title, { marginBottom: spacing.sm }]}>
          Análisis Uno por Uno
        </Text>

        {/* SEARCH */}

        <TextInput
          mode="outlined"
          placeholder="Buscar por equipo"
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon="magnify" />}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          style={{ marginBottom: spacing.sm }}
        />

        {/* ORDER */}

        <View style={{ flexDirection: "row", marginBottom: spacing.md }}>
          <Chip
            selected={order === "recent"}
            onPress={() => setOrder("recent")}
            style={{
              marginRight: 8,
              backgroundColor:
                order === "recent" ? colors.primary : colors.border,
            }}
            textStyle={{
              color: order === "recent" ? "#fff" : colors.textSecondary,
              fontWeight: "600",
            }}
          >
            Recientes
          </Chip>

          <Chip
            selected={order === "old"}
            onPress={() => setOrder("old")}
            style={{
              backgroundColor: order === "old" ? colors.primary : colors.border,
            }}
            textStyle={{
              color: order === "old" ? "#fff" : colors.textSecondary,
              fontWeight: "600",
            }}
          >
            Antiguos
          </Chip>
        </View>

        {/* LIST */}

        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.lg }}>
            <View style={{ alignItems: "center", marginBottom: spacing.sm }}>
              <Text style={{ opacity: 0.7, fontWeight: "700" }}>
                {section.title}
              </Text>
            </View>

            {section.data.map((item) => renderItem(item))}
          </View>
        ))}

        <View style={{ marginVertical: spacing.lg }}>
          <AdBanner />
        </View>

        {selected && (
          <OneByOneDetail
            oneByOne={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </View>
    </PrivateLayout>
  );
}
