import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0A0F1C" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#111827" },
          headerTintColor: "#F0F4FF",
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
          contentStyle: { backgroundColor: "#0A0F1C" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "Log In", headerBackTitle: "Back" }} />
        <Stack.Screen name="auth/register" options={{ title: "Create Account", headerBackTitle: "Back" }} />
        <Stack.Screen name="search" options={{ title: "Find Services" }} />
        <Stack.Screen name="services/[id]" options={{ title: "Service Details" }} />
        <Stack.Screen name="dashboard/customer" options={{ title: "My Dashboard" }} />
        <Stack.Screen name="dashboard/provider" options={{ title: "Provider Dashboard" }} />
        <Stack.Screen name="chat/[bookingId]" options={{ title: "Chat" }} />
      </Stack>
    </AuthProvider>
  );
}
