"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchMyListings,
  deleteListing,
  type ListingWithPhotos,
} from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  published: "Publie",
  rented: "Loue",
  archived: "Archive",
};

export default function MesAnnonces() {
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyListings()
      .then(setListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  if (loading) return <main><p className="loading">Chargement...</p></main>;
  if (error) return <main><div className="error-box">{error}</div></main>;

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Mes annonces</h1>
      {listings.length === 0 ? (
        <p>
          Aucune annonce.{" "}
          <Link href="/publier">Publier une annonce</Link>
        </p>
      ) : (
        <table className="my-listings-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Ville</th>
              <th>Loyer</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link href={`/annonces/${l.id}`}>{l.title}</Link>
                </td>
                <td>{l.city}</td>
                <td>{(l.rent_cents / 100).toFixed(0)} &euro;</td>
                <td>
                  <span className={`badge badge-${l.status}`}>
                    {STATUS_LABELS[l.status] ?? l.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <Link
                      href={`/annonces/${l.id}/modifier`}
                      className="btn btn-secondary btn-sm"
                    >
                      Modifier
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(l.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
