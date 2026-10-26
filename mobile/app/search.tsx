import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };

const CATEGORIES = ["All", "Plumbing", "Electrical", "Tutoring", "Cleaning", "Carpentry", "Painting"];

interface Service {
  id: number;
  title: string;
  description: string;
  location_name: string;
  price: string;
  rating: string;
  reviews_count: number;
  provider: { username: string };
  category: { name: string };
}

export default function SearchScreen() {
  const router = useRouter();
  const { q, category: initCat } = useLocalSearchParams<{ q?: string; category?: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(q || "");
  const [selectedCat, setSelectedCat] = useState(initCat || "");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCat && selectedCat !== "All") params.set("category", selectedCat.toLowerCase());
    api.get(`/services/?${params.toString()}`)
      .then(r => setServices(r.data.results || r.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  const filtered = query
    ? services.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.location_name.toLowerCase().includes(query.toLowerCase()))
    : services;

  const renderStars = (r: number) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

  return (
    <View style={s.screen}>
      {/* Search Input */}
      <View style={s.searchBox}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput style={s.searchInput} value={query} onChangeText={setQuery} placeholder="Search services or location..." placeholderTextColor={C.muted} returnKeyType="search" />
      </View>

      {/* Category Pills */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={s.catList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.catPill, (selectedCat === item || (item === "All" && !selectedCat)) && s.catPillActive]} onPress={() => setSelectedCat(item === "All" ? "" : item.toLowerCase())}>
            <Text style={[s.catPillTxt, (selectedCat === item || (item === "All" && !selectedCat)) && s.catPillActiveTxt]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
          <Text style={s.emptyTitle}>No services found</Text>
          <Text style={s.emptyText}>Try a different category or search term</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/services/${item.id}`)}>
              <Text style={s.cardCat}>{item.category?.name}</Text>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={s.cardLocation}>📍 {item.location_name}</Text>
              <View style={s.cardFooter}>
                <View>
                  <Text style={s.cardStars}>{renderStars(parseFloat(item.rating))}</Text>
                  <Text style={s.cardReviews}>({item.reviews_count} reviews)</Text>
                </View>
                <Text style={s.cardPrice}>KSh {Number(item.price).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  searchBox: { flexDirection: "row", alignItems: "center", margin: 16, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, color: C.text, fontSize: 14, paddingVertical: 13 },
  catList: { maxHeight: 48, flexGrow: 0 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border },
  catPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  catPillTxt: { fontSize: 13, fontWeight: "600", color: C.muted },
  catPillActiveTxt: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: C.muted, textAlign: "center" },
  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, gap: 6 },
  cardCat: { fontSize: 11, fontWeight: "700", color: C.primary, textTransform: "uppercase", letterSpacing: 0.8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  cardDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  cardLocation: { fontSize: 12, color: C.muted },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  cardStars: { fontSize: 13, color: "#F59E0B" },
  cardReviews: { fontSize: 11, color: C.muted },
  cardPrice: { fontSize: 18, fontWeight: "800", color: C.primary },
});
