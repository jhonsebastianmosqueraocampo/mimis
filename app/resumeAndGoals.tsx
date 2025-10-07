import ScrollSection from '@/components/ScrollSection';
import TrainingList from '@/components/TrainingList';
import { swiperItem } from '@/types';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import PrivateLayout from './privateLayout';

const ResumeAndGoalTeams: swiperItem[] = [
  {
    id: "1",
    title: "Lionel Messi",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg",
    pathTo: "/lionel-messi",
  },
  {
    id: "2",
    title: "Cristiano Ronaldo",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
    pathTo: "/cristiano-ronaldo",
  },
  {
    id: "3",
    title: "Kylian Mbappé",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Kylian_Mbapp%C3%A9_2019.jpg",
    pathTo: "/kylian-mbappe",
  },
  {
    id: "4",
    title: "Lamine Yamal",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Lamine_Yamal_2023.jpg",
    pathTo: "/lamine-yamal",
  },
  {
    id: "5",
    title: "Erling Haaland",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Erling_Haaland_2020.jpg",
    pathTo: "/erling-haaland",
  },
];

export default function ResumeAndGoal() {
  const navigation = useNavigation();

  const actionTraining = (id: string) => {
    console.log(id);
    // navigation.navigate('Video', { id });
  };

  return (
    <PrivateLayout>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
            variant="titleMedium"
            style={{ color: '#333333', fontSize: 20, marginBottom: 16 }}
        >
            Resúmenes y goles
        </Text>

        <ScrollSection
            title="Tus equipos"
            list={ResumeAndGoalTeams}
            action={actionTraining}
            shape='square'
        />

        <Divider style={{ marginVertical: 12 }} />

        <ScrollSection
            title="Jugadores"
            list={ResumeAndGoalTeams}
            action={actionTraining}
            shape='square'
        />

        <Divider style={{ marginVertical: 12 }} />

        <ScrollSection
            title="Torneos"
            list={ResumeAndGoalTeams}
            action={actionTraining}
            shape='square'
        />

        <Text
            variant="titleMedium"
            style={{ color: '#333333', fontSize: 20, marginTop: 20, marginBottom: 8 }}
        >
            General
        </Text>

        <TrainingList />
        </ScrollView>
    </PrivateLayout>
  );
}