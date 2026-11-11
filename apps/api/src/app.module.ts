import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

// Feature modules — each dev works in their own module
import { ListingsModule } from './modules/listings/listings.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ApplicationsModule } from './modules/applications/applications.module';

@Module({
  imports: [
    // Shared infrastructure
    DatabaseModule,
    HealthModule,

    // Feature modules
    ListingsModule,      // Annonces (existing)
    AuthModule,          // Dev R: F1, F3
    UsersModule,         // Dev E: F2, F4
    MessagingModule,     // Dev L: F13
    ReportsModule,       // Dev L: F14, F15
    ApplicationsModule,  // Dev J: F11, F12
  ],
})
export class AppModule {}
