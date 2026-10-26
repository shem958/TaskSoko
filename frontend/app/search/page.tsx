"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import styles from "./search.module.css";

interface Service {
  id: number;
  title: string;
  description: string;
  location_name: string;
  price: string;
  rating: string;
  reviews_count: number;
  provider: { id: number; username: string };
  category: { name: string; slug: string };
}

const CATEGORIES = [
  { slug: "", name: "All" },
  { slug: "plumbing", name: "Plumbing" },
  { slug: "electrical", name: "Electrical" },
  { slug: "tutoring", name: "Tutoring" },
  { slug: "cleaning", name: "Cleaning" },
  { slug: "carpentry", name: "Carpentry" },
  { slug: "painting", name: "Painting" },
  { slug: "gardening", name: "Gardening" },
  { slug: "security", name: "Security" },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("-rating");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("ordering", sortBy);
    api.get(`/services/?${params.toString()}`)
      .then(r => setServices(r.data.results || r.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [category, sortBy]);

  const renderStars = (r: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(r) ? "star" : "star-empty"}>★</span>
    ));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Find Services in Nairobi</h1>
          <p className={styles.subtitle}>{services.length} services available</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.controls}>
          <div className={styles.filters}>
            {CATEGORIES.map(c => (
              <button key={c.slug} className={`${styles.filterBtn} ${category === c.slug ? styles.filterActive : ""}`}
                onClick={() => setCategory(c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
          <select className="form-input" style={{ width: "auto" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="-rating">Top Rated</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : services.length === 0 ? (
          <div className={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3>No services found</h3>
            <p>Try a different category or location</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {services.map(svc => (
              <Link href={`/services/${svc.id}`} key={svc.id} className={`card ${styles.card}`}>
                <div className={styles.cardCategory}>{svc.category?.name}</div>
                <h3 className={styles.cardTitle}>{svc.title}</h3>
                <p className={styles.cardDesc}>{svc.description.slice(0, 100)}...</p>
                <div className={styles.cardLocation}>📍 {svc.location_name}</div>
                <div className={styles.cardFooter}>
                  <div>
                    <div className="stars">{renderStars(parseFloat(svc.rating))}</div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({svc.reviews_count} reviews)</span>
                  </div>
                  <div className={styles.cardPrice}>KSh {Number(svc.price).toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}
