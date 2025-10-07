import MainMenu from "@/components/MainMenu";
import { useAuth } from "@/hooks/AuthContext";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import Login from "./login";

type Props = {
  children: React.ReactNode;
};

export default function PrivateLayout({ children }: Props) {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {!isLoggedIn ? (
        <Login />
      ) : (
        <View style={styles.root}>
          <StatusBar backgroundColor="#1DB954" barStyle="light-content" />
          <MainMenu />

          {/* 🔹 Aquí el contenido siempre ocupará toda la altura */}
          <View style={styles.container}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>{children}</View>
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, // ✅ ocupa todo el alto visible
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1, // ✅ asegura que el contenido llene la pantalla
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    minHeight: "100%", // ✅ garantiza 100% visible aunque no haya mucho contenido
    paddingBottom: 20,
  },
});