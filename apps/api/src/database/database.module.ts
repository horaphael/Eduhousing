import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Pool, types } from 'pg';
import { config } from '../config';

// Return DATE as plain text (YYYY-MM-DD) instead of JS Date
types.setTypeParser(types.builtins.DATE, (val: string) => val);
// Return NUMERIC as number instead of string
types.setTypeParser(types.builtins.NUMERIC, (val: string) => parseFloat(val));

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => new Pool({ connectionString: config.databaseUrl }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    const pool = this.moduleRef.get<Pool>(PG_POOL);
    await pool.end();
  }
}
