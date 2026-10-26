import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };

interface Booking { id: number; service: { title: string; price: string }; provider: { username: string }; date_time: string; status: string; payment_status: string; }

const STATUS_COLORS: Record<string, string> = { PENDING: "#F59E0B", ACCEPTED: "#3B82F6", COMPLETED: "#00C57E", CANCELLED: "#EF4444" };

export default function CustomerDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [payPhone, setPayPhone] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) { router.replace("/auth/login"); return; }
    if (user) {
      api.get("/bookings/").then(r => setBookings(r.data.results || r.data)).catch(() => {}).finally(() => setFetching(false));
    }
  }, [user, loading]);

  const initiatePayment = async (b: Booking) => {
    const phone = payPhone || user?.phone_number;
    if (!phone) { Alert.alert("Phone Required", "Enter your M-Pesa phone number."); return; }
    try {
      await api.post("/payments/initiate/", { booking_id: b.id, phone_number: phone });
      Alert.alert("✅ M-Pesa Prompt Sent", "Check your phone to complete payment.");
    } catch { Alert.alert("Failed", "Could not initiate M-Pesa payment."); }
  };

  if (loading || fetching) return <View style={[s.screen, s.center]}><ActivityIndicator color={C.primary} size="large" /></View>;

  const completed = bookings.filter(b => b.status === "COMPLETED").length;
  const earnings = bookings.filter(b => b.status === "COMPLETED").reduce((sum, b) => sum + Number(b.service?.price || 0), 0);

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good {new Date().getHours() < 12 ? "morning" : "afternoon"} 👋</Text>
          <Text style={s.name}>{user?.username}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => { logout(); router.replace("/"); }}>
          <Text style={s.logoutTxt}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[[String(bookings.length), "Total"], [String(completed), "Done"], [`KSh ${earnings.toLocaleString()}`, "Spent"]].map(([val, lbl]) => (
          <View key={lbl} style={s.statCard}>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.searchCta} onPress={() => router.push("/search")}>
        <Text style={s.searchCtaTxt}>🔍 Find a new service</Text>
      </TouchableOpacity>

      <Text style={s.sectionTitle}>My Bookings</Text>

      {bookings.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📅</Text>
          <Text style={s.emptyTitle}>No bookings yet</Text>
          <Text style={s.emptyTxt}>Browse and book your first service!</Text>
        </View>
      ) : (
        bookings.map(b => (
          <View key={b.id} style={s.bookingCard}>
            <View style={s.bookingHeader}>
              <Text style={s.bookingTitle} numberOfLines={1}>{b.service?.title}</Text>
              <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[b.status] + "22" }]}>
                <Text style={[s.statusTxt, { color: STATUS_COLORS[b.status] }]}>{b.status}</Text>
              </View>
            </View>
            <Text style={s.bookingMeta}>Provider: {b.provider?.username}</Text>
            <Text style={s.bookingMeta}>Date: {new Date(b.date_time).toLocaleString()}</Text>
            <Text style={s.bookingPrice}>KSh {Number(b.service?.price).toLocaleString()}</Text>

            {b.status === "ACCEPTED" && b.payment_status === "PENDING" && (
              <View style={s.payRow}>
                <TextInput style={[s.payInput]} placeholder="254712..." placeholderTextColor={C.muted} value={payingId === b.id ? payPhone : ""} onChangeText={v => { setPayingId(b.id); setPayPhone(v); }} keyboardType="phone-pad" />
                <TouchableOpacity style={s.payBtn} onPress={() => initiatePayment(b)}>
                  <Text style={s.payBtnTxt}>Pay M-Pesa</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={s.chatBtn} onPress={() => router.push(`/chat/${b.id}`)}>
              <Text style={s.chatBtnTxt}>💬 Open Chat</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 16, backgroundColor: "#111827", borderBottomWidth: 1, borderBottomColor: C.border },
  greeting: { fontSize: 12, color: C.muted },
  name: { fontSize: 20, fontWeight: "800", color: C.text },
  logoutBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  logoutTxt: { fontSize: 13, fontWeight: "600", color: C.muted },
  statsRow: { flexDirection: "row", gap: 10, padding: 16 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: "center" },
  statVal: { fontSize: 16, fontWeight: "800", color: C.primary, marginBottom: 2 },
  statLbl: { fontSize: 11, color: C.muted },
  searchCta: { margin: 16, marginTop: 0, backgroundColor: C.elevated, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 14, alignItems: "center" },
  searchCtaTxt: { fontSize: 14, fontWeight: "600", color: C.text },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text, paddingHorizontal: 16, marginBottom: 10 },
  empty: { alignItems: "center", padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: C.text, marginBottom: 6 },
  emptyTxt: { fontSize: 13, color: C.muted },
  bookingCard: { margin: 16, marginTop: 0, marginBottom: 12, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, gap: 6 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  bookingTitle: { fontSize: 15, fontWeight: "700", color: C.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusTxt: { fontSize: 11, fontWeight: "700" },
  bookingMeta: { fontSize: 12, color: C.muted },
  bookingPrice: { fontSize: 16, fontWeight: "800", color: C.primary, marginTop: 4 },
  payRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  payInput: { flex: 1, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: C.text, fontSize: 13 },
  payBtn: { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center" },
  payBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  chatBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  chatBtnTxt: { fontSize: 13, color: C.text, fontWeight: "600" },
});
