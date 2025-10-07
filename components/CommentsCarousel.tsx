import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  comments: string[];
  onClick: () => void;
};

export default function CommentsCarousel({ comments, onClick }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % comments.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [comments]);

  return (
    <TouchableOpacity onPress={onClick} activeOpacity={0.8}>
      <View style={styles.container}>
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
          {comments[index]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgb(29, 185, 84)',
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontStyle: 'italic',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
  },
});