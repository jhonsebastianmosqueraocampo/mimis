import { useAuth } from "@/hooks/AuthContext";
import { RootStackParamList, User } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [form, setForm] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const user: User = {
      id: "",
      nickName: "",
      email: form.email,
      password: form.password,
    };
    const result = await login(user);

    if (!result.success) {
      setError(result.message || "Error");
    } else {
      setError("");
      navigation.navigate("index");
    }
  };

  const isDisabled = !form.email || !form.password;
  const hasError = false;
  const identifierIconName = form.email.includes("@") ? "email" : "person";

  return (
    <View style={styles.container}>
      <Text> {error} </Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name={identifierIconName} size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleChange("password", text)}
        />
      </View>

      {hasError && (
        <Text style={styles.errorText}>Usuario o contraseña incorrectos.</Text>
      )}

      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isDisabled}
        style={[styles.button, isDisabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#000",
  },
  errorText: {
    color: "#e53935",
    textAlign: "center",
    fontFamily: "goli",
    fontSize: 14,
  },
  forgotContainer: {
    alignItems: "flex-end",
  },
  forgotText: {
    color: "#1DB954",
    fontFamily: "goli",
  },
  button: {
    backgroundColor: "#1DB954",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "goli",
    fontWeight: "600",
    fontSize: 16,
  },
});
