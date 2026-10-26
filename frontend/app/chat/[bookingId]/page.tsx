"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import styles from "./chat.module.css";

interface Message { message: string; sender_id: number; }
interface StoredMsg { id: number; content: string; sender: { id: number; username: string }; timestamp: string; }

export default function ChatPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<StoredMsg[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get(`/messaging/history/${bookingId}/`);
      setHistory(res.data);
    } catch { /* no history endpoint yet */ }
  }, [bookingId]);

  useEffect(() => {
    loadHistory();
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${bookingId}/`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, data]);
    };
    return () => ws.close();
  }, [bookingId, loadHistory]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, history]);

  const send = () => {
    if (!input.trim() || !wsRef.current || !user) return;
    wsRef.current.send(JSON.stringify({ message: input, sender_id: user.id }));
    setInput("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>💬 Booking Chat #{bookingId}</h1>
        <span className={`${styles.status} ${connected ? styles.connected : styles.disconnected}`}>
          {connected ? "● Online" : "○ Reconnecting..."}
        </span>
      </div>

      <div className={styles.messages}>
        {history.map(m => (
          <div key={m.id} className={`${styles.msg} ${m.sender.id === user?.id ? styles.mine : styles.theirs}`}>
            <div className={styles.bubble}>{m.content}</div>
            <div className={styles.timestamp}>{new Date(m.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        {messages.map((m, i) => (
          <div key={`live-${i}`} className={`${styles.msg} ${m.sender_id === user?.id ? styles.mine : styles.theirs}`}>
            <div className={styles.bubble}>{m.message}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <input className={`form-input ${styles.chatInput}`} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..." />
        <button className="btn btn-primary" onClick={send} disabled={!connected}>Send</button>
      </div>
    </div>
  );
}
