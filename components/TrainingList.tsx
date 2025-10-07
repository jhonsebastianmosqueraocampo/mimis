import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

const GeneralTraining = [
  {
    id: '1',
    title: 'Lionel Messi',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Lionel_Messi_20180626.jpg',
  },
  {
    id: '2',
    title: 'Cristiano Ronaldo',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
  },
  {
    id: '3',
    title: 'Kylian Mbappé',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Kylian_Mbapp%C3%A9_2019.jpg',
  },
  {
    id: '4',
    title: 'Lamine Yamal',
    img: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Lamine_Yamal_2023.jpg',
  },
  {
    id: '5',
    title: 'Erling Haaland',
    img: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Erling_Haaland_2020.jpg',
  },
  {
    id: '6',
    title: 'Neymar Jr',
    img: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Neymar_2018.jpg',
  },
  {
    id: '7',
    title: 'Vinícius Jr',
    img: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Vinicius_Junior_2021.jpg',
  },
  {
    id: '8',
    title: 'Jude Bellingham',
    img: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Jude_Bellingham_2023.jpg',
  },
  {
    id: '9',
    title: 'Robert Lewandowski',
    img: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Lewandowski_2019.jpg',
  },
  {
    id: '10',
    title: 'Kevin De Bruyne',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Kevin_De_Bruyne_201807091.jpg',
  },
];

export default function TrainingList() {
  const navigation = useNavigation();
  const theme = useTheme();

  const actionGeneralList = (id: string) => {
    // navigation.navigate('Video', { id });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => actionGeneralList(item.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
      }}
    >
      <Image
        source={{ uri: item.img }}
        style={{ width: 60, height: 60, borderRadius: 8 }}
        resizeMode="cover"
      />
      <Text variant="bodyLarge">{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <View style={{ marginTop: 8 }}>
        <FlatList
          data={GeneralTraining}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View style={{ height: 8 }} />
          )}
        />
      </View>
    </ScrollView>
  );
}