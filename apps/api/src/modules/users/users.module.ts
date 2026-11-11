/**
 * Users module — Dev E
 * F2: Verifier son email academique
 * F4: Completer son profil
 * Socle: Mettre a jour le seed avec les donnees de demo
 */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
