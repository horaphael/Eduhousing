"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchListings, photoUrl, type ListingWithPhotos } from "@/lib/api";

export default function Home() {
  return (
    <Suspense fallback={<main><p className="loading">Chargement...</p></main>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("ville") ?? "";

  const [city, setCity] = useState(initialCity);
  const [searchedCity, setSearchedCity] = useState(initialCity);
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doSearch = useCallback((q: string) => {
    setLoading(true);
    setError("");
    setSearchedCity(q);
    fetchListings(q || undefined)
      .then(setListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    doSearch(initialCity);
  }, [initialCity, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed) {
      router.push(`/?ville=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
    doSearch(trimmed);
  }

  function clearSearch() {
    setCity("");
    router.push("/");
    doSearch("");
  }

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Annonces publiees</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ex : Montpellier"
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
            width: "250px",
          }}
        />
        <button type="submit" className="btn btn-primary">
          Rechercher
        </button>
      </form>

      {loading ? (
        <p className="loading">Chargement...</p>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <>
          {searchedCity && (
            <p style={{ marginBottom: "1rem" }}>
              {listings.length > 0
                ? `${listings.length} annonce${listings.length > 1 ? "s" : ""} a ${searchedCity}`
                : `Aucune annonce pour \u00ab\u00a0${searchedCity}\u00a0\u00bb pour l\u2019instant.`}
              {listings.length === 0 && (
                <>
                  {" "}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={clearSearch}
                  >
                    Voir toutes les annonces
                  </button>
                </>
              )}
            </p>
          )}
          {!searchedCity && listings.length === 0 && (
            <p>Aucune annonce pour le moment.</p>
          )}
          {listings.length > 0 && (
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
        </>
      )}
    </main>
  );
}
