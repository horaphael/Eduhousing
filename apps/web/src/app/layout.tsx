"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const SEED_USERS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Alice Martin" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Bob Dupont" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Charlie Durand" },
];

const STORAGE_KEY = "eduhousing_user_id";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      setUserId(localStorage.getItem(STORAGE_KEY) || "");
    } catch {
      /* noop */
    }
  }, []);

  function handleUserChange(uid: string) {
    setUserId(uid);
    setMenuOpen(false);
    try {
      if (uid) localStorage.setItem(STORAGE_KEY, uid);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }

  const currentUser = SEED_USERS.find((u) => u.id === userId);
  const initials = currentUser
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : null;

  return (
    <html lang="fr">
      <body>
        <header className="header">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              <Image src="/logo.png" alt="EduHousing" width={140} height={52} priority style={{ objectFit: "contain" }} />
            </Link>

            <nav className="header-nav">
              <Link href="/" className="nav-link">Rechercher</Link>
              <Link href="/publier" className="nav-link">Publier une annonce</Link>
              <a href="#" onClick={(e) => e.preventDefault()} className="nav-link">Aide</a>
              {currentUser ? (
                <Link href="/mes-annonces" className="nav-link">Mes annonces</Link>
              ) : (
                <span className="nav-link nav-link-cta" style={{ cursor: "pointer" }} onClick={() => setMenuOpen((o) => !o)}>
                  Se connecter
                </span>
              )}
            </nav>

            <div className="header-user">
              <button
                className="avatar-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu utilisateur"
              >
                {initials ? (
                  <span className="avatar-initials">{initials}</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </button>
              {menuOpen && (
                <>
                  <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                  <div className="user-menu">
                    <div className="user-menu-label">Changer de profil</div>
                    <button
                      className={`user-menu-item ${!userId ? "active" : ""}`}
                      onClick={() => handleUserChange("")}
                    >
                      Visiteur
                    </button>
                    {SEED_USERS.map((u) => (
                      <button
                        key={u.id}
                        className={`user-menu-item ${userId === u.id ? "active" : ""}`}
                        onClick={() => handleUserChange(u.id)}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">{children}</div>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-col">
              <h4>EduHousing</h4>
              <p>La plateforme de logement etudiant simple et transparente.</p>
            </div>
            <div className="footer-col">
              <h4>Explorer</h4>
              <Link href="/">Toutes les annonces</Link>
              <Link href="/publier">Publier une annonce</Link>
              <a href="#" onClick={(e) => e.preventDefault()}>Comment ca marche</a>
            </div>
            <div className="footer-col">
              <h4>Villes populaires</h4>
              <a href="/?ville=Montpellier">Montpellier</a>
              <a href="/?ville=Paris">Paris</a>
              <a href="/?ville=Lyon">Lyon</a>
              <a href="/?ville=Toulouse">Toulouse</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#" onClick={(e) => e.preventDefault()}>Centre d&apos;aide</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Nous contacter</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Mentions legales</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 EduHousing. Tous droits reserves.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
