import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type FavoriteBadgeProps = {
  isFavorite: boolean;
  onToggle: () => void;
};

export default function FavoriteBadge({
  isFavorite,
  onToggle,
}: FavoriteBadgeProps) {
  const handlePress = () => {
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ alignSelf: "center" }}>
      <View
        style={[
          stylesFav.container,
          isFavorite ? stylesFav.activeContainer : stylesFav.inactiveContainer,
        ]}
      >
        {/* CÍRCULO DEL ICONO */}
        <View
          style={[
            stylesFav.iconWrapper,
            isFavorite
              ? stylesFav.iconWrapperActive
              : stylesFav.iconWrapperInactive,
          ]}
        >
          <Icon
            name={isFavorite ? "star" : "star-outline"}
            size={22}
            color={isFavorite ? "#fff" : colors.primary}
          />
        </View>

        {/* TEXTO */}
        <Text
          style={[
            stylesFav.text,
            isFavorite ? stylesFav.activeText : stylesFav.inactiveText,
          ]}
        >
          {isFavorite ? "Equipo favorito" : "Agregar a favoritos"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const stylesFav = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1.4,
    shadowColor: colors.primary,
  },

  /* 🔥 ESTADO ACTIVO PREMIUM */
  activeContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  /* ⚪ ESTADO INACTIVO PREMIUM */
  inactiveContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  /* 🔘 ICONO ENVUELTO EN UN CÍRCULO */
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },

  iconWrapperActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  iconWrapperInactive: {
    backgroundColor: colors.surface,
  },

  /* TEXTOS */
  activeText: {
    color: colors.primary,
  },

  inactiveText: {
    color: colors.primary,
  },

  text: {
    ...typography.body,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
