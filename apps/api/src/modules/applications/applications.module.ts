/**
 * Applications module — Dev J
 * F11: Candidater a une annonce
 * F12: Accepter ou refuser une candidature
 * Socle: Definir le format des reponses API et des erreurs
 */
import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
