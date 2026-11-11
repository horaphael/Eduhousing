/**
 * Reports controller — Dev L
 * POST /reports              → F14 signaler une annonce
 * GET  /reports              → F15 liste des signalements (admin)
 * PATCH /reports/:id         → F15 traiter un signalement
 */
import { Controller } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // TODO [F14]: POST /reports
  // - Creer un signalement (listing_id, reason, description)
  // - Un user ne peut signaler qu'une fois la meme annonce

  // TODO [F15]: GET /reports (admin only)
  // - Lister les signalements en attente
  // - Filtrer par statut (pending, reviewed, dismissed)

  // TODO [F15]: PATCH /reports/:id (admin only)
  // - Changer le statut du signalement
  // - Optionnel: archiver l'annonce signalee
}
