import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class AuthService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // TODO [F1]: register(email, password, firstName, lastName)
  // TODO [F3]: login(email, password)
  // TODO [Socle]: validateToken(token) → user
}
