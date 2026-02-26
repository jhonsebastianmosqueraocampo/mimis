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
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

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
          contentContainerStyle={styles.container}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <Logo size="sm" />

            <View style={{ marginTop: 24 }}>{form}</View>

            <Text style={styles.footerText}>
              {footerText}{" "}
              <TouchableOpacity
                onPress={() => navigation.navigate(footerLinkHref)}
              >
                <Text style={styles.linkText}>{footerLinkText}</Text>
              </TouchableOpacity>
            </Text>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialLoginButtons />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    justifyContent: "center",
    minHeight: 100,
  },
  innerContainer: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },
  footerText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: "#1DB954",
    fontFamily: "goli",
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#1DB954",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 8,
    fontFamily: "liter",
    fontSize: 14,
    color: "#333",
  },
});
