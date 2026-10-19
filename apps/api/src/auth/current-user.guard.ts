/**
 * Temporary authentication guard — reads x-user-id header.
 * Will be replaced by JWT-based authentication.
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!userId || !UUID_REGEX.test(userId)) {
      throw new UnauthorizedException();
    }

    const { rows } = await this.pool.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId],
    );

    if (rows.length === 0) {
      throw new UnauthorizedException();
    }

    (req as any).user = { id: userId };
    return true;
  }
}
