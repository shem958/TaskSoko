"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import styles from "./page.module.css";

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

const LOCATIONS = [
  "Westlands", "Kilimani", "Karen", "Parklands", "Lavington",
  "South B", "South C", "Eastleigh", "Kasarani", "Roysambu",
  "Ruaka", "Kileleshwa", "Hurlingham", "Lang'ata", "Ngong Road",
];

const STATS = [
  { value: "2,400+", label: "Verified Providers" },
  { value: "18,000+", label: "Services Completed" },
  { value: "4.8★", label: "Average Rating" },
  { value: "47 Areas", label: "Across Nairobi" },
];

interface Service {
  id: number;
  title: string;
  location_name: string;
  price: string;
  rating: string;
  reviews_count: number;
  provider: { username: string };
  category: { name: string; icon?: string };
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [featured, setFeatured] = useState<Service[]>([]);

  useEffect(() => {
    api.get("/services/?ordering=-rating").then(r => setFeatured(r.data.results || r.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    window.location.href = `/search?${params.toString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? "star" : "star-empty"}>★</span>
    ));
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🇰🇪 Nairobi&apos;s #1 Services Marketplace</div>
          <h1 className={styles.heroTitle}>
            Find Trusted Local<br />
            <span className="gradient-text">Experts Near You</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Connect with verified plumbers, electricians, tutors and more across Nairobi.
            Book instantly. Pay securely with M-Pesa.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={styles.searchBar}>
            <div className={styles.searchField}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="What service do you need?"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.searchDivider} />
            <div className={styles.searchField}>
              <span className={styles.searchIcon}>📍</span>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className={styles.searchSelect}
              >
                <option value="">All Nairobi</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.statsStrip}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className={styles.section}>
        <div className="container">
          <p className="section-label">Browse by Category</p>
          <h2 className="section-title">What do you need today?</h2>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map(cat => (
              <Link href={`/search?category=${cat.slug}`} key={cat.slug} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>{cat.icon}</div>
                <div className={styles.categoryName}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ── */}
      {featured.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <p className="section-label">Top Rated</p>
            <h2 className="section-title">Featured Services</h2>
            <div className={styles.servicesGrid}>
              {featured.slice(0, 6).map(svc => (
                <Link href={`/services/${svc.id}`} key={svc.id} className={`card ${styles.serviceCard}`}>
                  <div className={styles.serviceHeader}>
                    <div className={`avatar ${styles.providerAvatar}`}>
                      {svc.provider.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.providerName}>{svc.provider.username}</div>
                      <div className={styles.serviceCategory}>{svc.category?.name}</div>
                    </div>
                  </div>
                  <h3 className={styles.serviceTitle}>{svc.title}</h3>
                  <div className={styles.serviceLocation}>📍 {svc.location_name}</div>
                  <div className={styles.serviceFooter}>
                    <div className={styles.serviceRating}>
                      <div className="stars">{renderStars(parseFloat(svc.rating))}</div>
                      <span className={styles.reviewCount}>({svc.reviews_count})</span>
                    </div>
                    <div className={styles.servicePrice}>KSh {Number(svc.price).toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/search" className="btn btn-outline btn-lg">View All Services →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className={styles.section}>
        <div className="container">
          <p className="section-label">Simple Process</p>
          <h2 className="section-title">How TaskSoko Works</h2>
          <div className={styles.howGrid}>
            {[
              { step: "01", icon: "🔍", title: "Search & Discover", desc: "Browse services by category or location. Filter by ratings, price, and area." },
              { step: "02", icon: "📅", title: "Book Instantly", desc: "Select your time slot and send a booking request to the provider." },
              { step: "03", icon: "💳", title: "Pay with M-Pesa", desc: "Secure payment held in escrow until the job is done to your satisfaction." },
              { step: "04", icon: "⭐", title: "Rate & Review", desc: "Leave honest feedback to help Nairobi's community make better choices." },
            ].map(item => (
              <div key={item.step} className={styles.howCard}>
                <div className={styles.howStep}>{item.step}</div>
                <div className={styles.howIcon}>{item.icon}</div>
                <h3 className={styles.howTitle}>{item.title}</h3>
                <p className={styles.howDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} />
            <h2 className={styles.ctaTitle}>Are you a service provider?</h2>
            <p className={styles.ctaDesc}>Join thousands of professionals growing their business on TaskSoko. Create your profile and start receiving M-Pesa payments today.</p>
            <Link href="/auth/register?role=PROVIDER" className="btn btn-primary btn-lg">
              Join as a Provider →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <p className={styles.footerLogo}>⚡ Task<span style={{ color: "var(--primary)" }}>Soko</span></p>
            <p className={styles.footerText}>Connecting Nairobi, one service at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
