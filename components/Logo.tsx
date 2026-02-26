import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export default function Logo({ size = "md", showText = false }: LogoProps) {
  const theme = useTheme();

  const sizes = {
    sm: { width: 90, height: 36 },
    md: { width: 140, height: 56 },
    lg: { width: 200, height: 80 },
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/logo/mimis-logo.png")}
        style={[
          styles.logo,
          {
            width: sizes[size].width,
            height: sizes[size].height,
          },
        ]}
        resizeMode="contain"
      />

      {showText && (
        <Text style={[styles.subtitle]}>Tu fútbol, tus puntos, tu juego</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    marginVertical: 8,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.8,
    fontWeight: "600",
  },
});
