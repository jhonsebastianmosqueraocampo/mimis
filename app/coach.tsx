import CoachHistory from "@/components/CoachHistory";
import CoachProfileCard from "@/components/CoachProfileCard";
import Loading from "@/components/Loading";
import VerticalScroll from "@/components/VerticalScroll";
import { useFetch } from "@/hooks/FetchContext";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Chip, Text } from "react-native-paper";
import AvatarCard from "../components/AvatarCard";
import type { CoachStats, RootStackParamList, swiperItem } from "../types";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

const items = [
  { id: "1", name: "Información Personal" },
  { id: "2", name: "Noticias" },
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
        const season = 0;

        const { success, coach, message } = await getCoachInfo(id, season);

        if (!isMounted) return;

        if (success) {
          setCoach(coach!);
        } else {
          setError(message!);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar información del entrenador");
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
        if (isMounted) setError("Error al cargar noticias del entrenador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id && selectedItem) {
      getCoach();
      coachNews();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando entrenadores"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  const actionGeneralListNews = (id: string) => console.log(id);

  return (
    <PrivateLayout>
      {coach && (
        <>
          <AvatarCard
            name={coach.name!}
            imageUrl={coach.photo!}
            typographyProps={{ variant: "titleLarge" }}
          />

          {/* Club actual */}
          <View
            style={[
              sx({
                row: true,
                center: true,
                px: 12,
                mt: 6,
              }) as any,
              { gap: 8 },
            ]}
          >
            <Image
              source={{ uri: coach?.history[0].team?.logo ?? "" }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />

            <Chip
              style={[
                {
                  borderColor: colors.primary,
                  borderWidth: 1,
                  backgroundColor: "transparent",
                },
              ]}
              textStyle={{ color: colors.textPrimary }}
            >
              {coach?.history[0].team?.name}
            </Chip>
          </View>

          {/* Tabs */}
          <View style={sx({ mt: 12, mb: 12 }) as any}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sx({ row: true }) as any}
            >
              {items.map((item, index) => {
                const selected = selectedItem.id === item.id;

                return (
                  <Chip
                    key={item.id}
                    onPress={() => setSelectedItem(item)}
                    selected={selected}
                    style={[
                      sx({
                        mr: 8,
                      }) as any,
                      {
                        borderColor: colors.primary,
                        borderWidth: 1,
                        backgroundColor: selected
                          ? colors.primary
                          : "transparent",
                        marginLeft: index === 0 ? 12 : 0,
                        marginRight: index === items.length - 1 ? 12 : 8,
                      },
                    ]}
                    textStyle={{
                      color: selected
                        ? colors.textOnPrimary
                        : colors.textPrimary,
                      fontFamily: g.subtitle.fontFamily,
                    }}
                  >
                    {item.name.toUpperCase()}
                  </Chip>
                );
              })}
            </ScrollView>
          </View>

          {/* Content */}
          <View style={sx({ p: 16 }) as any}>
            <Text
              style={[
                g.subtitle,
                {
                  marginBottom: 12,
                  color: colors.textPrimary,
                },
              ]}
            >
              {selectedItem.name.toUpperCase()}
            </Text>

            {/* Información */}
            {selectedItem.name.toLowerCase() === "información personal" && (
              <CoachProfileCard
                name={coach.name!}
                age={coach.age!}
                country={coach.nationality!}
                currentClub={coach.history[0].team?.name}
                avatarUrl={coach.photo!}
              />
            )}

            {/* Noticias */}
            {selectedItem.name.toLowerCase() === "noticias" && (
              <ScrollView>
                <VerticalScroll
                  listItems={coachNew!}
                  actionGeneralList={actionGeneralListNews}
                />
              </ScrollView>
            )}

            {/* Trayectoria */}
            {selectedItem.name.toLowerCase() === "trayectoria" && (
              <CoachHistory history={coach.history} />
            )}
          </View>
        </>
      )}
    </PrivateLayout>
  );
}
