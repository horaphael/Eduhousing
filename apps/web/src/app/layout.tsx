"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";

const SEED_USERS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Alice" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Bob" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Charlie" },
];

const STORAGE_KEY = "eduhousing_user_id";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    try {
      setUserId(localStorage.getItem(STORAGE_KEY) || "");
    } catch {
      /* noop */
    }
  }, []);

  function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setUserId(val);
    try {
      if (val) localStorage.setItem(STORAGE_KEY, val);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }

  return (
    <html lang="fr">
      <body>
        <header className="header">
          <Link href="/" className="header-logo">
            EduHousing
          </Link>
          <nav>
            <Link href="/">Annonces</Link>
            <Link href="/mes-annonces">Mes annonces</Link>
            <Link href="/publier">Publier</Link>
          </nav>
          <div className="user-select">
            <label htmlFor="user-picker">Je suis :</label>
            <select
              id="user-picker"
              value={userId}
              onChange={handleUserChange}
            >
              <option value="">-- personne --</option>
              {SEED_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
