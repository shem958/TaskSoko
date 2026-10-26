"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const dashboardHref = user?.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer";

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span>Task<span className={styles.logoAccent}>Soko</span></span>
        </Link>

        <div className={styles.links}>
          <Link href="/search" className={styles.link}>Find Services</Link>
        </div>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link href={dashboardHref} className="btn btn-ghost btn-sm">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Log out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
