"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchListing, photoUrl, type ListingWithPhotos } from "@/lib/api";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchListing(id)
      .then(setListing)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main><p className="loading">Chargement...</p></main>;
  if (error) return <main><div className="error-box">{error}</div></main>;
  if (!listing) return <main><p>Annonce introuvable.</p></main>;

  const photos = listing.photos ?? [];

  return (
    <main>
      <Link href="/" style={{ display: "inline-block", marginBottom: "1rem" }}>
        &larr; Retour
      </Link>
      <div className="listing-detail">
        <h1>{listing.title}</h1>
        <div className="meta">
          <span>{(listing.rent_cents / 100).toFixed(0)} &euro;/mois</span>
          {listing.charges_cents > 0 && (
            <span>+ {(listing.charges_cents / 100).toFixed(0)} &euro; charges</span>
          )}
          <span>{listing.city} ({listing.postal_code})</span>
          <span>{listing.housing_type}</span>
          {listing.furnished && <span>Meuble</span>}
          {listing.surface_m2 && <span>{listing.surface_m2} m&sup2;</span>}
          {listing.dpe_grade && <span>DPE {listing.dpe_grade}</span>}
          <span>Dispo {listing.available_from}</span>
          {listing.available_until && (
            <span>jusqu&apos;au {listing.available_until}</span>
          )}
        </div>

        {photos.length > 0 && (
          <div className="photos-gallery">
            {photos.map((p) => (
              <img key={p.id} src={photoUrl(p.url)} alt={listing.title} />
            ))}
          </div>
        )}

        <div className="description">{listing.description}</div>

        <p style={{ color: "#888", fontSize: "0.85rem" }}>
          {listing.address_line}, {listing.city} {listing.postal_code}
          {listing.deposit_cents > 0 && (
            <> &middot; Depot : {(listing.deposit_cents / 100).toFixed(0)} &euro;</>
          )}
        </p>
      </div>
    </main>
  );
}
