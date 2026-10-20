"use client";

import { useRef, useState } from "react";
import type { ListingPhoto } from "@eduhousing/shared";
import { photoUrl, deletePhoto, uploadPhotos } from "@/lib/api";

export interface ListingFormData {
  title: string;
  description: string;
  housing_type: string;
  furnished: boolean;
  rent: string;
  charges: string;
  deposit: string;
  surface_m2: string;
  address_line: string;
  city: string;
  postal_code: string;
  available_from: string;
  available_until: string;
  dpe_grade: string;
}

const EMPTY: ListingFormData = {
  title: "",
  description: "",
  housing_type: "studio",
  furnished: false,
  rent: "",
  charges: "",
  deposit: "",
  surface_m2: "",
  address_line: "",
  city: "",
  postal_code: "",
  available_from: "",
  available_until: "",
  dpe_grade: "",
};

interface Props {
  initial?: ListingFormData;
  existingPhotos?: ListingPhoto[];
  listingId?: string;
  isEdit?: boolean;
  onSubmit: (
    data: Record<string, unknown>,
    status: string,
  ) => Promise<string | void>;
  onReload?: () => Promise<void>;
}

export function formDataFromListing(l: {
  title: string;
  description: string;
  housing_type: string;
  furnished: boolean;
  rent_cents: number;
  charges_cents: number;
  deposit_cents: number;
  surface_m2: number | null;
  address_line: string;
  city: string;
  postal_code: string;
  available_from: string;
  available_until: string | null;
  dpe_grade: string | null;
}): ListingFormData {
  return {
    title: l.title,
    description: l.description,
    housing_type: l.housing_type,
    furnished: l.furnished,
    rent: (l.rent_cents / 100).toString(),
    charges: (l.charges_cents / 100).toString(),
    deposit: (l.deposit_cents / 100).toString(),
    surface_m2: l.surface_m2?.toString() ?? "",
    address_line: l.address_line,
    city: l.city,
    postal_code: l.postal_code,
    available_from: l.available_from,
    available_until: l.available_until ?? "",
    dpe_grade: l.dpe_grade ?? "",
  };
}

