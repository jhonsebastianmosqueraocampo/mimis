import { useAuth } from "@/hooks/AuthContext";
import { RootStackParamList } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

const discovery = {
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

const redirectUri = AuthSession.makeRedirectUri({
  native: "com.jhonsebastian.mimis:/oauthredirect",
});

export default function OAuthRedirect() {
  const { registerWithGoogle } = useAuth();
  const { code, error } = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();

  useEffect(() => {
    (async () => {
      if (error) {
        navigation.navigate("login");
        return;
      }

      if (!code) return;

      const codeVerifier = await AsyncStorage.getItem("google_pkce_verifier");
      if (!codeVerifier) {
        navigation.navigate("login");
        return;
      }

      // Intercambio code -> tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId:
            "104064949575-dcr4vb5fso27bbsvkujsijp380ims7vq.apps.googleusercontent.com", // WEB
          code,
          redirectUri,
          extraParams: { code_verifier: codeVerifier },
        },
        discovery,
      );

      const accessToken = tokenResult.accessToken;
      if (!accessToken) {
        navigation.navigate("login");
        return;
      }

      fetchUserInfo(accessToken);

      // Limpieza
      // await AsyncStorage.removeItem("google_pkce_verifier");
    })();
  }, [code, error]);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchUserInfo = async (token: string | undefined) => {
    const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();
    const response = await registerWithGoogle(user);
    if (response.isNewUser) {
      navigation.navigate("selectFavorite");
    } else {
      navigation.navigate("index");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 12 }}>Completando inicio de sesión…</Text>
    </View>
  );
}
