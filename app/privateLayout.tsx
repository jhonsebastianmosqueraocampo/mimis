import MainMenu from "@/components/MainMenu";
import { useAuth } from "@/hooks/AuthContext";
import { useStore } from "@/hooks/storeContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import Login from "./login";

type Props = {
  children: React.ReactNode;
};

export default function PrivateLayout({ children }: Props) {
  const { isLoggedIn } = useAuth();
  const { productsStore } = useStore();

  return (
    <>
      {!isLoggedIn ? (
        <Login />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <StatusBar
            backgroundColor={colors.primary}
            barStyle="light-content"
          />

          <MainMenu productsStore={productsStore} />

          <View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  flexGrow: 1,
                  minHeight: "100%",
                  paddingBottom: spacing.md,
                }}
              >
                {children}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
}
