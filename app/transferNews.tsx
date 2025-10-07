import ScrollSection from '@/components/ScrollSection';
import { swiperItem } from '@/types';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import PrivateLayout from './privateLayout';

const news: swiperItem[] = [
  {
    id: "1",
    title: "Lionel Messi",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg",
    pathTo: "/lionel-messi",
    description:
      "Tras una destacada temporada en la MLS, Lionel Messi continúa demostrando su calidad con actuaciones decisivas tanto en su club como con la selección argentina. Su influencia dentro y fuera del campo sigue siendo fundamental para el fútbol mundial.",
  },
  {
    id: "2",
    title: "Cristiano Ronaldo",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
    pathTo: "/cristiano-ronaldo",
    description: "Cristiano Ronaldo ha alcanzado nuevos récords goleadores en Arabia Saudita, consolidándose como uno de los máximos referentes del fútbol internacional. Su impacto mediático y deportivo continúa siendo imparable.",
  },
  {
    id: "3",
    title: "Kylian Mbappé",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Kylian_Mbapp%C3%A9_2019.jpg",
    pathTo: "/kylian-mbappe",
    description:
      "Mbappé protagoniza los rumores del mercado de fichajes europeo, con posibles destinos en clubes como el Real Madrid. Su rendimiento con el PSG ha sido clave, y su futuro genera gran expectativa.",
  },
  {
    id: "4",
    title: "Lamine Yamal",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Lamine_Yamal_2023.jpg",
    pathTo: "/lamine-yamal",
    description:
      "Lamine Yamal, la joven promesa del FC Barcelona, ha sorprendido con su madurez y talento en el primer equipo. Su desempeño ha despertado elogios tanto de aficionados como de expertos del fútbol.",
  },
  {
    id: "5",
    title: "Erling Haaland",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Erling_Haaland_2020.jpg",
    pathTo: "/erling-haaland",
    description:
      "Erling Haaland continúa siendo una máquina de hacer goles en la Premier League, atrayendo la atención de varios gigantes europeos. Su físico imponente y capacidad goleadora lo posicionan como uno de los delanteros más temidos del mundo.",
  },
];

export default function TransferNews() {
  const navigation = useNavigation();

  const action = (id: string) => {
    console.log('Navegar a:', id);
    // navigation.navigate('DetalleNoticia', { id }); // Si tienes una pantalla destino
  };

  return (
    <PrivateLayout>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
            variant="titleMedium"
            style={{ fontSize: 15, color: '#333', marginBottom: 16 }}
        >
            Fichajes y rumores
        </Text>

        <ScrollSection title="De tus equipos" list={news} shape="news" action={action} />
        <Divider style={{ marginVertical: 16 }} />

        <ScrollSection title="Fichajes confirmados" list={news} shape="news" action={action} />
        <Divider style={{ marginVertical: 16 }} />

        <ScrollSection title="Fuentes" list={news} shape="circle" action={action} />
        </ScrollView>
    </PrivateLayout>
  );
}