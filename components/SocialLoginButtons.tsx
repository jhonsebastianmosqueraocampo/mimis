import { useAuth } from "@/hooks/AuthContext";
import { RootStackParamList } from "@/types";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const socialButtons = [
  { icon: <FontAwesome name="google" size={24} />, key: "google", colSpan: 2 },
];

const redirectUri = makeRedirectUri({
  native: "com.jhonsebastian.mimis:/oauthredirect"
});

export default function SocialLoginButtons() {
  const { registerWithGoogle } = useAuth();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "104064949575-dcr4vb5fso27bbsvkujsijp380ims7vq.apps.googleusercontent.com",
      redirectUri: redirectUri
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (response) {
      if (response.type === "success") {
        const { authentication } = response;
        fetchUserInfo(authentication?.accessToken);
      }
    }
  }, [response]);

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
    <View style={styles.grid}>
      {socialButtons.map(({ icon, key, colSpan }) => (
        <View
          key={key}
          style={[
            styles.buttonContainer,
            colSpan === 2 ? styles.colSpan2 : styles.colSpan1,
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            disabled={!request}
            onPress={() => promptAsync({ scheme: 'mimis', useProxy: false } as any)}
          >
            {icon}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
  },
  buttonContainer: {
    margin: 4,
  },
  colSpan1: {
    width: "47%",
  },
  colSpan2: {
    width: "97%",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1DB954",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
