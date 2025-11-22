import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentAuthService } from '../../services/student-auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-ccnb-blue via-ccnb-blue-dark to-ccnb-red flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <div class="text-center mb-8">
          <i class="material-icons text-5xl text-ccnb-blue mb-4">lock_reset</i>
          <h1 class="text-3xl font-bold text-ccnb-blue mb-2">Mot de passe oublié</h1>
          <p class="text-gray-600">Entrez votre email pour recevoir un code de réinitialisation</p>
        </div>

        <form (ngSubmit)="onRequestReset()" class="space-y-6">
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

          @if (error()) {
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-700">{{ error() }}</p>
            </div>
          }

          <button
            type="submit"
            [disabled]="!email || isSubmitting()"
            class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            @if (isSubmitting()) {
              <i class="material-icons animate-spin align-middle">refresh</i>
              <span class="ml-2">Envoi...</span>
            } @else {
              Envoyer le code de réinitialisation
            }
          </button>
        </form>

        <div class="mt-6 space-y-3">
          <div class="text-center">
            <a routerLink="/login" class="text-sm text-ccnb-blue hover:text-ccnb-red font-semibold">
              <i class="material-icons text-sm align-middle">arrow_back</i>
              Retour à la connexion
            </a>
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
export class ForgotPasswordComponent {
  private studentAuthService = inject(StudentAuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = '';
  isSubmitting = signal(false);
  error = signal<string>('');

  onRequestReset() {
    this.error.set('');
    this.isSubmitting.set(true);

    this.studentAuthService.requestPasswordReset(this.email).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        
        // Si le code est retourné (email non envoyé), l'afficher
        if (response.code) {
          this.toastService.warning(`Code de réinitialisation: ${response.code} - Email non envoyé, utilisez ce code pour continuer`);
          // Rediriger vers la page de réinitialisation avec le code pré-rempli
          this.router.navigate(['/reset-password'], { 
            queryParams: { email: this.email, code: response.code } 
          });
        } else {
          this.toastService.success('Code de réinitialisation envoyé - Vérifiez votre boîte email');
          // Rediriger vers la page de réinitialisation
          this.router.navigate(['/reset-password'], { 
            queryParams: { email: this.email } 
          });
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const errorMessage = err.error?.message || 'Erreur - Impossible d\'envoyer le code de réinitialisation';
        this.error.set(errorMessage);
        this.toastService.error(errorMessage);
      }
    });
  }
}

