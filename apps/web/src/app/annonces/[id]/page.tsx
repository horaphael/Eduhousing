"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchListing, photoUrl, type ListingWithPhotos } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  studio: "Studio",
  t1: "T1",
  t2: "T2",
  t3_plus: "T3+",
  shared_room: "Colocation",
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchListing(id)
      .then(setListing)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <main className="container">
        <div className="loading-section">
          <div className="spinner" />
          <p>Chargement...</p>
        </div>
      </main>
    );
  if (error)
    return (
      <main className="container">
        <div className="error-box">{error}</div>
      </main>
    );
  if (!listing)
    return (
      <main className="container">
        <div className="empty-state">
          <h3>Annonce introuvable</h3>
          <Link href="/" className="btn btn-primary">Retour aux annonces</Link>
        </div>
      </main>
    );

  const photos = listing.photos ?? [];

  return (
    <main className="container">
      <Link href="/" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Retour aux annonces
      </Link>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="detail-gallery">
          <div className="gallery-main">
            <img src={photoUrl(photos[activePhoto].url)} alt={listing.title} />
          </div>
          {photos.length > 1 && (
            <div className="gallery-thumbs">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  className={`gallery-thumb ${i === activePhoto ? "active" : ""}`}
                  onClick={() => setActivePhoto(i)}
                >
                  <img src={photoUrl(p.url)} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-title-row">
            <div>
              <h1>{listing.title}</h1>
              <p className="detail-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {listing.address_line}, {listing.city} {listing.postal_code}
              </p>
            </div>
          </div>

          <div className="detail-tags">
            <span className="tag">{TYPE_LABELS[listing.housing_type] || listing.housing_type}</span>
            {listing.furnished && <span className="tag tag-furnished">Meuble</span>}
            {listing.surface_m2 && <span className="tag">{listing.surface_m2} m&sup2;</span>}
            {listing.dpe_grade && <span className="tag tag-dpe">DPE {listing.dpe_grade}</span>}
          </div>

          <div className="detail-section">
            <h2>Description</h2>
            <p className="detail-description">{listing.description}</p>
          </div>

          <div className="detail-section">
            <h2>Disponibilite</h2>
            <p>
              A partir du <strong>{listing.available_from}</strong>
              {listing.available_until && (
                <> jusqu&apos;au <strong>{listing.available_until}</strong></>
              )}
            </p>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="price-card">
            <div className="price-main">
              {(listing.rent_cents / 100).toFixed(0)} &euro;
              <span>/mois</span>
            </div>
            {listing.charges_cents > 0 && (
              <div className="price-line">
                <span>Charges</span>
                <span>{(listing.charges_cents / 100).toFixed(0)} &euro;/mois</span>
              </div>
            )}
            <div className="price-line">
              <span>Depot de garantie</span>
              <span>{(listing.deposit_cents / 100).toFixed(0)} &euro;</span>
            </div>
            <div className="price-line price-total">
              <span>Total mensuel</span>
              <span>{((listing.rent_cents + listing.charges_cents) / 100).toFixed(0)} &euro;</span>
            </div>
            <button className="btn btn-accent btn-full" onClick={() => alert("Messagerie bientot disponible !")}>
              Contacter le proprietaire
            </button>
            <button className="btn btn-outline btn-full" onClick={() => alert("Fonctionnalite bientot disponible !")}>
              Ajouter aux favoris
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
