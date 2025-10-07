import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

const videos = Array.from({ length: 6 }).map((_, i) => ({
  title: `Video recomendado #${i + 1}`,
  thumbnail: 'https://via.placeholder.com/320x180',
}));

export default function RecommendedVideos() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Más videos</Text>
      <FlatList
        data={videos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  heading: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 128,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  separator: {
    height: 12,
  },
});