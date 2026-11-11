import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // TODO [F2]: verifyEmail(token)
  // TODO [F4]: getProfile(userId)
  // TODO [F4]: updateProfile(userId, data)
  // TODO: findById(userId) — utilise par d'autres modules
}
