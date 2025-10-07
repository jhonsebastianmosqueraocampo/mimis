import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Title, useTheme } from 'react-native-paper';

type SwiperItem = {
  id: string;
  title: string;
  img: string;
  pathTo: string;
};

const jugadores: SwiperItem[] = [
  {
    id: '1',
    title: 'Lionel Messi',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg',
    pathTo: '/lionel-messi',
  },
  {
    id: '2',
    title: 'Cristiano Ronaldo',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
    pathTo: '/cristiano-ronaldo',
  },
  {
    id: '3',
    title: 'Kylian Mbappé',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Kylian_Mbapp%C3%A9_2019.jpg',
    pathTo: '/kylian-mbappe',
  },
  {
    id: '4',
    title: 'Lamine Yamal',
    img: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Lamine_Yamal_2023.jpg',
    pathTo: '/lamine-yamal',
  },
  {
    id: '5',
    title: 'Erling Haaland',
    img: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Erling_Haaland_2020.jpg',
    pathTo: '/erling-haaland',
  },
  {
    id: '6',
    title: 'Vinícius Jr.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Vinicius_Junior_2021.jpg',
    pathTo: '/vinicius-jr',
  },
  {
    id: '7',
    title: 'Jude Bellingham',
    img: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Jude_Bellingham_2023.jpg',
    pathTo: '/jude-bellingham',
  },
  {
    id: '8',
    title: 'Robert Lewandowski',
    img: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Robert_Lewandowski_2020.jpg',
    pathTo: '/robert-lewandowski',
  },
  {
    id: '9',
    title: 'Antoine Griezmann',
    img: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Antoine_Griezmann_2018.jpg',
    pathTo: '/antoine-griezmann',
  },
  {
    id: '10',
    title: 'Mohamed Salah',
    img: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Mohamed_Salah_2018.jpg',
    pathTo: '/mohamed-salah',
  },
  {
    id: '11',
    title: 'Kevin De Bruyne',
    img: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Kevin_De_Bruyne_201807091.jpg',
    pathTo: '/kevin-de-bruyne',
  },
];

export default function TournamentInfo() {
  const [rowsTournament, setRowsTournament] = useState<SwiperItem[][]>([[], []]);
  const theme = useTheme();

  useEffect(() => {
    // Divide de forma balanceada en 2 filas
    const tempRows: SwiperItem[][] = [[], []];
    jugadores.forEach((item, index) => {
      const row = index % 2 === 0 ? 0 : 1;
      tempRows[row].push(item);
    });
    setRowsTournament(tempRows);
  }, []);

  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
      <Title style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
        Torneos
      </Title>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {rowsTournament.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <View key={item.id} style={styles.playerContainer}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: item.img }}
                      style={styles.playerImage}
                    />
                  </View>
                  <Text style={styles.playerName}>{item.title}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  playerContainer: {
    width: 100,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 2,
    marginBottom: 6,
  },
  playerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playerName: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },
});