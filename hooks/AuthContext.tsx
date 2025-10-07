import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// const apiUrl = Constants.expoConfig?.extra?.API_URL;
const apiUrl = "http://192.168.101.16:3001/api";

type GoogleUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
  googleId: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => Promise<{ success: boolean; message?: string }>;
  register: (userData: User) => Promise<{ success: boolean; message?: string }>;
  registerWithGoogle: (
    googleUser: GoogleUser
  ) => Promise<{ success: boolean; isNewUser: boolean; message?: string }>;
  logout: () => void;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUserFromRefreshToken();
  }, []);

  const getUserFromRefreshToken = async () => {
    const token = await AsyncStorage.getItem("refreshToken");
    if (!token) return;
    const data = await fetch(`${apiUrl}/user/getUserFromRefreshToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const { user, access_token } = await data.json();

    if (!access_token) return;

    await AsyncStorage.setItem("accessToken", access_token);
    setUser(user)
  };

  const login = async (
    userData: User
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      setUser(data.user);
      await AsyncStorage.setItem("accessToken", data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const register = async (
    userData: User
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${apiUrl}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      setUser(data.user);
      await AsyncStorage.setItem("accessToken", data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const registerWithGoogle = async (
    googleUser: GoogleUser
  ): Promise<{
    success: boolean;
    isNewUser: boolean;
    message?: string;
  }> => {
    try {
      const response = await fetch(`${apiUrl}/user/authGoogle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          googleId: googleUser.id,
        }),
      });

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          isNewUser: false,
          message: data.message,
        };
      }
      setUser(data.user);
      await AsyncStorage.setItem("accessToken", data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
      return { success: true, isNewUser: data.isNewUser };
    } catch (error: any) {
      return { success: false, isNewUser: false, message: error.message };
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        registerWithGoogle,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