export default function ListingForm({
  initial,
  existingPhotos = [],
  listingId,
  isEdit = false,
  onSubmit,
  onReload,
}: Props) {
  const [form, setForm] = useState<ListingFormData>(initial ?? EMPTY);
  const [photos, setPhotos] = useState<ListingPhoto[]>(existingPhotos);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof ListingFormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function buildPayload(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    if (!isEdit || form.title !== (initial?.title ?? ""))
      data.title = form.title;
    if (!isEdit || form.description !== (initial?.description ?? ""))
      data.description = form.description;
    if (!isEdit || form.housing_type !== (initial?.housing_type ?? ""))
      data.housing_type = form.housing_type;
    if (!isEdit || form.furnished !== (initial?.furnished ?? false))
      data.furnished = form.furnished;
    if (!isEdit || form.rent !== (initial?.rent ?? ""))
      data.rent_cents = Math.round(parseFloat(form.rent) * 100);
    if (!isEdit || form.charges !== (initial?.charges ?? ""))
      data.charges_cents = Math.round(parseFloat(form.charges || "0") * 100);
    if (!isEdit || form.deposit !== (initial?.deposit ?? ""))
      data.deposit_cents = Math.round(parseFloat(form.deposit || "0") * 100);
    if (!isEdit || form.surface_m2 !== (initial?.surface_m2 ?? ""))
      data.surface_m2 = form.surface_m2
        ? parseFloat(form.surface_m2)
        : undefined;
    if (!isEdit || form.address_line !== (initial?.address_line ?? ""))
      data.address_line = form.address_line;
    if (!isEdit || form.city !== (initial?.city ?? ""))
      data.city = form.city;
    if (!isEdit || form.postal_code !== (initial?.postal_code ?? ""))
      data.postal_code = form.postal_code;
    if (!isEdit || form.available_from !== (initial?.available_from ?? ""))
      data.available_from = form.available_from;
    if (
      !isEdit ||
      form.available_until !== (initial?.available_until ?? "")
    )
      data.available_until = form.available_until || undefined;
    if (!isEdit || form.dpe_grade !== (initial?.dpe_grade ?? ""))
      data.dpe_grade = form.dpe_grade || undefined;

    // For create, always include all required fields
    if (!isEdit) {
      data.title = form.title;
      data.description = form.description;
      data.housing_type = form.housing_type;
      data.rent_cents = Math.round(parseFloat(form.rent) * 100);
      data.address_line = form.address_line;
      data.city = form.city;
      data.postal_code = form.postal_code;
      data.available_from = form.available_from;
    }

    return data;
  }

  async function handleSubmit(status: string) {
    setError("");
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const hasFields = Object.keys(payload).length > 0 || status !== "";
      const hasFiles = files.length > 0;

      if (!hasFields && !hasFiles) {
        throw new Error("Aucune modification a enregistrer");
      }

      let createdId: string | void = undefined;
      if (hasFields || !isEdit) {
        createdId = await onSubmit(payload, status);
      }

      const targetId = createdId || listingId;
      if (hasFiles && targetId) {
        await uploadPhotos(targetId, files);
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      if (onReload) {
        await onReload();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!listingId) return;
    try {
      await deletePhoto(listingId, photoId);
      setPhotos((p) => p.filter((ph) => ph.id !== photoId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="form-group">
        <label>Titre</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="3 a 120 caracteres"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="10 a 5000 caracteres"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type de logement</label>
          <select
            value={form.housing_type}
            onChange={(e) => set("housing_type", e.target.value)}
          >
            <option value="studio">Studio</option>
            <option value="t1">T1</option>
            <option value="t2">T2</option>
            <option value="t3_plus">T3+</option>
            <option value="shared_room">Chambre partagee</option>
          </select>
        </div>
        <div className="form-group">
          <label>Meuble</label>
          <select
            value={form.furnished ? "true" : "false"}
            onChange={(e) => set("furnished", e.target.value === "true")}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Loyer (euros)</label>
          <input
            type="number"
            step="0.01"
            value={form.rent}
            onChange={(e) => set("rent", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Charges (euros)</label>
          <input
            type="number"
            step="0.01"
            value={form.charges}
            onChange={(e) => set("charges", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Depot de garantie (euros)</label>
          <input
            type="number"
            step="0.01"
            value={form.deposit}
            onChange={(e) => set("deposit", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Surface (m2)</label>
          <input
            type="number"
            step="0.1"
            value={form.surface_m2}
            onChange={(e) => set("surface_m2", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>DPE</label>
          <select
            value={form.dpe_grade}
            onChange={(e) => set("dpe_grade", e.target.value)}
          >
            <option value="">--</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Adresse</label>
        <input
          value={form.address_line}
          onChange={(e) => set("address_line", e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ville</label>
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Code postal</label>
          <input
            value={form.postal_code}
            onChange={(e) => set("postal_code", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Disponible a partir du</label>
          <input
            type="date"
            value={form.available_from}
            onChange={(e) => set("available_from", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Disponible jusqu&apos;au (optionnel)</label>
          <input
            type="date"
            value={form.available_until}
            onChange={(e) => set("available_until", e.target.value)}
          />
        </div>
      </div>

      {/* Existing photos */}
      {photos.length > 0 && (
        <div className="form-group">
          <label>Photos existantes</label>
          <div className="photo-list">
            {photos.map((p) => (
              <div className="photo-item" key={p.id}>
                <img src={photoUrl(p.url)} alt="" />
                <button
                  type="button"
                  className="delete-photo"
                  onClick={() => handleDeletePhoto(p.id)}
                  title="Supprimer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New photos */}
      <div className="form-group">
        <label>Ajouter des photos (JPEG, PNG, WebP, max 5 Mo)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </div>

      {/* Status selector for edit mode */}
      {isEdit && (
        <div className="form-group">
          <label>Statut</label>
          <select
            id="edit-status"
            defaultValue=""
          >
            <option value="">Ne pas changer</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publie</option>
            <option value="rented">Loue</option>
            <option value="archived">Archive</option>
          </select>
        </div>
      )}

      <div className="actions" style={{ marginTop: "1rem" }}>
        {isEdit ? (
          <button
            className="btn btn-primary"
            disabled={submitting}
            onClick={() => {
              const sel = document.getElementById(
                "edit-status",
              ) as HTMLSelectElement | null;
              const status = sel?.value || "";
              handleSubmit(status);
            }}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        ) : (
          <>
            <button
              className="btn btn-primary"
              disabled={submitting}
              onClick={() => handleSubmit("published")}
            >
              {submitting ? "Publication..." : "Publier"}
            </button>
            <button
              className="btn btn-secondary"
              disabled={submitting}
              onClick={() => handleSubmit("draft")}
            >
              Enregistrer en brouillon
            </button>
          </>
        )}
      </div>
    </div>
  );
}
