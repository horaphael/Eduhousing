import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class ApplicationsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // TODO [F11]: apply(listingId, userId, message?)
  // TODO [F11]: findMyApplications(userId)
  // TODO [F12]: findByListing(listingId, ownerId)
  // TODO [F12]: updateStatus(applicationId, status, ownerId)
}
