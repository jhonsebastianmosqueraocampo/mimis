import CoachHistory from "@/components/CoachHistory";
import CoachProfileCard from "@/components/CoachProfileCard";
import VerticalScroll from "@/components/VerticalScroll";
import { useFetch } from "@/hooks/FetchContext";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator, Chip, Text } from "react-native-paper";
import AvatarCard from "../components/AvatarCard";
import type { CoachStats, RootStackParamList, swiperItem } from "../types";
import PrivateLayout from "./privateLayout";

const items = [
  { id: "1", name: "Información Personal" },
  { id: "2", name: "Noticias" },
  { id: "4", name: "Videos" },
  { id: "5", name: "Trayectoria" },
];

type PlayerScreenRouteProp = RouteProp<RootStackParamList, "coach">;

export default function Coach() {
  const { getCoachInfo, getCoachNews } = useFetch();
  const [coach, setCoach] = useState<CoachStats>();
  const [coachNew, setCoachNews] = useState<swiperItem[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const route = useRoute<PlayerScreenRouteProp>();
  const { id } = route.params;

  useEffect(() => {
    let isMounted = true;

    const getCoach = async () => {
      setLoading(true);
      try {
        const season = new Date().getFullYear();
        const { success, coach, message } = await getCoachInfo(id, season);

        if (!isMounted) return;

        if (success) {
          setCoach(coach!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const coachNews = async () => {
      setLoading(true);
      try {
        const { success, news, message } = await getCoachNews(id);

        if (!isMounted) return;

        if (success) {
          setCoachNews(news!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id && selectedItem) {
      getCoach();
      coachNews()
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const actionGeneralListNews = (id: string) => console.log(id);

  return (
    <PrivateLayout>
      {coach && (
        <>
          <AvatarCard
            name={coach?.name!}
            imageUrl={coach?.photo!}
            typographyProps={{ variant: "titleLarge" }}
          />

          <View style={styles.headerRow}>
            <Image
              source={{ uri: coach?.history[0].team?.logo ?? "" }}
              style={styles.teamImage}
            />
            <Chip style={styles.clubChip}>{coach?.history[0].team?.name}</Chip>
          </View>

          <View style={styles.tabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {items.map((item, index) => (
                <Chip
                  key={item.id}
                  onPress={() => setSelectedItem(item)}
                  selected={selectedItem.id === item.id}
                  style={[
                    styles.chip,
                    index === 0 && styles.firstChip,
                    index === items.length - 1 && styles.lastChip,
                    selectedItem.id === item.id && styles.chipSelected,
                  ]}
                  textStyle={{
                    color: selectedItem.id === item.id ? "#fff" : "#000",
                  }}
                >
                  {item.name.toUpperCase()}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <View style={styles.container}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {selectedItem.name.toUpperCase()}
            </Text>

            {selectedItem.name.toLowerCase() === "información personal" && (
              <CoachProfileCard
                name={coach?.name!}
                age={coach?.age!}
                country={coach?.nationality!}
                currentClub={coach?.history[0].team?.name}
                avatarUrl={coach?.photo!}
              />
            )}

            <ScrollView>
              {selectedItem.name.toLowerCase() === "noticias" && (
                <VerticalScroll
                  listItems={coachNew!}
                  actionGeneralList={actionGeneralListNews}
                />
              )}
            </ScrollView>

            {/*{selectedItem.name.toLowerCase() === "videos" && <></>} */}

            {selectedItem.name.toLowerCase() === "trayectoria" && (
              <CoachHistory history={coach.history} />
            )}
          </View>
        </>
      )}
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  avatar: {
    paddingVertical: 2,
  },
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    paddingHorizontal: 8,
  },
  teamImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  clubChip: {
    backgroundColor: "transparent",
    borderColor: "#1DB954",
  },
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
  sectionTitle: {
    marginBottom: 12,
    color: "#333",
    fontWeight: "600",
  },
});