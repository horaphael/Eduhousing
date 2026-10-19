import './setup-env';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { PG_POOL } from '../src/database/database.module';

let app: INestApplication;
let pool: Pool;

const ALICE_ID = 'a1111111-1111-1111-1111-111111111111';
const BOB_ID = 'a2222222-2222-2222-2222-222222222222';

const validListing = {
  title: 'Studio lumineux test',
  description: 'Un super studio pour tester les annonces e2e',
  housing_type: 'studio',
  furnished: true,
  rent_cents: 45000,
  charges_cents: 5000,
  deposit_cents: 45000,
  surface_m2: 22.0,
  address_line: '12 rue Test',
  city: 'Montpellier',
  postal_code: '34000',
  available_from: '2026-09-01',
  dpe_grade: 'C',
};

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  setupApp(app);
  await app.init();

  pool = moduleRef.get<Pool>(PG_POOL);

  // Create test users
  await pool.query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
      ($1, 'alice-test@edu.fr', '$2b$10$placeholder', 'Alice', 'Test', 'student'),
      ($2, 'bob-test@edu.fr', '$2b$10$placeholder', 'Bob', 'Test', 'student')
    ON CONFLICT DO NOTHING`,
    [ALICE_ID, BOB_ID],
  );
});

afterAll(async () => {
  // Clean up test data
  await pool.query('DELETE FROM listings WHERE author_id IN ($1, $2)', [ALICE_ID, BOB_ID]);
  await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [ALICE_ID, BOB_ID]);
  await app.close();
});

describe('Listings CRUD', () => {
  let listingId: string;
  let draftId: string;

  // ── Auth ──

  it('401 without x-user-id header', async () => {
    await request(app.getHttpServer())
      .post('/listings')
      .send(validListing)
      .expect(401);
  });

  // ── Validation ──

  it('400 with invalid fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/listings')
      .set('x-user-id', ALICE_ID)
      .send({ title: 'ab' }) // too short + missing required
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('400 with unknown fields (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/listings')
      .set('x-user-id', ALICE_ID)
      .send({ ...validListing, unknown_field: 'test' })
      .expect(400);
  });

  it('400 with DPE grade G', async () => {
    await request(app.getHttpServer())
      .post('/listings')
      .set('x-user-id', ALICE_ID)
      .send({ ...validListing, dpe_grade: 'G' })
      .expect(400);
  });

  // ── Create ──

  it('201 creates a published listing', async () => {
    const res = await request(app.getHttpServer())
      .post('/listings')
      .set('x-user-id', ALICE_ID)
      .send(validListing)
      .expect(201);

    listingId = res.body.id;
    expect(res.body.status).toBe('published');
    expect(res.body.published_at).toBeTruthy();
    expect(res.body.author_id).toBe(ALICE_ID);
  });

  it('201 creates a draft listing', async () => {
    const res = await request(app.getHttpServer())
      .post('/listings')
      .set('x-user-id', ALICE_ID)
      .send({ ...validListing, status: 'draft' })
      .expect(201);

    draftId = res.body.id;
    expect(res.body.status).toBe('draft');
    expect(res.body.published_at).toBeNull();
  });

  // ── Read ──

  it('draft is not visible to non-author', async () => {
    await request(app.getHttpServer())
      .get(`/listings/${draftId}`)
      .set('x-user-id', BOB_ID)
      .expect(404);
  });

  it('draft is visible to author', async () => {
    const res = await request(app.getHttpServer())
      .get(`/listings/${draftId}`)
      .set('x-user-id', ALICE_ID)
      .expect(200);

    expect(res.body.status).toBe('draft');
  });

  it('GET /listings returns only published listings', async () => {
    const res = await request(app.getHttpServer())
      .get('/listings')
      .expect(200);

    const ids = res.body.map((l: any) => l.id);
    expect(ids).toContain(listingId);
    expect(ids).not.toContain(draftId);
  });

  it('GET /listings/mine returns all user listings', async () => {
    const res = await request(app.getHttpServer())
      .get('/listings/mine')
      .set('x-user-id', ALICE_ID)
      .expect(200);

    const ids = res.body.map((l: any) => l.id);
    expect(ids).toContain(listingId);
    expect(ids).toContain(draftId);
  });

  // ── Update ──

  it('403 when non-author tries to update', async () => {
    await request(app.getHttpServer())
      .patch(`/listings/${listingId}`)
      .set('x-user-id', BOB_ID)
      .send({ title: 'Hacked' })
      .expect(403);
  });

  it('404 when listing does not exist', async () => {
    await request(app.getHttpServer())
      .patch('/listings/00000000-0000-0000-0000-000000000000')
      .set('x-user-id', ALICE_ID)
      .send({ title: 'Nope' })
      .expect(404);
  });

  it('400 with empty body', async () => {
    await request(app.getHttpServer())
      .patch(`/listings/${listingId}`)
      .set('x-user-id', ALICE_ID)
      .send({})
      .expect(400);
  });

  it('partial update works', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/listings/${listingId}`)
      .set('x-user-id', ALICE_ID)
      .send({ title: 'Updated title' })
      .expect(200);

    expect(res.body.title).toBe('Updated title');
    expect(res.body.description).toBe(validListing.description); // unchanged
  });

  it('publishing a draft sets published_at', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/listings/${draftId}`)
      .set('x-user-id', ALICE_ID)
      .send({ status: 'published' })
      .expect(200);

    expect(res.body.status).toBe('published');
    expect(res.body.published_at).toBeTruthy();
  });

  // ── Photos ──

  let photoId: string;

  it('adds photos', async () => {
    // Create a small test image (1x1 PNG)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    const tmpFile = path.join(process.env.UPLOAD_DIR!, 'test.png');
    fs.writeFileSync(tmpFile, pngBuffer);

    const res = await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', ALICE_ID)
      .attach('photos', tmpFile)
      .expect(201);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].position).toBe(0);
    photoId = res.body[0].id;

    fs.unlinkSync(tmpFile);
  });

  it('adds more photos with correct position', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    const tmpFile = path.join(process.env.UPLOAD_DIR!, 'test2.png');
    fs.writeFileSync(tmpFile, pngBuffer);

    const res = await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', ALICE_ID)
      .attach('photos', tmpFile)
      .expect(201);

    expect(res.body[0].position).toBe(1);

    fs.unlinkSync(tmpFile);
  });

  it('403 when non-author tries to add photos', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    const tmpFile = path.join(process.env.UPLOAD_DIR!, 'test3.png');
    fs.writeFileSync(tmpFile, pngBuffer);

    await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', BOB_ID)
      .attach('photos', tmpFile)
      .expect(403);

    fs.unlinkSync(tmpFile);
  });

  it('400 with invalid file type', async () => {
    const tmpFile = path.join(process.env.UPLOAD_DIR!, 'test.txt');
    fs.writeFileSync(tmpFile, 'not an image');

    await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', ALICE_ID)
      .attach('photos', tmpFile)
      .expect(400);

    fs.unlinkSync(tmpFile);
  });

  it('413 with file too large', async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024); // 6 MB
    const tmpFile = path.join(process.env.UPLOAD_DIR!, 'big.png');
    fs.writeFileSync(tmpFile, bigBuffer);

    await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', ALICE_ID)
      .attach('photos', tmpFile)
      .expect(413);

    fs.unlinkSync(tmpFile);
  });

  it('400 with no files', async () => {
    await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', ALICE_ID)
      .expect(400);
  });

  it('400 when exceeding 10 photos limit', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    // Already have 2 photos, add 8 more to reach 10
    for (let i = 0; i < 8; i++) {
      const tmpFile = path.join(process.env.UPLOAD_DIR!, `fill-${i}.png`);
      fs.writeFileSync(tmpFile, pngBuffer);
      await request(app.getHttpServer())
        .post(`/listings/${listingId}/photos`)
        .set('x-user-id', ALICE_ID)
        .attach('photos', tmpFile)
        .expect(201);
      fs.unlinkSync(tmpFile);
    }

    // 11th should fail
    const tmpFile = path.join(process.env.UPLOAD_DIR!, 'overflow.png');
    fs.writeFileSync(tmpFile, pngBuffer);
    await request(app.getHttpServer())
      .post(`/listings/${listingId}/photos`)
      .set('x-user-id', ALICE_ID)
      .attach('photos', tmpFile)
      .expect(400);

    fs.unlinkSync(tmpFile);
  });

  it('deletes a photo and its file', async () => {
    // Get the photo URL to check the file
    const listing = await request(app.getHttpServer())
      .get(`/listings/${listingId}`)
      .expect(200);

    const photo = listing.body.photos.find((p: any) => p.id === photoId);
    expect(photo).toBeDefined();

    const filename = photo.url.replace('/uploads/', '');
    const filepath = path.join(process.env.UPLOAD_DIR!, filename);
    expect(fs.existsSync(filepath)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/listings/${listingId}/photos/${photoId}`)
      .set('x-user-id', ALICE_ID)
      .expect(204);

    expect(fs.existsSync(filepath)).toBe(false);
  });

  // ── Delete listing ──

  it('deletes a listing and its photo files', async () => {
    // Get remaining photos before deletion
    const listing = await request(app.getHttpServer())
      .get(`/listings/${listingId}`)
      .expect(200);

    const photoFiles = listing.body.photos.map((p: any) =>
      path.join(process.env.UPLOAD_DIR!, p.url.replace('/uploads/', '')),
    );

    await request(app.getHttpServer())
      .delete(`/listings/${listingId}`)
      .set('x-user-id', ALICE_ID)
      .expect(204);

    // Verify listing is gone
    await request(app.getHttpServer())
      .get(`/listings/${listingId}`)
      .expect(404);

    // Verify photo files are deleted
    for (const filepath of photoFiles) {
      expect(fs.existsSync(filepath)).toBe(false);
    }
  });
});
