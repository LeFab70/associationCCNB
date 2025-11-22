import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StudentAuthService } from '../services/student-auth.service';

export const studentAuthGuard: CanActivateFn = async (route, state) => {
  const studentAuthService = inject(StudentAuthService);
  const router = inject(Router);

  // Vérifier l'authentification d'abord
  studentAuthService.checkAuth();

  // Attendre un peu pour que la vérification se termine
  await new Promise(resolve => setTimeout(resolve, 100));

  if (studentAuthService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers la page de choix de compte
  router.navigate(['/']);
  return false;
};

