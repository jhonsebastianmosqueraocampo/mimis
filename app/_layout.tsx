import { AuthProvider } from "@/hooks/AuthContext";
import { FetchProvider } from "@/hooks/FetchContext";
import { InsideProvider } from "@/hooks/InsideContext";
import { Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["top", "bottom"]}
        >
          <AuthProvider>
            <FetchProvider>
              <InsideProvider>
                <PaperProvider theme={theme}>
                  {/* 🔹 Este View garantiza que el Stack siempre tenga 100 % del alto visible */}
                  <View style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false }} />
                  </View>
                </PaperProvider>
              </InsideProvider>
            </FetchProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}