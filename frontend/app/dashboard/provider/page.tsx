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
  customer: { username: string; phone_number: string };
  date_time: string;
  status: string;
  payment_status: string;
  special_instructions: string;
}

const CATEGORIES = [
  { slug: "plumbing", name: "Plumbing" }, { slug: "electrical", name: "Electrical" },
  { slug: "tutoring", name: "Tutoring" }, { slug: "cleaning", name: "Cleaning" },
  { slug: "carpentry", name: "Carpentry" }, { slug: "painting", name: "Painting" },
  { slug: "gardening", name: "Gardening" }, { slug: "security", name: "Security" },
];

const NAIROBI_LOCATIONS = [
  "Westlands", "Kilimani", "Karen", "Parklands", "Lavington",
  "South B", "South C", "Kasarani", "Roysambu", "Ruaka",
];

export default function ProviderDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"bookings" | "services" | "kyc">("bookings");
  const [kycForm, setKycForm] = useState({ id_number: "", business_registration_number: "" });
  const [kycMsg, setKycMsg] = useState("");
  const [svcForm, setSvcForm] = useState({ title: "", description: "", price: "", category_id: "", location_name: NAIROBI_LOCATIONS[0], latitude: "-1.286389", longitude: "36.817223" });
  const [svcMsg, setSvcMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user) {
      api.get("/bookings/").then(r => setBookings(r.data.results || r.data)).catch(() => {});
    }
  }, [user, loading, router]);

  const handleBookingAction = async (id: number, action: "accept" | "complete") => {
    await api.post(`/bookings/${id}/${action}/`);
    setBookings(bks => bks.map(b => b.id === id ? { ...b, status: action === "accept" ? "ACCEPTED" : "COMPLETED" } : b));
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch("/users/kyc/", kycForm);
      setKycMsg("✅ KYC submitted! Awaiting admin approval.");
    } catch { setKycMsg("❌ Submission failed. Try again."); }
  };

  const handleServiceCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/services/", { ...svcForm, price: parseFloat(svcForm.price) });
      setSvcMsg("✅ Service listing created successfully!");
      setSvcForm({ title: "", description: "", price: "", category_id: "", location_name: NAIROBI_LOCATIONS[0], latitude: "-1.286389", longitude: "36.817223" });
    } catch { setSvcMsg("❌ Failed to create service. Ensure your KYC is approved."); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const isKYCApproved = user?.provider_profile?.is_approved;

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { PENDING: "badge-pending", ACCEPTED: "badge-accepted", COMPLETED: "badge-completed", CANCELLED: "badge-cancelled" };
    return `badge ${map[s] || ""}`;
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="section-label">Provider Dashboard</p>
            <h1 className={styles.title}>Welcome, {user?.username}! 🔧</h1>
            {!isKYCApproved && <span className="badge badge-pending" style={{ marginTop: 8 }}>⏳ Pending KYC approval</span>}
            {isKYCApproved && <span className="badge badge-completed" style={{ marginTop: 8 }}>✅ Verified Provider</span>}
          </div>
          <button onClick={logout} className="btn btn-ghost">Log out</button>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{bookings.length}</div>
            <div className={styles.statLabel}>Total Bookings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{bookings.filter(b => b.status === "PENDING").length}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{bookings.filter(b => b.status === "COMPLETED").length}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>
              KSh {bookings.filter(b => b.payment_status === "COMPLETED").reduce((s, b) => s + Number(b.service?.price || 0), 0).toLocaleString()}
            </div>
            <div className={styles.statLabel}>Earnings</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          {(["bookings", "services", "kyc"] as const).map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`} onClick={() => setTab(t)}>
              {t === "bookings" ? "📅 Bookings" : t === "services" ? "🛠 My Services" : "📋 KYC"}
            </button>
          ))}
        </div>

        {/* ── Bookings Tab ── */}
        {tab === "bookings" && (
          <div className={styles.section}>
            {bookings.length === 0 ? (
              <div className={styles.empty}>
                <div style={{ fontSize: 48 }}>📭</div>
                <h3>No bookings yet</h3>
                <p>Once customers book your services, they&apos;ll show up here.</p>
              </div>
            ) : (
              <div className={styles.bookingsList}>
                {bookings.map(b => (
                  <div key={b.id} className={styles.bookingCard}>
                    <div className={styles.bookingInfo}>
                      <h3 className={styles.bookingTitle}>{b.service?.title}</h3>
                      <p className={styles.bookingMeta}>Customer: <strong>{b.customer?.username}</strong> ({b.customer?.phone_number})</p>
                      <p className={styles.bookingMeta}>Date: {new Date(b.date_time).toLocaleString()}</p>
                      {b.special_instructions && <p className={styles.bookingMeta}>Note: {b.special_instructions}</p>}
                      <p className={styles.bookingMeta}>Payment: <span className={`badge ${b.payment_status === "COMPLETED" ? "badge-completed" : "badge-pending"}`}>{b.payment_status}</span></p>
                    </div>
                    <div className={styles.bookingRight}>
                      <span className={statusBadge(b.status)}>{b.status}</span>
                      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                        {b.status === "PENDING" && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleBookingAction(b.id, "accept")}>Accept</button>
                        )}
                        {b.status === "ACCEPTED" && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleBookingAction(b.id, "complete")}>Mark Complete</button>
                        )}
                        <Link href={`/chat/${b.id}`} className="btn btn-ghost btn-sm">💬 Chat</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Services Tab ── */}
        {tab === "services" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Add a New Service</h2>
            {!isKYCApproved && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ Complete KYC first before listing services.</div>}
            {svcMsg && <div className={`alert ${svcMsg.startsWith("✅") ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{svcMsg}</div>}
            <form onSubmit={handleServiceCreate} className={styles.form}>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={svcForm.title} onChange={e => setSvcForm({ ...svcForm, title: e.target.value })} required placeholder="e.g. Professional Plumbing Repair" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={svcForm.category_id} onChange={e => setSvcForm({ ...svcForm, category_id: e.target.value })} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} required placeholder="Describe your service..." />
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Price (KSh)</label>
                  <input className="form-input" type="number" value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} required placeholder="2500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location (Nairobi Area)</label>
                  <select className="form-input" value={svcForm.location_name} onChange={e => setSvcForm({ ...svcForm, location_name: e.target.value })}>
                    {NAIROBI_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={!isKYCApproved}>Create Service Listing</button>
            </form>
          </div>
        )}

        {/* ── KYC Tab ── */}
        {tab === "kyc" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>KYC Verification</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Submit your identity details to become a verified provider on TaskSoko.</p>
            {kycMsg && <div className={`alert ${kycMsg.startsWith("✅") ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{kycMsg}</div>}
            <form onSubmit={handleKYCSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label">National ID Number</label>
                <input className="form-input" value={kycForm.id_number} onChange={e => setKycForm({ ...kycForm, id_number: e.target.value })} required placeholder="12345678" />
              </div>
              <div className="form-group">
                <label className="form-label">Business Registration Number (optional)</label>
                <input className="form-input" value={kycForm.business_registration_number} onChange={e => setKycForm({ ...kycForm, business_registration_number: e.target.value })} placeholder="BUS/2024/001234" />
              </div>
              <button type="submit" className="btn btn-primary">Submit KYC</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
