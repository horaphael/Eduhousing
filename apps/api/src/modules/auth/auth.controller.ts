/**
 * Auth controller — Dev R
 * POST /auth/register  → F1 inscription
 * POST /auth/login     → F3 connexion
 */
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO [F1]: POST /auth/register
  // - Valider que l'email est academique (.edu.fr, .univ-*.fr, etc.)
  // - Hasher le mot de passe (bcrypt)
  // - Creer l'utilisateur en base
  // - Envoyer un email de verification (ou generer un token)
  // - Retourner un JWT

  // TODO [F3]: POST /auth/login
  // - Verifier email + mot de passe
  // - Retourner un JWT
  // - Gerer les erreurs (mauvais mot de passe, compte non verifie)
}
