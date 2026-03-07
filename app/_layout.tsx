import { AuthProvider } from "@/hooks/AuthContext";
import { FetchProvider } from "@/hooks/FetchContext";
import { FootballProvider } from "@/hooks/FootballContext";
import { InsideProvider } from "@/hooks/InsideContext";
import { StoreProvider } from "@/hooks/storeContext";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import mobileAds from "react-native-google-mobile-ads";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
WebBrowser.maybeCompleteAuthSession();

export default function Layout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("AdMob inicializado");
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["top", "bottom"]}
        >
          <AuthProvider>
            <FetchProvider>
              <FootballProvider>
                <InsideProvider>
                  <StoreProvider>
                    <PaperProvider theme={theme}>
                      {/* 🔹 Este View garantiza que el Stack siempre tenga 100 % del alto visible */}
                      <View style={{ flex: 1 }}>
                        <Stack screenOptions={{ headerShown: false }} />
                      </View>
                    </PaperProvider>
                  </StoreProvider>
                </InsideProvider>
              </FootballProvider>
            </FetchProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
