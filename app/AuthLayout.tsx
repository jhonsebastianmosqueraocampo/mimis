import Logo from "@/components/Logo";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import type { ReactNode } from "react";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

import { colors } from "@/theme/colors";
import { g } from "@/theme/styles";
import { sx } from "@/theme/sx";

interface AuthLayoutProps {
  form: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: "register" | "login";
}

export default function AuthLayout({
  form,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            sx({
              flex: 1,
              p: 20,
              bg: colors.background,
              center: true,
            }) as any,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              sx({
                w: "100%",
                center: true,
              }) as any,
              {
                maxWidth: 360,
              },
            ]}
          >
            {/* Logo */}
            <Logo size="sm" />

            {/* Form */}
            <View style={sx({ mt: 28, w: "100%" }) as any}>{form}</View>

            {/* Footer text */}
            <Text
              style={[
                g.body,
                sx({
                  mt: 24,
                  center: true,
                  color: colors.textSecondary,
                }) as any,
              ]}
            >
              {footerText}{" "}
              <TouchableOpacity
                onPress={() => navigation.navigate(footerLinkHref)}
              >
                <Text
                  style={[
                    g.subtitle,
                    {
                      textDecorationLine: "underline",
                      color: colors.primary,
                    },
                  ]}
                >
                  {footerLinkText}
                </Text>
              </TouchableOpacity>
            </Text>

            {/* Divider */}
            <View
              style={[
                sx({
                  row: true,
                  items: "center",
                  mt: 24,
                  mb: 16,
                  w: "100%",
                }) as any,
              ]}
            >
              <View
                style={[
                  sx({
                    flex: 1,
                  }) as any,
                  {
                    height: 1,
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <Text
                style={[
                  g.small,
                  sx({
                    mx: 10,
                    color: colors.textSecondary,
                  }) as any,
                ]}
              >
                o
              </Text>

              <View
                style={[
                  sx({
                    flex: 1,
                  }) as any,
                  {
                    height: 1,
                    backgroundColor: colors.border,
                  },
                ]}
              />
            </View>

            {/* Social login */}
            <SocialLoginButtons />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
