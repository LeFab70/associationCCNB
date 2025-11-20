import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor() {
    // Vérifier l'authentification au démarrage
    this.checkAuth();
  }

  checkAuth(): boolean {
    const auth = localStorage.getItem('adminAuth');
    const isAuth = auth === 'true';
    this.isAuthenticatedSignal.set(isAuth);
    return isAuth;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  setAuthenticated(value: boolean): void {
    if (value) {
      localStorage.setItem('adminAuth', 'true');
    } else {
      localStorage.removeItem('adminAuth');
    }
    this.isAuthenticatedSignal.set(value);
  }

  logout(): void {
    this.setAuthenticated(false);
  }
}

