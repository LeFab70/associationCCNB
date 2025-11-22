import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

export interface Student {
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  filiere?: string;
  campus?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentAuthService {
  // État d'authentification
  private isAuthenticatedSignal = signal<boolean>(false);
  private currentStudentSignal = signal<Student | null>(null);
  
  isAuthenticated = computed(() => this.isAuthenticatedSignal());
  currentStudent = computed(() => this.currentStudentSignal());
  
  constructor(private httpClient: HttpClient) {
    this.checkAuth();
  }
  
  // Vérifier l'authentification au démarrage
  checkAuth(): void {
    this.httpClient.get<{ authenticated: boolean; email?: string; studentId?: number }>(`${API_URL}/students/check-auth`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.authenticated && response.email) {
            this.isAuthenticatedSignal.set(true);
            this.loadProfile();
          } else {
            this.isAuthenticatedSignal.set(false);
            this.currentStudentSignal.set(null);
          }
        },
        error: (err) => {
          // 401 est normal si l'utilisateur n'est pas connecté
          if (err.status === 401) {
            this.isAuthenticatedSignal.set(false);
            this.currentStudentSignal.set(null);
          } else {
            // Autre erreur (serveur down, etc.)
            console.error('Erreur lors de la vérification de l\'authentification:', err);
            this.isAuthenticatedSignal.set(false);
            this.currentStudentSignal.set(null);
          }
        }
      });
  }
  
  // Charger le profil de l'étudiant connecté
  loadProfile(): void {
    this.httpClient.get<Student>(`${API_URL}/students/profile`, { withCredentials: true })
      .subscribe({
        next: (student) => {
          this.currentStudentSignal.set(student);
        },
        error: () => {
          this.isAuthenticatedSignal.set(false);
          this.currentStudentSignal.set(null);
        }
      });
  }
  
  // Connexion
  login(email: string, password: string): Observable<Student> {
    return this.httpClient.post<Student>(`${API_URL}/students/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap(student => {
          this.isAuthenticatedSignal.set(true);
          this.currentStudentSignal.set(student);
        })
      );
  }
  
  // Déconnexion
  logout(): Observable<void> {
    return this.httpClient.post<void>(`${API_URL}/students/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.isAuthenticatedSignal.set(false);
          this.currentStudentSignal.set(null);
        })
      );
  }
  
  // Étape 1 : Démarrer la création de profil
  startProfileCreation(email: string): Observable<Student> {
    return this.httpClient.post<Student>(`${API_URL}/students/start-creation`, { email });
  }
  
  // Étape 2 : Compléter les informations
  completeProfileInfo(email: string, nom: string, prenom: string | undefined, filiere: string, campus: string): Observable<Student> {
    return this.httpClient.put<Student>(`${API_URL}/students/complete-info`, {
      email,
      nom,
      prenom,
      filiere,
      campus
    });
  }
  
  // Étape 3 : Envoyer le code de validation
  sendValidationCode(email: string): Observable<{ message: string; code?: string; warning?: string }> {
    return this.httpClient.post<{ message: string; code?: string; warning?: string }>(`${API_URL}/students/send-validation-code`, { email }, { withCredentials: true });
  }
  
  // Étape 4 : Vérifier le code
  verifyValidationCode(email: string, code: string): Observable<Student> {
    return this.httpClient.post<Student>(`${API_URL}/students/verify-code`, { email, code });
  }
  
  // Étape 5 : Définir le mot de passe
  setPassword(email: string, password: string, confirmPassword: string): Observable<Student> {
    return this.httpClient.post<Student>(`${API_URL}/students/set-password`, {
      email,
      password,
      confirmPassword
    }, { withCredentials: true })
      .pipe(
        tap(student => {
          this.isAuthenticatedSignal.set(true);
          this.currentStudentSignal.set(student);
        })
      );
  }
  
  // Mettre à jour le profil
  updateProfile(nom: string, prenom: string | undefined, filiere: string, campus: string): Observable<Student> {
    return this.httpClient.put<Student>(`${API_URL}/students/profile`, {
      nom,
      prenom,
      filiere,
      campus
    }, { withCredentials: true })
      .pipe(
        tap(student => {
          this.currentStudentSignal.set(student);
        })
      );
  }
  
  // Demander la réinitialisation du mot de passe
  requestPasswordReset(email: string): Observable<{ message: string; code?: string; warning?: string }> {
    return this.httpClient.post<{ message: string; code?: string; warning?: string }>(`${API_URL}/students/request-password-reset`, { email }, { withCredentials: true });
  }
  
  // Réinitialiser le mot de passe avec le code
  resetPassword(email: string, resetCode: string, newPassword: string, confirmPassword: string): Observable<Student> {
    return this.httpClient.post<Student>(`${API_URL}/students/reset-password`, {
      email,
      resetCode,
      newPassword,
      confirmPassword
    }, { withCredentials: true });
  }
}

