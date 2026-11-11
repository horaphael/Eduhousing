/**
 * Auth module — Dev R
 * F1: S'inscrire avec un email academique
 * F3: Se connecter
 * Socle: Middleware d'authentification et de roles
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
