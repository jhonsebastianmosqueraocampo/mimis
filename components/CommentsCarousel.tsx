import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },

  text: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontStyle: "italic",
  },
});
