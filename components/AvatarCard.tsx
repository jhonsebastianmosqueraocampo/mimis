import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type AvatarCardProps = {
  name: string;
  imageUrl: string;
  typographyProps?: {
    style?: object;
    variant?: string;
  };
};

export default function AvatarCard({
  name,
  imageUrl,
  typographyProps,
}: AvatarCardProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <Text
        variant="titleLarge"
        style={[styles.text, typographyProps?.style]}
      >
        {name.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  text: {
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
    fontFamily: "BubbleSans",
  },
});