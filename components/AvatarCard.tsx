import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
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
      <Text variant="titleLarge" style={[styles.text, typographyProps?.style]}>
        {name.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.round,
  },

  text: {
    ...typography.body,
    textAlign: "center",
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
