import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const socialButtons = [
  { icon: <FontAwesome name="google" size={24} />, key: "google", colSpan: 2 },
];

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

const redirectUri = makeRedirectUri({
  native: "com.jhonsebastian.mimis:/oauthredirect",
});

export default function SocialLoginButtons() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:
        "104064949575-dcr4vb5fso27bbsvkujsijp380ims7vq.apps.googleusercontent.com",
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery,
  );

  const onGooglePress = async () => {
    await AsyncStorage.setItem(
      "google_pkce_verifier",
      request?.codeVerifier ?? "",
    );
    await promptAsync();
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
            onPress={onGooglePress}
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
