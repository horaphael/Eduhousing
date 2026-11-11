/**
 * Users controller — Dev E
 * POST /users/verify-email  → F2 verification email
 * GET  /users/me            → profil connecte
 * PATCH /users/me           → F4 completer profil
 */
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO [F2]: POST /users/verify-email
  // - Recevoir le token de verification
  // - Marquer email_verified_at en base

  // TODO [F4]: GET /users/me
  // - Retourner le profil de l'utilisateur connecte

  // TODO [F4]: PATCH /users/me
  // - Mettre a jour first_name, last_name, bio, avatar_url
}
