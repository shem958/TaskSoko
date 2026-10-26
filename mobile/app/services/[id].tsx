import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };

interface Service { id: number; title: string; description: string; location_name: string; price: string; rating: string; reviews_count: number; provider: { id: number; username: string }; category: { name: string }; }
interface Review { id: number; rating: string; comment: string; customer: { username: string }; }

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [svcRes, rvRes] = await Promise.all([api.get(`/services/${id}/`), api.get(`/reviews/?service=${id}`)]);
      setService(svcRes.data);
      setReviews(rvRes.data.results || rvRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleBook = async () => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!bookingDate) { Alert.alert("Date Required", "Please enter your preferred date and time (e.g. 2025-10-15 10:00)"); return; }
    setBookingLoading(true);
    try {
      await api.post("/bookings/", { service_id: service!.id, date_time: bookingDate, special_instructions: instructions });
      Alert.alert("✅ Booking Sent!", "Your request was sent to the provider. Check your dashboard for updates.", [{ text: "Go to Dashboard", onPress: () => router.push("/dashboard/customer") }]);
    } catch {
      Alert.alert("Failed", "Could not place booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStars = (r: number) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

  if (loading) return <View style={[s.screen, s.center]}><ActivityIndicator color={C.primary} size="large" /></View>;
  if (!service) return <View style={[s.screen, s.center]}><Text style={{ color: C.muted }}>Service not found.</Text></View>;

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.hero}>
        <Text style={s.catLabel}>{service.category?.name}</Text>
        <Text style={s.title}>{service.title}</Text>
        <View style={s.row}>
          <Text style={s.stars}>{renderStars(parseFloat(service.rating))}</Text>
          <Text style={s.ratingTxt}>{service.rating} ({service.reviews_count} reviews)</Text>
        </View>
        <Text style={s.location}>📍 {service.location_name}</Text>
      </View>

      {/* Provider */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Provider</Text>
        <View style={s.providerRow}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{service.provider.username[0].toUpperCase()}</Text></View>
          <Text style={s.providerName}>{service.provider.username}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>About this service</Text>
        <Text style={s.desc}>{service.description}</Text>
      </View>

      {/* Booking */}
      <View style={s.bookingCard}>
        <Text style={s.price}>KSh {Number(service.price).toLocaleString()}</Text>
        <Text style={s.priceLabel}>per service</Text>
        <View style={s.divider} />
        <Text style={s.fieldLabel}>Date & Time (e.g. 2025-10-15 10:00)</Text>
        <TextInput style={s.input} value={bookingDate} onChangeText={setBookingDate} placeholder="2025-10-15 10:00" placeholderTextColor={C.muted} />
        <Text style={s.fieldLabel}>Special instructions (optional)</Text>
        <TextInput style={[s.input, { height: 72, textAlignVertical: "top" }]} value={instructions} onChangeText={setInstructions} placeholder="Describe your requirements..." placeholderTextColor={C.muted} multiline />
        <TouchableOpacity style={[s.bookBtn, bookingLoading && { opacity: 0.6 }]} onPress={handleBook} disabled={bookingLoading}>
          {bookingLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.bookBtnTxt}>{isAuthenticated ? "Request Booking" : "Log In to Book"}</Text>}
        </TouchableOpacity>
        <Text style={s.securedBadge}>💚 Secured by M-Pesa</Text>
      </View>

      {/* Reviews */}
      {reviews.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.map(rv => (
            <View key={rv.id} style={s.reviewCard}>
              <View style={s.row}>
                <View style={[s.avatar, { width: 32, height: 32 }]}><Text style={[s.avatarTxt, { fontSize: 12 }]}>{rv.customer.username[0].toUpperCase()}</Text></View>
                <View>
                  <Text style={s.reviewUser}>{rv.customer.username}</Text>
                  <Text style={{ color: "#F59E0B", fontSize: 12 }}>{renderStars(parseFloat(rv.rating))}</Text>
                </View>
              </View>
              <Text style={s.reviewComment}>{rv.comment}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", justifyContent: "center" },
  hero: { padding: 20, paddingTop: 16, backgroundColor: "#111827", borderBottomWidth: 1, borderBottomColor: C.border },
  catLabel: { fontSize: 11, fontWeight: "700", color: C.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  stars: { color: "#F59E0B", fontSize: 14 },
  ratingTxt: { fontSize: 13, color: C.muted },
  location: { fontSize: 13, color: C.muted },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text, marginBottom: 12 },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 16, fontWeight: "700", color: "#fff" },
  providerName: { fontSize: 16, fontWeight: "600", color: C.text },
  desc: { fontSize: 14, color: C.muted, lineHeight: 22 },
  bookingCard: { margin: 16, padding: 20, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  price: { fontSize: 32, fontWeight: "800", color: C.primary },
  priceLabel: { fontSize: 12, color: C.muted, marginBottom: 4 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: C.elevated, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: C.text, fontSize: 14, marginBottom: 4 },
  bookBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  bookBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  securedBadge: { textAlign: "center", color: C.muted, fontSize: 12, marginTop: 10 },
  reviewCard: { backgroundColor: C.elevated, borderRadius: 10, padding: 14, marginBottom: 10, gap: 8 },
  reviewUser: { fontSize: 13, fontWeight: "600", color: C.text },
  reviewComment: { fontSize: 13, color: C.muted, lineHeight: 18 },
});
