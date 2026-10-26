"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import styles from "./auth.module.css";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CUSTOMER";
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", email: "", password: "", phone_number: "", role: defaultRole });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/users/register/", form);
      await login(form.username, form.password);
      router.push(form.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      setError(JSON.stringify(axiosErr?.response?.data || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⚡ Task<span style={{ color: "var(--primary)" }}>Soko</span></div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join thousands on Nairobi&apos;s #1 services platform</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.roleToggle}>
            <button type="button" className={`${styles.roleBtn} ${form.role === "CUSTOMER" ? styles.roleActive : ""}`} onClick={() => setForm({ ...form, role: "CUSTOMER" })}>
              👤 I need services
            </button>
            <button type="button" className={`${styles.roleBtn} ${form.role === "PROVIDER" ? styles.roleActive : ""}`} onClick={() => setForm({ ...form, role: "PROVIDER" })}>
              🔧 I provide services
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="johndoe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone (M-Pesa) e.g. 254712...</label>
            <input className="form-input" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} required placeholder="254712345678" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="•••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.footer}>Already have an account? <Link href="/auth/login">Log in →</Link></p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
