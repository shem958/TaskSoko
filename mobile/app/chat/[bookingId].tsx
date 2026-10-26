import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const C = { primary: "#00C57E", bg: "#0A0F1C", card: "#1A2236", text: "#F0F4FF", muted: "#8B9AB8", border: "rgba(255,255,255,0.07)", elevated: "#1F2D44" };
const WS_URL = "ws://10.0.2.2:8000/ws/chat/";

interface Msg { id?: number; content?: string; message?: string; sender: { id?: number; username?: string } | number; timestamp?: string; }

export default function ChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<FlatList>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get(`/messaging/history/${bookingId}/`);
      setMsgs(res.data || []);
    } catch { /* no history yet */ }
    finally { setLoading(false); }
  }, [bookingId]);

  useEffect(() => {
    loadHistory();
    const ws = new WebSocket(`${WS_URL}${bookingId}/`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMsgs(prev => [...prev, { message: data.message, sender: data.sender_id, timestamp: new Date().toISOString() }]);
    };
    return () => ws.close();
  }, [bookingId, loadHistory]);

  const send = () => {
    if (!input.trim() || !wsRef.current || !user) return;
    wsRef.current.send(JSON.stringify({ message: input, sender_id: user.id }));
    setInput("");
  };

  const isMe = (msg: Msg) => {
    if (typeof msg.sender === "number") return msg.sender === user?.id;
    return msg.sender?.id === user?.id;
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
      <View style={s.status}>
        <Text style={[s.statusDot, { color: connected ? C.primary : C.muted }]}>●</Text>
        <Text style={s.statusTxt}>{connected ? "Connected" : "Connecting..."}</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.primary} /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[s.msgRow, isMe(item) ? s.msgRight : s.msgLeft]}>
              <View style={[s.bubble, isMe(item) ? s.bubbleMine : s.bubbleTheirs]}>
                <Text style={[s.bubbleTxt, isMe(item) && { color: "#fff" }]}>{item.content || item.message}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={s.inputRow}>
        <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor={C.muted} multiline />
        <TouchableOpacity style={[s.sendBtn, (!connected || !input.trim()) && { opacity: 0.4 }]} onPress={send} disabled={!connected || !input.trim()}>
          <Text style={s.sendTxt}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  status: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, paddingHorizontal: 16, backgroundColor: "#111827", borderBottomWidth: 1, borderBottomColor: C.border },
  statusDot: { fontSize: 10 },
  statusTxt: { fontSize: 12, color: C.muted },
  msgRow: { flexDirection: "row" },
  msgLeft: { justifyContent: "flex-start" },
  msgRight: { justifyContent: "flex-end" },
  bubble: { maxWidth: "75%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: C.elevated, borderBottomLeftRadius: 4 },
  bubbleTxt: { fontSize: 14, color: C.text, lineHeight: 20 },
  inputRow: { flexDirection: "row", padding: 12, gap: 8, backgroundColor: "#111827", borderTopWidth: 1, borderTopColor: C.border },
  input: { flex: 1, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14, maxHeight: 90 },
  sendBtn: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 18, justifyContent: "center" },
  sendTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
