import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { PG_POOL } from '../database/database.module';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { config } from '../config';

@Injectable()
export class ListingsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findPublished() {
    const { rows } = await this.pool.query(`
      SELECT l.*,
        COALESCE(
          (SELECT json_agg(p ORDER BY p.position)
           FROM listing_photos p WHERE p.listing_id = l.id),
          '[]'::json
        ) AS photos
      FROM listings l
      WHERE l.status = 'published'
      ORDER BY l.published_at DESC NULLS LAST
      LIMIT 50
    `);
    return rows;
  }

  async findMine(userId: string) {
    const { rows } = await this.pool.query(
      `SELECT l.*,
        COALESCE(
          (SELECT json_agg(p ORDER BY p.position)
           FROM listing_photos p WHERE p.listing_id = l.id),
          '[]'::json
        ) AS photos
      FROM listings l
      WHERE l.author_id = $1
      ORDER BY l.created_at DESC`,
      [userId],
    );
    return rows;
  }

  async findOne(id: string, userId?: string) {
    const { rows } = await this.pool.query(
      `SELECT l.*,
        COALESCE(
          (SELECT json_agg(p ORDER BY p.position)
           FROM listing_photos p WHERE p.listing_id = l.id),
          '[]'::json
        ) AS photos
      FROM listings l
      WHERE l.id = $1`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException();
    }

    const listing = rows[0];

    // Only published or rented listings are visible, unless the requester is the author
    if (
      listing.status !== 'published' &&
      listing.status !== 'rented' &&
      listing.author_id !== userId
    ) {
      throw new NotFoundException();
    }

    return listing;
  }

  async create(dto: CreateListingDto, authorId: string) {
    const status = dto.status || 'published';
    const publishedAtExpr = status === 'published' ? 'now()' : 'NULL';

    try {
      const { rows } = await this.pool.query(
        `INSERT INTO listings
          (author_id, title, description, housing_type, furnished,
           rent_cents, charges_cents, deposit_cents, surface_m2,
           address_line, city, postal_code,
           available_from, available_until, dpe_grade,
           status, published_at)
        VALUES
          ($1, $2, $3, $4, $5,
           $6, $7, $8, $9,
           $10, $11, $12,
           $13, $14, $15,
           $16::listing_status,
           CASE WHEN $16::listing_status = 'published' THEN now() ELSE NULL END)
        RETURNING *`,
        [
          authorId,
          dto.title,
          dto.description,
          dto.housing_type,
          dto.furnished ?? false,
          dto.rent_cents,
          dto.charges_cents ?? 0,
          dto.deposit_cents ?? 0,
          dto.surface_m2 ?? null,
          dto.address_line,
          dto.city,
          dto.postal_code,
          dto.available_from,
          dto.available_until ?? null,
          dto.dpe_grade ?? null,
          status,
        ],
      );
      return rows[0];
    } catch (err: any) {
      this.handlePgError(err);
    }
  }

  async update(id: string, dto: UpdateListingDto, userId: string) {
    const keys = Object.keys(dto).filter((k) => dto[k as keyof UpdateListingDto] !== undefined);
    if (keys.length === 0) {
      throw new BadRequestException('Request body is empty');
    }

    // Check ownership
    const { rows: existing } = await this.pool.query(
      'SELECT author_id FROM listings WHERE id = $1',
      [id],
    );
    if (existing.length === 0) {
      throw new NotFoundException();
    }
    if (existing[0].author_id !== userId) {
      throw new ForbiddenException();
    }

    // Check for null mandatory fields
    const mandatoryFields = [
      'title', 'description', 'housing_type', 'rent_cents',
      'address_line', 'city', 'postal_code', 'available_from',
    ];
    for (const field of mandatoryFields) {
      if (field in dto && (dto as any)[field] === null) {
        throw new BadRequestException(`${field} cannot be null`);
      }
    }

    // Build dynamic SET clause
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key of keys) {
      if (key === 'status') {
        setClauses.push(`"status" = $${paramIndex}::listing_status`);
      } else {
        setClauses.push(`"${key}" = $${paramIndex}`);
      }
      values.push((dto as any)[key]);
      paramIndex++;
    }

    // If status becomes published, set published_at if not already set
    if (dto.status === 'published') {
      setClauses.push('"published_at" = COALESCE("published_at", now())');
    }

    setClauses.push('"updated_at" = now()');
    values.push(id);

    try {
      const { rows } = await this.pool.query(
        `UPDATE listings SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values,
      );
      return rows[0];
    } catch (err: any) {
      this.handlePgError(err);
    }
  }

  async remove(id: string, userId: string) {
    const { rows: existing } = await this.pool.query(
      `SELECT l.id, l.author_id FROM listings l WHERE l.id = $1`,
      [id],
    );
    if (existing.length === 0) {
      throw new NotFoundException();
    }
    if (existing[0].author_id !== userId) {
      throw new ForbiddenException();
    }

    // Get photo files to delete from disk
    const { rows: photos } = await this.pool.query(
      'SELECT url FROM listing_photos WHERE listing_id = $1',
      [id],
    );

    await this.pool.query('DELETE FROM listings WHERE id = $1', [id]);

    // Delete photo files from disk
    for (const photo of photos) {
      const filename = photo.url.replace('/uploads/', '');
      const filepath = path.join(config.uploadDir, filename);
      try {
        fs.unlinkSync(filepath);
      } catch {
        // File may not exist on disk, ignore
      }
    }
  }

  async addPhotos(
    listingId: string,
    userId: string,
    files: Express.Multer.File[],
  ) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: listing } = await client.query(
        'SELECT id, author_id FROM listings WHERE id = $1 FOR UPDATE',
        [listingId],
      );
      if (listing.length === 0) {
        throw new NotFoundException();
      }
      if (listing[0].author_id !== userId) {
        throw new ForbiddenException();
      }

      const { rows: countRows } = await client.query(
        'SELECT COUNT(*)::int AS cnt FROM listing_photos WHERE listing_id = $1',
        [listingId],
      );
      const currentCount = countRows[0].cnt;

      if (currentCount + files.length > 10) {
        throw new BadRequestException(
          `Cannot exceed 10 photos per listing (current: ${currentCount})`,
        );
      }

      const { rows: maxRows } = await client.query(
        'SELECT COALESCE(MAX(position), -1) AS max_pos FROM listing_photos WHERE listing_id = $1',
        [listingId],
      );
      let nextPos = maxRows[0].max_pos + 1;

      const inserted = [];
      for (const file of files) {
        const { rows } = await client.query(
          `INSERT INTO listing_photos (listing_id, url, position, size_bytes)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [listingId, `/uploads/${file.filename}`, nextPos++, file.size],
        );
        inserted.push(rows[0]);
      }

      await client.query('COMMIT');
      return inserted;
    } catch (err) {
      await client.query('ROLLBACK');
      // Clean up uploaded files on error
      for (const file of files) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          // ignore
        }
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async removePhoto(listingId: string, photoId: string, userId: string) {
    const { rows } = await this.pool.query(
      `SELECT p.url, l.author_id
       FROM listing_photos p
       JOIN listings l ON l.id = p.listing_id
       WHERE p.id = $1 AND p.listing_id = $2`,
      [photoId, listingId],
    );

    if (rows.length === 0) {
      throw new NotFoundException();
    }
    if (rows[0].author_id !== userId) {
      throw new ForbiddenException();
    }

    await this.pool.query('DELETE FROM listing_photos WHERE id = $1', [photoId]);

    // Delete file from disk
    const filename = rows[0].url.replace('/uploads/', '');
    const filepath = path.join(config.uploadDir, filename);
    try {
      fs.unlinkSync(filepath);
    } catch {
      // ignore
    }
  }

  private handlePgError(err: any): never {
    if (err.code === '23514') {
      // Check constraint violation
      if (err.constraint === 'listings_dates_order') {
        throw new BadRequestException('available_until must be after available_from');
      }
      if (err.constraint === 'listings_dpe_not_g') {
        throw new BadRequestException('DPE grade G is not allowed');
      }
    }
    if (err.code === '22007' || err.code === '22008') {
      throw new BadRequestException('Invalid date value');
    }
    throw err;
  }
}
