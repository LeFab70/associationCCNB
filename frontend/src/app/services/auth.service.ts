import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor() {
    // Vérifier l'authentification au démarrage
    this.checkAuth();
  }

  checkAuth(): void {
    this.httpClient.get<{ authenticated: boolean; username?: string }>(`${API_URL}/admin/check-auth`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.isAuthenticatedSignal.set(response.authenticated);
        },
        error: (err) => {
          // 401 est normal si l'admin n'est pas connecté
          if (err.status === 401) {
            this.isAuthenticatedSignal.set(false);
          } else {
            // Autre erreur (serveur down, etc.)
            console.error('Erreur lors de la vérification de l\'authentification admin:', err);
            this.isAuthenticatedSignal.set(false);
          }
        }
      });
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  login(username: string, password: string): Observable<any> {
    return this.httpClient.post<any>(`${API_URL}/admin/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.success) {
            this.isAuthenticatedSignal.set(true);
          }
        })
      );
  }

  logout(): Observable<void> {
    return this.httpClient.post<void>(`${API_URL}/admin/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.isAuthenticatedSignal.set(false);
        })
      );
  }

  setAuthenticated(value: boolean): void {
    this.isAuthenticatedSignal.set(value);
  }
}

