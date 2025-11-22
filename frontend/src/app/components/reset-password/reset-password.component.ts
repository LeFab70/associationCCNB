import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { StudentAuthService } from '../../services/student-auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-ccnb-blue via-ccnb-blue-dark to-ccnb-red flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <div class="text-center mb-8">
          <i class="material-icons text-5xl text-ccnb-blue mb-4">lock</i>
          <h1 class="text-3xl font-bold text-ccnb-blue mb-2">Réinitialiser le mot de passe</h1>
          <p class="text-gray-600">Entrez le code reçu et votre nouveau mot de passe</p>
        </div>

        <form (ngSubmit)="onResetPassword()" class="space-y-6">
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
              [readonly]="emailFromQuery"
              [class.bg-gray-100]="emailFromQuery"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="material-icons text-sm align-middle text-ccnb-blue">vpn_key</i>
              Code de réinitialisation
            </label>
            <input
              type="text"
              [(ngModel)]="resetCode"
              name="resetCode"
              placeholder="Entrez le code à 6 chiffres"
              maxlength="6"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent text-center text-2xl font-mono tracking-widest"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="material-icons text-sm align-middle text-ccnb-blue">lock</i>
              Nouveau mot de passe
            </label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              placeholder="Minimum 6 caractères"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="material-icons text-sm align-middle text-ccnb-blue">lock_outline</i>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Confirmez votre mot de passe"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
            />
          </div>

          @if (passwordError()) {
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-700">{{ passwordError() }}</p>
            </div>
          }

          @if (error()) {
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-700">{{ error() }}</p>
            </div>
          }

          <button
            type="submit"
            [disabled]="!email || !resetCode || !newPassword || !confirmPassword || isSubmitting()"
            class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            @if (isSubmitting()) {
              <i class="material-icons animate-spin align-middle">refresh</i>
              <span class="ml-2">Réinitialisation...</span>
            } @else {
              Réinitialiser le mot de passe
            }
          </button>
        </form>

        <div class="mt-6 text-center">
          <a routerLink="/login" class="text-sm text-ccnb-blue hover:text-ccnb-red font-semibold">
            <i class="material-icons text-sm align-middle">arrow_back</i>
            Retour à la connexion
          </a>
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
export class ResetPasswordComponent implements OnInit {
  private studentAuthService = inject(StudentAuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  resetCode = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = signal(false);
  error = signal<string>('');
  passwordError = signal<string>('');
  emailFromQuery = false;

  ngOnInit() {
    // Récupérer l'email et le code depuis les query params si disponibles
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
        this.emailFromQuery = true;
      }
      if (params['code']) {
        this.resetCode = params['code'];
      }
    });
  }

  onResetPassword() {
    this.error.set('');
    this.passwordError.set('');

    // Validation
    if (this.newPassword.length < 6) {
      this.passwordError.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.resetCode.length !== 6) {
      this.error.set('Le code doit contenir 6 chiffres');
      return;
    }

    this.isSubmitting.set(true);

    this.studentAuthService.resetPassword(this.email, this.resetCode, this.newPassword, this.confirmPassword).subscribe({
      next: () => {
        this.toastService.success('Mot de passe réinitialisé avec succès - Vous pouvez maintenant vous connecter');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const errorMessage = err.error?.message || 'Erreur - Impossible de réinitialiser le mot de passe';
        this.error.set(errorMessage);
        this.toastService.error(errorMessage);
      }
    });
  }
}

