import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };
const STATUS_COLORS: Record<string, string> = { PENDING: "#F59E0B", ACCEPTED: "#3B82F6", COMPLETED: "#00C57E", CANCELLED: "#EF4444" };

interface Booking { id: number; service: { title: string; price: string }; customer: { username: string; phone_number: string }; date_time: string; status: string; payment_status: string; special_instructions: string; }

type TabType = "bookings" | "add_service" | "kyc";

const LOCATIONS = ["Westlands", "Kilimani", "Karen", "Parklands", "South B", "Kasarani", "Roysambu", "Ruaka"];
const CATEGORIES = ["plumbing", "electrical", "tutoring", "cleaning", "carpentry", "painting", "gardening", "security"];

export default function ProviderDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<TabType>("bookings");
  const [kycForm, setKycForm] = useState({ id_number: "", business_registration_number: "" });
  const [svcForm, setSvcForm] = useState({ title: "", description: "", price: "", category_id: "plumbing", location_name: "Westlands", latitude: "-1.286389", longitude: "36.817223" });

  useEffect(() => {
    if (!loading && !user) { router.replace("/auth/login"); return; }
    if (user) {
      api.get("/bookings/").then(r => setBookings(r.data.results || r.data)).catch(() => {}).finally(() => setFetching(false));
    }
  }, [user, loading]);

  const handleBookingAction = async (id: number, action: "accept" | "complete") => {
    await api.post(`/bookings/${id}/${action}/`);
    setBookings(bks => bks.map(b => b.id === id ? { ...b, status: action === "accept" ? "ACCEPTED" : "COMPLETED" } : b));
  };

  const handleKYCSubmit = async () => {
    try {
      await api.patch("/users/kyc/", kycForm);
      Alert.alert("✅ KYC Submitted", "Awaiting admin approval.");
    } catch { Alert.alert("Failed", "KYC submission failed."); }
  };

  const handleServiceCreate = async () => {
    try {
      await api.post("/services/", { ...svcForm, price: parseFloat(svcForm.price) });
      Alert.alert("✅ Service Created!", "Your listing is now live.");
      setSvcForm({ title: "", description: "", price: "", category_id: "plumbing", location_name: "Westlands", latitude: "-1.286389", longitude: "36.817223" });
    } catch { Alert.alert("Failed", "Could not create service. Ensure KYC is approved."); }
  };

  if (loading || fetching) return <View style={[s.screen, s.center]}><ActivityIndicator color={C.primary} size="large" /></View>;

  const isApproved = user?.provider_profile?.is_approved;
  const earnings = bookings.filter(b => b.payment_status === "COMPLETED").reduce((sum, b) => sum + Number(b.service?.price || 0), 0);

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Provider Dashboard 🔧</Text>
          <Text style={s.name}>{user?.username}</Text>
          <View style={[s.badge, { backgroundColor: isApproved ? "#00C57E22" : "#F59E0B22" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: isApproved ? C.primary : "#F59E0B" }}>{isApproved ? "✅ Verified" : "⏳ Pending KYC"}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => { logout(); router.replace("/"); }}>
          <Text style={s.logoutTxt}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[[String(bookings.length), "Total"], [String(bookings.filter(b => b.status === "PENDING").length), "Pending"], [`KSh ${earnings.toLocaleString()}`, "Earned"]].map(([val, lbl]) => (
          <View key={lbl} style={s.statCard}>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(["bookings", "add_service", "kyc"] as TabType[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabActiveTxt]}>{t === "bookings" ? "📅 Bookings" : t === "add_service" ? "🛠 Add Service" : "📋 KYC"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "bookings" && (
        <View style={s.tabContent}>
          {bookings.length === 0 ? (
            <View style={s.empty}><Text style={{ fontSize: 36 }}>📭</Text><Text style={s.emptyTitle}>No bookings yet</Text></View>
          ) : bookings.map(b => (
            <View key={b.id} style={s.bookingCard}>
              <View style={s.bookingHeader}>
                <Text style={s.bookingTitle} numberOfLines={1}>{b.service?.title}</Text>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[b.status] + "22" }]}>
                  <Text style={[s.statusTxt, { color: STATUS_COLORS[b.status] }]}>{b.status}</Text>
                </View>
              </View>
              <Text style={s.bookingMeta}>Customer: {b.customer?.username} · {b.customer?.phone_number}</Text>
              <Text style={s.bookingMeta}>{new Date(b.date_time).toLocaleString()}</Text>
              {b.special_instructions ? <Text style={s.bookingMeta}>Note: {b.special_instructions}</Text> : null}
              <Text style={s.bookingPrice}>KSh {Number(b.service?.price).toLocaleString()}</Text>
              <View style={s.actionRow}>
                {b.status === "PENDING" && <TouchableOpacity style={s.acceptBtn} onPress={() => handleBookingAction(b.id, "accept")}><Text style={s.acceptBtnTxt}>Accept</Text></TouchableOpacity>}
                {b.status === "ACCEPTED" && <TouchableOpacity style={s.completeBtn} onPress={() => handleBookingAction(b.id, "complete")}><Text style={s.completeBtnTxt}>Mark Complete</Text></TouchableOpacity>}
                <TouchableOpacity style={s.chatBtn} onPress={() => router.push(`/chat/${b.id}`)}><Text style={s.chatBtnTxt}>💬 Chat</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {tab === "add_service" && (
        <View style={s.tabContent}>
          {!isApproved && <View style={s.warningBox}><Text style={s.warningTxt}>⚠️ Complete KYC first before listing services.</Text></View>}
          <Text style={s.fieldLabel}>Service Title</Text>
          <TextInput style={s.input} value={svcForm.title} onChangeText={v => setSvcForm({ ...svcForm, title: v })} placeholder="e.g. Professional Plumbing Repair" placeholderTextColor={C.muted} />
          <Text style={s.fieldLabel}>Description</Text>
          <TextInput style={[s.input, { height: 80, textAlignVertical: "top" }]} value={svcForm.description} onChangeText={v => setSvcForm({ ...svcForm, description: v })} placeholder="Describe what you offer..." placeholderTextColor={C.muted} multiline />
          <Text style={s.fieldLabel}>Price (KSh)</Text>
          <TextInput style={s.input} value={svcForm.price} onChangeText={v => setSvcForm({ ...svcForm, price: v })} placeholder="2500" placeholderTextColor={C.muted} keyboardType="numeric" />
          <TouchableOpacity style={[s.acceptBtn, !isApproved && { opacity: 0.5 }]} onPress={handleServiceCreate} disabled={!isApproved}>
            <Text style={s.acceptBtnTxt}>Create Listing</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === "kyc" && (
        <View style={s.tabContent}>
          <Text style={s.fieldLabel}>National ID Number</Text>
          <TextInput style={s.input} value={kycForm.id_number} onChangeText={v => setKycForm({ ...kycForm, id_number: v })} placeholder="12345678" placeholderTextColor={C.muted} keyboardType="numeric" />
          <Text style={s.fieldLabel}>Business Registration (optional)</Text>
          <TextInput style={s.input} value={kycForm.business_registration_number} onChangeText={v => setKycForm({ ...kycForm, business_registration_number: v })} placeholder="BUS/2024/001234" placeholderTextColor={C.muted} />
          <TouchableOpacity style={s.acceptBtn} onPress={handleKYCSubmit}>
            <Text style={s.acceptBtnTxt}>Submit KYC</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, paddingTop: 16, backgroundColor: "#111827", borderBottomWidth: 1, borderBottomColor: C.border },
  greeting: { fontSize: 12, color: C.muted },
  name: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 4 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  logoutBtn: { padding: 8, height: 36, borderRadius: 8, borderWidth: 1, borderColor: C.border, justifyContent: "center" },
  logoutTxt: { fontSize: 12, fontWeight: "600", color: C.muted },
  statsRow: { flexDirection: "row", gap: 10, padding: 16 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: "center" },
  statVal: { fontSize: 14, fontWeight: "800", color: C.primary, marginBottom: 2 },
  statLbl: { fontSize: 10, color: C.muted },
  tabs: { flexDirection: "row", marginHorizontal: 16, backgroundColor: C.elevated, borderRadius: 10, padding: 3, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: C.card },
  tabTxt: { fontSize: 11, fontWeight: "600", color: C.muted },
  tabActiveTxt: { color: C.text },
  tabContent: { paddingHorizontal: 16, gap: 12 },
  bookingCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, gap: 5 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookingTitle: { fontSize: 14, fontWeight: "700", color: C.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusTxt: { fontSize: 10, fontWeight: "700" },
  bookingMeta: { fontSize: 12, color: C.muted },
  bookingPrice: { fontSize: 15, fontWeight: "800", color: C.primary },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  acceptBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  acceptBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  completeBtn: { flex: 1, borderWidth: 1.5, borderColor: C.primary, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  completeBtnTxt: { color: C.primary, fontWeight: "700", fontSize: 13 },
  chatBtn: { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  chatBtnTxt: { color: C.text, fontSize: 13 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: C.elevated, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: C.text, fontSize: 14, marginBottom: 12 },
  warningBox: { backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", padding: 12, marginBottom: 12 },
  warningTxt: { color: "#EF4444", fontSize: 13 },
  empty: { alignItems: "center", padding: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.text },
});
