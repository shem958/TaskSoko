import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };

export default function RegisterScreen() {
  const router = useRouter();
  const { role: defaultRole } = useLocalSearchParams<{ role?: string }>();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", phone_number: "", role: defaultRole || "CUSTOMER" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.phone_number) {
      Alert.alert("Missing Fields", "Please fill in username, phone, and password.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/register/", form);
      await login(form.username, form.password);
      router.replace(form.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer");
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msgs = e.response?.data ? Object.values(e.response.data).flat().join("\n") : "Registration failed.";
      Alert.alert("Error", msgs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Create Account</Text>
      <Text style={s.subtitle}>Join Nairobi's #1 services platform</Text>

      {/* Role Toggle */}
      <View style={s.roleRow}>
        <TouchableOpacity style={[s.roleBtn, form.role === "CUSTOMER" && s.roleActive]} onPress={() => setForm({ ...form, role: "CUSTOMER" })}>
          <Text style={[s.roleTxt, form.role === "CUSTOMER" && s.roleActiveTxt]}>👤 Need services</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.roleBtn, form.role === "PROVIDER" && s.roleActive]} onPress={() => setForm({ ...form, role: "PROVIDER" })}>
          <Text style={[s.roleTxt, form.role === "PROVIDER" && s.roleActiveTxt]}>🔧 Provide services</Text>
        </TouchableOpacity>
      </View>

      <View style={s.field}>
        <Text style={s.label}>Username</Text>
        <TextInput style={s.input} value={form.username} onChangeText={v => setForm({ ...form, username: v })} placeholder="johndoe" placeholderTextColor={C.muted} autoCapitalize="none" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>Email (optional)</Text>
        <TextInput style={s.input} value={form.email} onChangeText={v => setForm({ ...form, email: v })} placeholder="john@example.com" placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>Phone (M-Pesa) e.g. 254712...</Text>
        <TextInput style={s.input} value={form.phone_number} onChangeText={v => setForm({ ...form, phone_number: v })} placeholder="254712345678" placeholderTextColor={C.muted} keyboardType="phone-pad" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>Password</Text>
        <TextInput style={s.input} value={form.password} onChangeText={v => setForm({ ...form, password: v })} placeholder="••••••••" placeholderTextColor={C.muted} secureTextEntry />
      </View>

      <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")} style={{ marginTop: 16 }}>
        <Text style={s.link}>Already have an account? <Text style={{ color: C.primary }}>Log in →</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.muted, marginBottom: 28 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 24, backgroundColor: C.elevated, padding: 4, borderRadius: 12 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  roleActive: { backgroundColor: C.primary },
  roleTxt: { fontSize: 13, fontWeight: "600", color: C.muted },
  roleActiveTxt: { color: "#fff" },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: C.elevated, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: C.text, fontSize: 15 },
  btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", fontSize: 14, color: C.muted },
});
