import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      Alert.alert("Missing Fields", "Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      router.replace("/dashboard/customer");
    } catch {
      Alert.alert("Login Failed", "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.screen}>
      <Text style={s.title}>Welcome back 👋</Text>
      <Text style={s.subtitle}>Log in to your TaskSoko account</Text>

      <View style={s.field}>
        <Text style={s.label}>Username</Text>
        <TextInput style={s.input} value={form.username} onChangeText={v => setForm({ ...form, username: v })} placeholder="johndoe" placeholderTextColor={C.muted} autoCapitalize="none" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>Password</Text>
        <TextInput style={s.input} value={form.password} onChangeText={v => setForm({ ...form, password: v })} placeholder="••••••••" placeholderTextColor={C.muted} secureTextEntry />
      </View>

      <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")} style={{ marginTop: 16 }}>
        <Text style={s.link}>New to TaskSoko? <Text style={{ color: C.primary }}>Create account →</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.muted, marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: C.elevated, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: C.text, fontSize: 15 },
  btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", fontSize: 14, color: C.muted },
});
