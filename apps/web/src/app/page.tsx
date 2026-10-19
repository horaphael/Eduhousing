"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchListings, photoUrl, type ListingWithPhotos } from "@/lib/api";

export default function Home() {
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main><p className="loading">Chargement...</p></main>;
  if (error) return <main><div className="error-box">{error}</div></main>;

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Annonces publiees</h1>
      {listings.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <div className="listings-grid">
          {listings.map((l) => {
            const photo = (l.photos ?? [])[0];
            return (
              <Link
                href={`/annonces/${l.id}`}
                key={l.id}
                className="listing-card"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {photo ? (
                  <img src={photoUrl(photo.url)} alt={l.title} />
                ) : (
                  <div className="no-photo-placeholder">Pas de photo</div>
                )}
                <div className="card-body">
                  <h3>{l.title}</h3>
                  <span className="price">
                    {(l.rent_cents / 100).toFixed(0)} &euro;/mois
                  </span>
                  <br />
                  <span className="city">{l.city}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
