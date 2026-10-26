import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone_number: string;
  provider_profile?: { is_approved: boolean };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("access_token").then(token => {
      if (token) {
        api.get("/users/me/")
          .then(res => setUser(res.data))
          .catch(async () => {
            await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post("/users/token/", { username, password });
    await AsyncStorage.setItem("access_token", res.data.access);
    await AsyncStorage.setItem("refresh_token", res.data.refresh);
    const userRes = await api.get("/users/me/");
    setUser(userRes.data);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
