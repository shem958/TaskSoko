import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const COLORS = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)" };

const CATEGORIES = [
  { slug: "plumbing", name: "Plumbing", icon: "🔧" },
  { slug: "electrical", name: "Electrical", icon: "⚡" },
  { slug: "tutoring", name: "Tutoring", icon: "📚" },
  { slug: "cleaning", name: "Cleaning", icon: "🧹" },
  { slug: "carpentry", name: "Carpentry", icon: "🪚" },
  { slug: "painting", name: "Painting", icon: "🎨" },
  { slug: "gardening", name: "Gardening", icon: "🌿" },
  { slug: "security", name: "Security", icon: "🛡️" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    router.push({ pathname: "/search", params: { q: query } });
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.logo}>⚡ Task<Text style={s.logoAccent}>Soko</Text></Text>
          <Text style={s.tagline}>Nairobi's #1 Services Platform 🇰🇪</Text>
        </View>
        <TouchableOpacity
          style={s.authBtn}
          onPress={() => router.push(isAuthenticated ? (user?.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer") : "/auth/login")}
        >
          <Text style={s.authBtnText}>{isAuthenticated ? "My Dashboard" : "Log In"}</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>Find Trusted Local{"\n"}<Text style={s.heroAccent}>Experts Near You</Text></Text>
        <Text style={s.heroSub}>Book verified plumbers, electricians, tutors & more. Pay securely with M-Pesa.</Text>

        {/* Search Bar */}
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="What service do you need?"
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={s.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[["2,400+", "Providers"], ["18k+", "Completed"], ["4.8★", "Rating"], ["47", "Areas"]].map(([val, label]) => (
          <View key={label} style={s.statItem}>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <Text style={s.sectionLabel}>BROWSE BY CATEGORY</Text>
      <Text style={s.sectionTitle}>What do you need today?</Text>
      <View style={s.categoriesGrid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.slug}
            style={s.catCard}
            onPress={() => router.push({ pathname: "/search", params: { category: cat.slug } })}
          >
            <Text style={s.catIcon}>{cat.icon}</Text>
            <Text style={s.catName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <View style={s.ctaCard}>
        <Text style={s.ctaTitle}>Are you a service provider?</Text>
        <Text style={s.ctaSub}>Join thousands growing their business on TaskSoko.</Text>
        <TouchableOpacity style={s.ctaBtn} onPress={() => router.push({ pathname: "/auth/register", params: { role: "PROVIDER" } })}>
          <Text style={s.ctaBtnText}>Join as a Provider →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 56 },
  logo: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  logoAccent: { color: COLORS.primary },
  tagline: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  authBtn: { backgroundColor: "#1A2236", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  authBtnText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  hero: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: "#111827" },
  heroTitle: { fontSize: 28, fontWeight: "900", color: COLORS.text, lineHeight: 34, marginBottom: 10 },
  heroAccent: { color: COLORS.primary },
  heroSub: { fontSize: 14, color: COLORS.muted, lineHeight: 20, marginBottom: 20 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A2236", borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 14 },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", padding: 20, backgroundColor: "#111827", borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  statItem: { alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: COLORS.primary, letterSpacing: 1.5, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, paddingHorizontal: 20, marginBottom: 16 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8 },
  catCard: { width: "22%", backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", padding: 12, gap: 6 },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 10, fontWeight: "600", color: COLORS.muted, textAlign: "center" },
  ctaCard: { margin: 20, backgroundColor: "rgba(0,197,126,0.08)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,197,126,0.25)", padding: 24, alignItems: "center" },
  ctaTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, textAlign: "center", marginBottom: 8 },
  ctaSub: { fontSize: 13, color: COLORS.muted, textAlign: "center", marginBottom: 16 },
  ctaBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
