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
            color={isFavorite ? "#fff" : "#1DB954"}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
    borderWidth: 1.4,
    shadowColor: "#1DB954",
  },

  /* 🔥 ESTADO ACTIVO PREMIUM */
  activeContainer: {
    backgroundColor: "rgba(29,185,84,0.15)",
    borderColor: "#1DB954",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  /* ⚪ ESTADO INACTIVO PREMIUM */
  inactiveContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "#1DB954",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  /* 🔘 ICONO ENVUELTO EN UN CÍRCULO HERMOSO */
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  iconWrapperActive: {
    backgroundColor: "#1DB954",
    shadowColor: "#1DB954",
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  iconWrapperInactive: {
    backgroundColor: "rgba(29,185,84,0.1)",
  },

  /* TEXTOS */
  activeText: {
    color: "#1DB954",
  },
  inactiveText: {
    color: "#1DB954",
  },

  text: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
