"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      // wait for user state to update
      setTimeout(() => {
        const role = user?.role;
        router.push(role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer");
      }, 100);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⚡ Task<span style={{ color: "var(--primary)" }}>Soko</span></div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to your TaskSoko account</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="johndoe" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="•••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className={styles.footer}>New to TaskSoko? <Link href="/auth/register">Create account →</Link></p>
      </div>
    </div>
  );
}
