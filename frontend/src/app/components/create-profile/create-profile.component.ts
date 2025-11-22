import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentAuthService } from '../../services/student-auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-create-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-ccnb-blue via-ccnb-blue-dark to-ccnb-red flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 animate-fade-in">
        <!-- En-tête -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-ccnb-blue mb-2">Création de votre profil</h1>
          <p class="text-gray-600">Association Étudiante du CCNB</p>
        </div>

        <!-- Stepper -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            @for (step of steps; track step.number; let i = $index) {
              <div class="flex items-center flex-1">
                <div class="flex flex-col items-center flex-1">
                  <!-- Cercle du step -->
                  <div 
                    class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300"
                    [class.bg-ccnb-blue]="currentStep() >= step.number"
                    [class.bg-gray-300]="currentStep() < step.number"
                    [class.text-white]="currentStep() >= step.number"
                    [class.text-gray-600]="currentStep() < step.number"
                  >
                    @if (currentStep() > step.number) {
                      <i class="material-icons">check</i>
                    } @else {
                      {{ step.number }}
                    }
                  </div>
                  <!-- Label -->
                  <p 
                    class="mt-2 text-xs text-center max-w-[100px]"
                    [class.font-semibold]="currentStep() === step.number"
                    [class.text-ccnb-blue]="currentStep() >= step.number"
                    [class.text-gray-500]="currentStep() < step.number"
                  >
                    {{ step.label }}
                  </p>
                </div>
                <!-- Ligne de connexion -->
                @if (i < steps.length - 1) {
                  <div 
                    class="h-1 flex-1 mx-2 transition-all duration-300"
                    [class.bg-ccnb-blue]="currentStep() > step.number"
                    [class.bg-gray-300]="currentStep() <= step.number"
                  ></div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Contenu des étapes -->
        <div class="min-h-[400px]">
          <!-- Étape 1 : Email -->
          @if (currentStep() === 1) {
            <div class="space-y-6 animate-slide-down">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">email</i>
                  Email CCNB <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  [(ngModel)]="formData.email"
                  placeholder="votre.nom@monccnb.ca"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  [class.border-red-500]="emailError()"
                />
                @if (emailError()) {
                  <p class="mt-2 text-sm text-red-500">{{ emailError() }}</p>
                }
                <p class="mt-2 text-xs text-gray-500">
                  <i class="material-icons text-sm align-middle">info</i>
                  Seuls les emails @monccnb.ca sont acceptés
                </p>
              </div>
              <button
                (click)="onEmailSubmit()"
                [disabled]="!formData.email || isSubmitting()"
                class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                @if (isSubmitting()) {
                  <i class="material-icons animate-spin align-middle">refresh</i>
                  <span class="ml-2">Vérification...</span>
                } @else {
                  Continuer
                }
              </button>
            </div>
          }

          <!-- Étape 2 : Informations personnelles -->
          @if (currentStep() === 2) {
            <div class="space-y-6 animate-slide-down">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">person</i>
                  Nom <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.nom"
                  placeholder="Votre nom"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">person_outline</i>
                  Prénom (optionnel)
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.prenom"
                  placeholder="Votre prénom"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">school</i>
                  Filière <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.filiere"
                  placeholder="Ex: Informatique, Gestion, etc."
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">location_on</i>
                  Campus <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="formData.campus"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                >
                  <option value="">Sélectionnez un campus</option>
                  <option value="Bathurst">Bathurst</option>
                  <option value="Campbellton">Campbellton</option>
                  <option value="Dieppe">Dieppe</option>
                  <option value="Edmundston">Edmundston</option>
                  <option value="Péninsule acadienne">Péninsule acadienne</option>
                </select>
              </div>
              <div class="flex gap-4">
                <button
                  (click)="currentStep.set(1)"
                  class="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Retour
                </button>
                <button
                  (click)="onInfoSubmit()"
                  [disabled]="!formData.nom || !formData.filiere || !formData.campus || isSubmitting()"
                  class="flex-1 bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  @if (isSubmitting()) {
                    <i class="material-icons animate-spin align-middle">refresh</i>
                    <span class="ml-2">Enregistrement...</span>
                  } @else {
                    Continuer
                  }
                </button>
              </div>
            </div>
          }

          <!-- Étape 3 : Envoi du code -->
          @if (currentStep() === 3) {
            <div class="space-y-6 animate-slide-down text-center">
              <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <i class="material-icons text-5xl text-blue-500 mb-4">email</i>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Code de validation envoyé</h3>
                <p class="text-gray-600 mb-4">
                  Un code de validation a été envoyé à <strong>{{ formData.email }}</strong>
                </p>
                <p class="text-sm text-gray-500">
                  Vérifiez votre boîte de réception (et vos spams). Le code est valide pendant 15 minutes.
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">vpn_key</i>
                  Code de validation <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.validationCode"
                  placeholder="Entrez le code à 6 chiffres"
                  maxlength="6"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent text-center text-2xl font-mono tracking-widest"
                />
              </div>
              <div class="flex gap-4">
                <button
                  (click)="resendCode()"
                  [disabled]="isSubmitting()"
                  class="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 font-semibold"
                >
                  Renvoyer le code
                </button>
                <button
                  (click)="onCodeVerify()"
                  [disabled]="!formData.validationCode || formData.validationCode.length !== 6 || isSubmitting()"
                  class="flex-1 bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  @if (isSubmitting()) {
                    <i class="material-icons animate-spin align-middle">refresh</i>
                    <span class="ml-2">Vérification...</span>
                  } @else {
                    Vérifier
                  }
                </button>
              </div>
            </div>
          }

          <!-- Étape 4 : Mot de passe -->
          @if (currentStep() === 4) {
            <div class="space-y-6 animate-slide-down">
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div class="flex items-center gap-2 text-green-700">
                  <i class="material-icons">check_circle</i>
                  <p class="font-semibold">Email vérifié avec succès !</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">lock</i>
                  Mot de passe <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  [(ngModel)]="formData.password"
                  placeholder="Minimum 6 caractères"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  [class.border-red-500]="passwordError()"
                />
                @if (passwordError()) {
                  <p class="mt-2 text-sm text-red-500">{{ passwordError() }}</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-sm align-middle text-ccnb-blue">lock_outline</i>
                  Confirmer le mot de passe <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  [(ngModel)]="formData.confirmPassword"
                  placeholder="Répétez le mot de passe"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  [class.border-red-500]="passwordError()"
                />
              </div>
              <button
                (click)="onPasswordSubmit()"
                [disabled]="!formData.password || !formData.confirmPassword || isSubmitting()"
                class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                @if (isSubmitting()) {
                  <i class="material-icons animate-spin align-middle">refresh</i>
                  <span class="ml-2">Création du profil...</span>
                } @else {
                  Créer mon profil
                }
              </button>
            </div>
          }

          <!-- Étape 5 : Succès -->
          @if (currentStep() === 5) {
            <div class="text-center space-y-6 animate-slide-down">
              <div class="bg-green-50 border-l-4 border-green-500 p-8 rounded-lg">
                <i class="material-icons text-6xl text-green-500 mb-4">check_circle</i>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Profil créé avec succès !</h3>
                <p class="text-gray-600">
                  Bienvenue {{ formData.nom }} ! Votre profil a été créé avec succès.
                </p>
              </div>
              <button
                (click)="goToHome()"
                class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition font-semibold"
              >
                Accéder au site
              </button>
            </div>
          }
        </div>

        <!-- Bouton pour switcher vers admin -->
        @if (currentStep() < 5) {
          <div class="mt-6 text-center border-t pt-4">
            <button
              (click)="switchToAdmin()"
              class="text-sm text-gray-600 hover:text-ccnb-red transition flex items-center justify-center gap-1 mx-auto"
            >
              <i class="material-icons text-sm">swap_horiz</i>
              <span>Vous êtes administrateur ?</span>
            </button>
          </div>
        }
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
export class CreateProfileComponent {
  private studentAuthService = inject(StudentAuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  currentStep = signal(1);
  isSubmitting = signal(false);
  emailError = signal<string>('');
  passwordError = signal<string>('');

  steps = [
    { number: 1, label: 'Email' },
    { number: 2, label: 'Informations' },
    { number: 3, label: 'Validation' },
    { number: 4, label: 'Mot de passe' },
    { number: 5, label: 'Terminé' }
  ];

  formData = {
    email: '',
    nom: '',
    prenom: '',
    filiere: '',
    campus: '',
    validationCode: '',
    password: '',
    confirmPassword: ''
  };

  onEmailSubmit() {
    this.emailError.set('');
    if (!this.formData.email) {
      this.emailError.set('L\'email est requis');
      return;
    }
    
    if (!this.formData.email.toLowerCase().endsWith('@monccnb.ca')) {
      this.emailError.set('L\'email doit être un email CCNB (@monccnb.ca)');
      return;
    }

    this.isSubmitting.set(true);
    this.studentAuthService.startProfileCreation(this.formData.email).subscribe({
      next: () => {
        this.toastService.success('Email vérifié - Vous pouvez continuer');
        this.currentStep.set(2);
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err.error?.message) {
          this.emailError.set(err.error.message);
        } else {
          this.toastService.error('Erreur - Impossible de vérifier l\'email');
        }
      }
    });
  }

  onInfoSubmit() {
    if (!this.formData.nom || !this.formData.filiere || !this.formData.campus) {
      this.toastService.error('Erreur - Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting.set(true);
    this.studentAuthService.completeProfileInfo(
      this.formData.email,
      this.formData.nom,
      this.formData.prenom || undefined,
      this.formData.filiere,
      this.formData.campus
    ).subscribe({
      next: () => {
        this.toastService.success('Informations enregistrées - Envoi du code de validation...');
        // Envoyer automatiquement le code
        this.sendCode();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastService.error(err.error?.message || 'Erreur - Impossible d\'enregistrer les informations');
      }
    });
  }

  sendCode() {
    this.studentAuthService.sendValidationCode(this.formData.email).subscribe({
      next: (response: any) => {
        this.currentStep.set(3);
        this.isSubmitting.set(false);
        
        // Si le code est retourné (email non envoyé), l'afficher
        if (response.code) {
          this.toastService.warning(`Code de validation: ${response.code} - Email non envoyé, utilisez ce code pour continuer`);
          // Optionnel: pré-remplir le champ avec le code
          this.formData.validationCode = response.code;
        } else {
          this.toastService.success('Code envoyé - Vérifiez votre boîte email');
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastService.error(err.error?.message || 'Erreur - Impossible d\'envoyer le code');
      }
    });
  }

  resendCode() {
    this.isSubmitting.set(true);
    this.sendCode();
  }

  onCodeVerify() {
    if (!this.formData.validationCode || this.formData.validationCode.length !== 6) {
      this.toastService.error('Erreur - Le code doit contenir 6 chiffres');
      return;
    }

    this.isSubmitting.set(true);
    this.studentAuthService.verifyValidationCode(this.formData.email, this.formData.validationCode).subscribe({
      next: () => {
        this.toastService.success('Code vérifié - Vous pouvez maintenant définir votre mot de passe');
        this.currentStep.set(4);
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastService.error(err.error?.message || 'Erreur - Code de validation incorrect');
      }
    });
  }

  onPasswordSubmit() {
    this.passwordError.set('');
    
    if (!this.formData.password || this.formData.password.length < 6) {
      this.passwordError.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.isSubmitting.set(true);
    this.studentAuthService.setPassword(
      this.formData.email,
      this.formData.password,
      this.formData.confirmPassword
    ).subscribe({
      next: () => {
        this.toastService.success('Profil créé - Bienvenue !');
        this.currentStep.set(5);
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err.error?.message) {
          this.passwordError.set(err.error.message);
        } else {
          this.toastService.error('Erreur - Impossible de créer le profil');
        }
      }
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  switchToAdmin() {
    this.router.navigate(['/admin']);
  }
}

