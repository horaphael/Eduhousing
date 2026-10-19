import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [DatabaseModule, HealthModule, ListingsModule],
})
export class AppModule {}
