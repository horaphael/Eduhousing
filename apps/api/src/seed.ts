import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Users
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
        ('a0000000-0000-0000-0000-000000000001', 'alice@edu.fr',   '$2b$10$placeholder', 'Alice',  'Martin',  'student'),
        ('a0000000-0000-0000-0000-000000000002', 'bob@edu.fr',     '$2b$10$placeholder', 'Bob',    'Dupont',  'student'),
        ('a0000000-0000-0000-0000-000000000003', 'charlie@edu.fr', '$2b$10$placeholder', 'Charlie','Durand',  'owner'),
        ('a0000000-0000-0000-0000-000000000004', 'admin@edu.fr',   '$2b$10$placeholder', 'Admin',  'Eduhousing', 'admin')
      ON CONFLICT DO NOTHING
    `);

    // Listings
    await client.query(`
      INSERT INTO listings (id, author_id, title, description, housing_type, furnished, rent_cents, charges_cents, deposit_cents, surface_m2, address_line, city, postal_code, available_from, dpe_grade, status, published_at) VALUES
        ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Studio lumineux centre-ville', 'Joli studio refait à neuf, proche fac de lettres. Idéal étudiant.', 'studio', true, 45000, 5000, 45000, 22.0, '12 rue des Étudiants', 'Montpellier', '34000', '2026-09-01', 'C', 'published', now()),
        ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'T2 calme quartier Antigone', 'T2 avec balcon, quartier calme. Tram à 2 min.', 't2', false, 62000, 8000, 62000, 42.5, '8 allée de Mycènes', 'Montpellier', '34000', '2026-09-01', 'D', 'published', now()),
        ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Chambre en coloc Beaux-Arts', 'Chambre dans coloc de 3, ambiance sympa, grand salon.', 'shared_room', true, 35000, 4000, 35000, 14.0, '5 rue Embouque d''Or', 'Montpellier', '34000', '2026-10-01', 'B', 'published', now())
      ON CONFLICT DO NOTHING
    `);

    // Photos
    await client.query(`
      INSERT INTO listing_photos (listing_id, url, position) VALUES
        ('b0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x600?text=Studio+1', 0),
        ('b0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x600?text=Studio+2', 1),
        ('b0000000-0000-0000-0000-000000000002', 'https://placehold.co/800x600?text=T2+1', 0),
        ('b0000000-0000-0000-0000-000000000003', 'https://placehold.co/800x600?text=Coloc+1', 0)
      ON CONFLICT DO NOTHING
    `);

    // Conversations
    await client.query(`
      INSERT INTO conversations (id, listing_id, initiator_id, recipient_id, last_message_at) VALUES
        ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', now())
      ON CONFLICT DO NOTHING
    `);

    // Messages
    await client.query(`
      INSERT INTO messages (conversation_id, sender_id, body) VALUES
        ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Salut ! Le studio est encore dispo pour septembre ?'),
        ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Oui ! Tu veux passer le visiter cette semaine ?')
      ON CONFLICT DO NOTHING
    `);

    await client.query("COMMIT");
    console.log("Seed completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
