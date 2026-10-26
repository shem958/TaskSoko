"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import styles from "../dashboard.module.css";

interface Booking {
  id: number;
  service: { id: number; title: string; price: string };
  provider: { username: string };
  date_time: string;
  status: string;
  payment_status: string;
}

export default function CustomerDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payPhone, setPayPhone] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMsg, setPayMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user) {
      api.get("/bookings/").then(r => setBookings(r.data.results || r.data)).catch(() => {});
    }
  }, [user, loading, router]);

  const initiatePayment = async (bookingId: number) => {
    setPayingId(bookingId);
    setPayMsg("");
    try {
      await api.post("/payments/initiate/", { booking_id: bookingId, phone_number: payPhone || user?.phone_number });
      setPayMsg("✅ M-Pesa prompt sent to your phone!");
    } catch {
      setPayMsg("❌ Payment initiation failed.");
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { PENDING: "badge-pending", ACCEPTED: "badge-accepted", COMPLETED: "badge-completed", CANCELLED: "badge-cancelled" };
    return `badge ${map[s] || ""}`;
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="section-label">Customer Dashboard</p>
            <h1 className={styles.title}>Welcome, {user?.username}! 👋</h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/search" className="btn btn-primary">Find Services</Link>
            <button onClick={logout} className="btn btn-ghost">Log out</button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{bookings.length}</div>
            <div className={styles.statLabel}>Total Bookings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{bookings.filter(b => b.status === "COMPLETED").length}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{bookings.filter(b => b.status === "PENDING").length}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>
              KSh {bookings.filter(b => b.status === "COMPLETED").reduce((s, b) => s + Number(b.service?.price || 0), 0).toLocaleString()}
            </div>
            <div className={styles.statLabel}>Total Spent</div>
          </div>
        </div>

        {/* ── Bookings ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>My Bookings</h2>
          {bookings.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: 48 }}>📅</div>
              <h3>No bookings yet</h3>
              <p>Find a service and make your first booking!</p>
              <Link href="/search" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
            </div>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map(b => (
                <div key={b.id} className={styles.bookingCard}>
                  <div className={styles.bookingInfo}>
                    <h3 className={styles.bookingTitle}>{b.service?.title || "— Service deleted —"}</h3>
                    <p className={styles.bookingMeta}>Provider: <strong>{b.provider?.username}</strong></p>
                    <p className={styles.bookingMeta}>Date: {new Date(b.date_time).toLocaleString()}</p>
                    <p className={styles.bookingMeta}>Price: <span style={{ color: "var(--primary)", fontWeight: 700 }}>KSh {Number(b.service?.price).toLocaleString()}</span></p>
                  </div>
                  <div className={styles.bookingRight}>
                    <span className={statusBadge(b.status)}>{b.status}</span>
                    {b.status === "ACCEPTED" && b.payment_status === "PENDING" && (
                      <div className={styles.paySection}>
                        <input className="form-input" style={{ fontSize: 13, padding: "8px 12px" }}
                          placeholder="Phone (254...)" value={payingId === b.id ? payPhone : ""}
                          onChange={e => { setPayingId(b.id); setPayPhone(e.target.value); }} />
                        <button className="btn btn-primary btn-sm" onClick={() => initiatePayment(b.id)}>
                          Pay via M-Pesa
                        </button>
                        {payingId === b.id && payMsg && <p style={{ fontSize: 12, color: "var(--primary)" }}>{payMsg}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
