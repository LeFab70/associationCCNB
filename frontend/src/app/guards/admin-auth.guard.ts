import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier l'authentification d'abord
  authService.checkAuth();

  // Attendre un peu pour que la vérification se termine
  await new Promise(resolve => setTimeout(resolve, 100));

  // Permettre l'accès à /admin même sans être connecté
  // Le composant AdminComponent gère déjà l'affichage du formulaire de connexion
  return true;
};

