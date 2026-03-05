import { useAuth } from "@/hooks/AuthContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
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
      points: 0,
      xp: 0,
      level: "Novato",
      betsWon: 0,
      betsLost: 0,
      redeemed: 0,
      badges: [],
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
    gap: spacing.sm,
    width: "100%",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },

  input: {
    flex: 1,
    marginLeft: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
  },

  errorText: {
    ...typography.small,
    color: colors.error,
    textAlign: "center",
  },

  forgotContainer: {
    alignItems: "flex-end",
  },

  forgotText: {
    ...typography.small,
    color: colors.primary,
  },

  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: "600",
  },
});
