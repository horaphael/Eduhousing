import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class ReportsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // TODO [F14]: createReport(reporterId, listingId, reason, description)
  // TODO [F15]: findAll(filters)
  // TODO [F15]: updateStatus(reportId, status, adminId)
}
