import { useAuth } from "@/hooks/AuthContext";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { RootStackParamList, User } from "@/types";
import { Feather, MaterialIcons } from "@expo/vector-icons";
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

type RegisterFormValues = {
  nickName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterFormValues>({
    nickName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { register } = useAuth();

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    const user: User = {
      id: "",
      nickName: form.nickName,
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
    const result = await register(user);

    if (!result.success) {
      setError(result.message || "Error");
    } else {
      setError("");
      navigation.navigate("selectFavorite");
    }
  };

  const isDisabled = !form.nickName || !form.email || !form.password;
  const passwordsDontMatch =
    form.confirmPassword !== "" && form.confirmPassword !== form.password;

  return (
    <View style={styles.container}>
      <Text> {error} </Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name={"person"} size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor={colors.textSecondary}
          value={form.nickName}
          onChangeText={(text) => handleChange("nickName", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name={"email"} size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(text) => handleChange("password", text)}
        />
        <Feather
          name={showPassword ? "eye" : "eye-off"}
          size={20}
          color="#666"
          onPress={() => setShowPassword(!showPassword)}
          style={{ marginLeft: 8 }}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!showConfirmPassword}
          value={form.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
        />
        <Feather
          name={showConfirmPassword ? "eye" : "eye-off"}
          size={20}
          color={colors.textSecondary}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{ marginLeft: 8 }}
        />
      </View>

      {passwordsDontMatch && (
        <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isDisabled}
        style={[styles.button, isDisabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Registrarse</Text>
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
    borderColor: colors.textSecondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    fontFamily: typography.title.fontFamily,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontFamily: typography.title.fontFamily,
    fontWeight: "600",
    fontSize: 16,
  },
});
