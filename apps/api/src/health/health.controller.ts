import { Controller, Get, Inject, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Controller()
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  @Get('health')
  async check(@Res() res: Response): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ status: 'error' });
    }
  }
}
