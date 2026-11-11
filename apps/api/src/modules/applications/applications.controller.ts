/**
 * Applications controller — Dev J
 * POST  /listings/:id/applications  → F11 candidater
 * GET   /listings/:id/applications  → F12 voir les candidatures (owner)
 * GET   /applications/mine          → F11 mes candidatures (student)
 * PATCH /applications/:id           → F12 accepter/refuser
 */
import { Controller } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // TODO [F11]: POST /listings/:id/applications
  // - Creer une candidature (message optionnel)
  // - Verifier que l'annonce est publiee
  // - Verifier qu'on n'a pas deja candidater

  // TODO [F11]: GET /applications/mine
  // - Lister mes candidatures avec le statut

  // TODO [F12]: GET /listings/:id/applications (owner only)
  // - Lister les candidatures recues pour une annonce

  // TODO [F12]: PATCH /applications/:id
  // - Accepter ou refuser une candidature
  // - Seul le proprietaire de l'annonce peut le faire
}
