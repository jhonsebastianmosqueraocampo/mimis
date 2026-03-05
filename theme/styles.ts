import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const g = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  container: {
    paddingHorizontal: spacing.lg,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleLarge: typography.titleLarge,

  title: typography.title,

  subtitle: typography.subtitle,

  body: typography.body,

  bodySecondary: typography.bodySecondary,

  small: typography.small,

  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: typography.button,

  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textSecondary,
  },
});
