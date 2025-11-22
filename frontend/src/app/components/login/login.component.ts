import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentAuthService } from '../../services/student-auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-ccnb-blue via-ccnb-blue-dark to-ccnb-red flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <div class="text-center mb-8">
          <i class="material-icons text-5xl text-ccnb-blue mb-4">school</i>
          <h1 class="text-3xl font-bold text-ccnb-blue mb-2">Connexion</h1>
          <p class="text-gray-600">Association Étudiante du CCNB</p>
        </div>

        <form (ngSubmit)="onLogin()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="material-icons text-sm align-middle text-ccnb-blue">email</i>
              Email CCNB
            </label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="votre.nom@monccnb.ca"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="material-icons text-sm align-middle text-ccnb-blue">lock</i>
              Mot de passe
            </label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Votre mot de passe"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
            />
          </div>

          @if (error()) {
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-700">{{ error() }}</p>
            </div>
          }

          <button
            type="submit"
            [disabled]="!email || !password || isSubmitting()"
            class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            @if (isSubmitting()) {
              <i class="material-icons animate-spin align-middle">refresh</i>
              <span class="ml-2">Connexion...</span>
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="mt-6 space-y-3">
          <div class="text-center">
            <a routerLink="/forgot-password" class="text-sm text-ccnb-blue hover:text-ccnb-red font-semibold">
              <i class="material-icons text-sm align-middle">help_outline</i>
              Mot de passe oublié ?
            </a>
          </div>
          <div class="text-center border-t pt-3">
            <p class="text-sm text-gray-600 mb-2">
              Vous n'avez pas de compte ?
              <a routerLink="/create-profile" class="text-ccnb-blue hover:text-ccnb-red font-semibold">
                Créer un profil
              </a>
            </p>
            <button
              (click)="switchToAdmin()"
              class="text-sm text-gray-600 hover:text-ccnb-red transition flex items-center justify-center gap-1 mx-auto"
            >
              <i class="material-icons text-sm">swap_horiz</i>
              <span>Vous êtes administrateur ?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-ccnb-blue { background-color: #003366; }
    .text-ccnb-blue { color: #003366; }
    .bg-ccnb-blue-dark { background-color: #002244; }
    .bg-ccnb-red { background-color: #CC0033; }
    .hover\\:bg-ccnb-red:hover { background-color: #CC0033; }
  `]
})
export class LoginComponent {
  private studentAuthService = inject(StudentAuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  isSubmitting = signal(false);
  error = signal<string>('');

  onLogin() {
    this.error.set('');
    this.isSubmitting.set(true);

    this.studentAuthService.login(this.email, this.password).subscribe({
      next: () => {
        this.toastService.success('Connexion réussie - Bienvenue !');
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
        this.error.set(errorMessage);
        this.toastService.error('Erreur de connexion', errorMessage);
      }
    });
  }

  switchToAdmin() {
    this.router.navigate(['/admin']);
  }
}

