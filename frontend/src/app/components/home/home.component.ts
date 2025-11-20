import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-ccnb-blue to-ccnb-red text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">Association des Étudiants CCNB</h1>
          <p class="text-xl md:text-2xl mb-8">Votre espace interactif pour partager vos idées et vos expériences</p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Activités -->
          <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="flex justify-center mb-4">
              <div class="bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark rounded-full p-6">
                <i class="material-icons text-6xl text-white">event</i>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-center mb-4 text-ccnb-blue">Activités</h2>
            <p class="text-gray-600 text-center mb-6">
              Découvrez les activités organisées par l'association. Likez vos activités préférées !
            </p>
            <div class="text-center">
              <a routerLink="/activities" class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition inline-block">
                Voir les activités
              </a>
            </div>
          </div>

          <!-- Propositions -->
          <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="flex justify-center mb-4">
              <div class="bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark rounded-full p-6">
                <i class="material-icons text-6xl text-white">lightbulb</i>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-center mb-4 text-ccnb-blue">Propositions</h2>
            <p class="text-gray-600 text-center mb-6">
              Proposez vos idées pour améliorer la vie étudiante. Votez pour les meilleures idées !
            </p>
            <div class="text-center">
              <a routerLink="/proposals" class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition inline-block">
                Voir les propositions
              </a>
            </div>
          </div>

          <!-- Contact -->
          <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="flex justify-center mb-4">
              <div class="bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark rounded-full p-6">
                <i class="material-icons text-6xl text-white">mail</i>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-center mb-4 text-ccnb-blue">Contact</h2>
            <p class="text-gray-600 text-center mb-6">
              Contactez l'association pour toute question ou demande. Nous sommes là pour vous aider !
            </p>
            <div class="text-center">
              <a routerLink="/contact" class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition inline-block">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
}

