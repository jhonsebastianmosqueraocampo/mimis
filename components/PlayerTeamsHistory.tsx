import { useFetch } from "@/hooks/FetchContext";
import AdBanner from "@/services/ads/AdBanner";
import { colors } from "@/theme/colors";
import { PlayerCareer } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Chip } from "react-native-paper";
import Loading from "./Loading";
import PlayerCareerScreen from "./PlayerCareerScreen";

type PlayerTeamHistoryProps = {
  seasons: number[];
  playerId: string;
};

export default function PlayerTeamHistory({
  seasons,
  playerId,
}: PlayerTeamHistoryProps) {
  const { getPlayerCareer } = useFetch();

  const [selectedItem, setSelectedItem] = useState(seasons[0]);
  const [playerCareer, setPlayerCareer] = useState<PlayerCareer>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getCareer = async () => {
      setLoading(true);
      try {
        const { success, playerCareer, message } = await getPlayerCareer(
          playerId,
          selectedItem,
        );

        if (!isMounted) return;

        if (success) {
          setPlayerCareer(playerCareer!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (playerId && selectedItem) {
      getCareer();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedItem, playerId]);

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <>
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {seasons.map((item, index) => (
            <Chip
              key={index}
              onPress={() => setSelectedItem(item)}
              selected={selectedItem === item}
              style={[
                styles.chip,
                index === 0 && styles.firstChip,
                index === seasons.length - 1 && styles.lastChip,
                selectedItem === item && styles.chipSelected,
              ]}
              textStyle={{
                color:
                  selectedItem === item ? colors.textOnPrimary : colors.text,
              }}
            >
              {item}
            </Chip>
          ))}
        </ScrollView>
      </View>
      <PlayerCareerScreen player={playerCareer!} />

      <View style={{ marginVertical: 24, alignItems: "center" }}>
        <AdBanner />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: "row",
  },
  tabBar: {
    marginVertical: 12,
  },
  chip: {
    marginRight: 8,
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  firstChip: {
    marginLeft: 12,
  },

  lastChip: {
    marginRight: 12,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
});
