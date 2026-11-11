/**
 * Messaging controller — Dev L
 * GET  /conversations         → liste des conversations
 * GET  /conversations/:id     → messages d'une conversation
 * POST /conversations         → demarrer une conversation
 * POST /conversations/:id/messages → F13 envoyer un message
 */
import { Controller } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // TODO [F13]: GET /conversations
  // - Lister les conversations de l'utilisateur connecte
  // - Inclure le dernier message et l'annonce associee

  // TODO [F13]: GET /conversations/:id
  // - Retourner tous les messages de la conversation
  // - Verifier que l'utilisateur est participant

  // TODO [F13]: POST /conversations
  // - Creer une conversation autour d'une annonce
  // - Verifier qu'il n'en existe pas deja une

  // TODO [F13]: POST /conversations/:id/messages
  // - Envoyer un message dans une conversation existante
  // - Mettre a jour last_message_at
}
