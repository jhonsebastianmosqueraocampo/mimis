import { useFetch } from "@/hooks/FetchContext";
import { PlayerCareer } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator, Chip } from "react-native-paper";
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
          selectedItem
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
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
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
                color: selectedItem === item ? "#fff" : "#000",
              }}
            >
              {item}
            </Chip>
          ))}
        </ScrollView>
      </View>
      <PlayerCareerScreen player={playerCareer!} />
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
    borderColor: "#1DB954",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  firstChip: {
    marginLeft: 12,
  },

  lastChip: {
    marginRight: 12,
  },
  chipSelected: {
    backgroundColor: "#1DB954",
  },
});
