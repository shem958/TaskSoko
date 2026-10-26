"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import styles from "./service.module.css";

interface Service {
  id: number;
  title: string;
  description: string;
  location_name: string;
  latitude: string;
  longitude: string;
  price: string;
  rating: string;
  reviews_count: number;
  provider: { id: number; username: string; email: string };
  category: { name: string };
}

interface Review {
  id: number;
  rating: string;
  comment: string;
  customer: { username: string };
  created_at: string;
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const load = useCallback(async () => {
    try {
      const [svcRes, rvRes] = await Promise.all([
        api.get(`/services/${id}/`),
        api.get(`/reviews/?service=${id}`),
      ]);
      setService(svcRes.data);
      setReviews(rvRes.data.results || rvRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    setBookingLoading(true);
    setBookingError("");
    try {
      await api.post("/bookings/", { service_id: service!.id, date_time: bookingDate, special_instructions: instructions });
      setBookingSuccess(true);
    } catch {
      setBookingError("Could not place booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStars = (r: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(r) ? "star" : "star-empty"}>★</span>
    ));

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!service) return <div style={{ padding: 80, textAlign: "center" }}>Service not found.</div>;

  const isOwnService = user?.id === service.provider.id;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* ── Main Content ── */}
          <div className={styles.main}>
            <div className={styles.breadcrumb}>
              <a href="/search">Services</a> / <span>{service.category?.name}</span>
            </div>

            <h1 className={styles.title}>{service.title}</h1>

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <div className="stars">{renderStars(parseFloat(service.rating))}</div>
                <span>{service.rating} ({service.reviews_count} reviews)</span>
              </div>
              <div className={styles.metaItem}>📍 {service.location_name}</div>
              <div className={styles.metaItem}>🏷️ {service.category?.name}</div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>About this service</h2>
              <p className={styles.desc}>{service.description}</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Provider</h2>
              <div className={styles.providerCard}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: 22 }}>
                  {service.provider.username[0].toUpperCase()}
                </div>
                <div>
                  <div className={styles.providerName}>{service.provider.username}</div>
                  <div className={styles.providerEmail}>{service.provider.email}</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <div className={styles.mapPlaceholder}>
                📍 <strong>{service.location_name}</strong><br />
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  {service.latitude}, {service.longitude}
                </span>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Reviews ({reviews.length})</h2>
                <div className={styles.reviews}>
                  {reviews.map(rv => (
                    <div key={rv.id} className={styles.review}>
                      <div className={styles.reviewHeader}>
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                          {rv.customer.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.reviewUser}>{rv.customer.username}</div>
                          <div className="stars">{renderStars(parseFloat(rv.rating))}</div>
                        </div>
                      </div>
                      <p className={styles.reviewComment}>{rv.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Booking Sidebar ── */}
          <div className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.price}>KSh {Number(service.price).toLocaleString()}</div>
              <div className={styles.priceLabel}>per service</div>

              <div className="divider" />

              {bookingSuccess ? (
                <div className="alert alert-success">
                  ✅ Booking request sent! Check your dashboard for updates.
                </div>
              ) : isOwnService ? (
                <div className="alert alert-error">This is your own service listing.</div>
              ) : (
                <form onSubmit={handleBook} className={styles.bookForm}>
                  <div className="form-group">
                    <label className="form-label">Select Date & Time</label>
                    <input className="form-input" type="datetime-local" value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special instructions (optional)</label>
                    <textarea className="form-input" rows={3} value={instructions}
                      onChange={e => setInstructions(e.target.value)} placeholder="Describe your requirements..." />
                  </div>

                  {bookingError && <div className="alert alert-error">{bookingError}</div>}

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
                    disabled={bookingLoading}>
                    {isAuthenticated ? (bookingLoading ? "Sending..." : "Request Booking") : "Log in to Book"}
                  </button>
                </form>
              )}

              <div className={styles.paymentBadge}>💚 Secured by M-Pesa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
