/**
 * Reports module — Dev L
 * F14: Signaler une annonce
 * F15: Traiter un signalement (moderation)
 */
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
