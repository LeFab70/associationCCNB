import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentAuthService } from '../../services/student-auth.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-choice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-ccnb-blue via-ccnb-blue-dark to-ccnb-red flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-8 animate-fade-in">
        <div class="text-center mb-8">
          <i class="material-icons text-6xl text-ccnb-blue mb-4">school</i>
          <h1 class="text-4xl font-bold text-ccnb-blue mb-2">Association des Étudiants CCNB</h1>
          <p class="text-gray-600 text-lg">Choisissez votre type de compte</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Étudiant -->
          <div class="border-2 border-gray-200 rounded-lg p-8 hover:border-ccnb-blue hover:shadow-lg transition-all">
            <div class="text-center mb-6">
              <div class="bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark rounded-full p-6 inline-block mb-4">
                <i class="material-icons text-6xl text-white">person</i>
              </div>
              <h2 class="text-2xl font-bold text-ccnb-blue mb-2">Étudiant</h2>
              <p class="text-gray-600">Accédez aux activités, propositions et plus encore</p>
            </div>
            
            <div class="space-y-4">
              <button
                (click)="goToStudentLogin()"
                class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition font-semibold flex items-center justify-center gap-2"
              >
                <i class="material-icons">login</i>
                Se connecter
              </button>
              <button
                (click)="goToCreateProfile()"
                class="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
              >
                <i class="material-icons">person_add</i>
                Créer un compte
              </button>
            </div>
          </div>

          <!-- Admin -->
          <div class="border-2 border-gray-200 rounded-lg p-8 hover:border-ccnb-red hover:shadow-lg transition-all">
            <div class="text-center mb-6">
              <div class="bg-gradient-to-br from-ccnb-red to-red-700 rounded-full p-6 inline-block mb-4">
                <i class="material-icons text-6xl text-white">admin_panel_settings</i>
              </div>
              <h2 class="text-2xl font-bold text-ccnb-red mb-2">Administrateur</h2>
              <p class="text-gray-600">Gérez les activités, propositions et contenus</p>
            </div>
            
            <div class="space-y-4">
              <button
                (click)="goToAdminLogin()"
                class="w-full bg-ccnb-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <i class="material-icons">login</i>
                Se connecter
              </button>
            </div>
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
export class AuthChoiceComponent {
  private router = inject(Router);
  private studentAuthService = inject(StudentAuthService);
  private authService = inject(AuthService);

  constructor() {
    // Si déjà connecté, rediriger
    if (this.studentAuthService.isAuthenticated()) {
      this.router.navigate(['/home']);
    } else if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  goToStudentLogin() {
    this.router.navigate(['/login']);
  }

  goToCreateProfile() {
    this.router.navigate(['/create-profile']);
  }

  goToAdminLogin() {
    this.router.navigate(['/admin']);
  }
}

