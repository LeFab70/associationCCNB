import { Component, signal, inject, ViewChild, ElementRef, AfterViewInit, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Proposal, Review, Contact, Activity, Admin, ActivityPhotoComment } from '../../services/api.service';
import { LinkifyPipe } from '../../pipes/linkify.pipe';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ChartService } from '../../services/chart.service';
import type { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkifyPipe],
  template: `
    @if (!isAuthenticated()) {
      <!-- Login Form -->
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-ccnb-blue/10 to-ccnb-red/10 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full">
          <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div class="text-center">
              <div class="flex justify-center mb-4">
                <div class="bg-ccnb-blue/10 rounded-full p-4">
                  <i class="material-icons text-5xl text-ccnb-blue">admin_panel_settings</i>
                </div>
              </div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">
                Connexion Admin
              </h2>
              <p class="text-gray-600 text-sm">Accédez au panneau d'administration</p>
            </div>
            
            <form class="space-y-5" (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-lg align-middle mr-1">person</i>
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  [(ngModel)]="username"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-ccnb-blue transition"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="material-icons text-lg align-middle mr-1">lock</i>
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  [(ngModel)]="password"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-ccnb-blue transition"
                  placeholder="Entrez votre mot de passe"
                />
              </div>

              @if (loginError()) {
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <i class="material-icons text-red-600">error</i>
                  <span class="text-red-600 text-sm">{{ loginError() }}</span>
                </div>
              }

              <button
                type="submit"
                [disabled]="!loginForm.valid || isLoggingIn()"
                class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ccnb-blue text-white rounded-lg hover:bg-ccnb-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ccnb-blue disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg"
              >
                @if (isLoggingIn()) {
                  <i class="material-icons animate-spin">refresh</i>
                  <span>Connexion...</span>
                } @else {
                  <i class="material-icons">login</i>
                  <span>Se connecter</span>
                }
              </button>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p class="text-xs text-blue-700">
                  <i class="material-icons text-sm align-middle">info</i>
                  Identifiants par défaut: <strong>admin</strong> / <strong>admin123</strong>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    } @else {
      <!-- Admin Dashboard -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-ccnb-blue">Administration</h1>
          <button
            (click)="logout()"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
        <nav class="flex space-x-1 overflow-x-auto">
          <button 
            (click)="activeTab.set('activities')"
            [class.bg-ccnb-blue]="activeTab() === 'activities'"
            [class.text-white]="activeTab() === 'activities'"
            [class.text-gray-700]="activeTab() !== 'activities'"
            [class.shadow-md]="activeTab() === 'activities'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">event</i>
            <span>Activités</span>
            <span [class.bg-white/20]="activeTab() === 'activities'" [class.bg-ccnb-blue/20]="activeTab() !== 'activities'" [class.text-white]="activeTab() === 'activities'" [class.text-ccnb-blue]="activeTab() !== 'activities'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ activities().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('proposals')"
            [class.bg-ccnb-blue]="activeTab() === 'proposals'"
            [class.text-white]="activeTab() === 'proposals'"
            [class.text-gray-700]="activeTab() !== 'proposals'"
            [class.shadow-md]="activeTab() === 'proposals'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">lightbulb</i>
            <span>Propositions</span>
            <span [class.bg-white/20]="activeTab() === 'proposals'" [class.bg-ccnb-blue/20]="activeTab() !== 'proposals'" [class.text-white]="activeTab() === 'proposals'" [class.text-ccnb-blue]="activeTab() !== 'proposals'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ proposals().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('reviews')"
            [class.bg-ccnb-blue]="activeTab() === 'reviews'"
            [class.text-white]="activeTab() === 'reviews'"
            [class.text-gray-700]="activeTab() !== 'reviews'"
            [class.shadow-md]="activeTab() === 'reviews'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">rate_review</i>
            <span>Avis</span>
            <span [class.bg-white/20]="activeTab() === 'reviews'" [class.bg-ccnb-blue/20]="activeTab() !== 'reviews'" [class.text-white]="activeTab() === 'reviews'" [class.text-ccnb-blue]="activeTab() !== 'reviews'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ reviews().length }}</span>
            @if (getPendingReviewsCount() > 0) {
              <span class="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{{ getPendingReviewsCount() }}</span>
            }
          </button>
          <button 
            (click)="activeTab.set('contacts')"
            [class.bg-ccnb-blue]="activeTab() === 'contacts'"
            [class.text-white]="activeTab() === 'contacts'"
            [class.text-gray-700]="activeTab() !== 'contacts'"
            [class.shadow-md]="activeTab() === 'contacts'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">mail</i>
            <span>Contacts</span>
            <span [class.bg-white/20]="activeTab() === 'contacts'" [class.bg-ccnb-blue/20]="activeTab() !== 'contacts'" [class.text-white]="activeTab() === 'contacts'" [class.text-ccnb-blue]="activeTab() !== 'contacts'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ contacts().length }}</span>
            @if (getUnreadContactsCount() > 0) {
              <span class="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{{ getUnreadContactsCount() }}</span>
            }
          </button>
          <button 
            (click)="activeTab.set('photo-comments')"
            [class.bg-ccnb-blue]="activeTab() === 'photo-comments'"
            [class.text-white]="activeTab() === 'photo-comments'"
            [class.text-gray-700]="activeTab() !== 'photo-comments'"
            [class.shadow-md]="activeTab() === 'photo-comments'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">comment</i>
            <span>Commentaires Photos</span>
            <span [class.bg-white/20]="activeTab() === 'photo-comments'" [class.bg-ccnb-blue/20]="activeTab() !== 'photo-comments'" [class.text-white]="activeTab() === 'photo-comments'" [class.text-ccnb-blue]="activeTab() !== 'photo-comments'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ pendingPhotoComments().length }}</span>
            @if (pendingPhotoComments().length > 0) {
              <span class="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{{ pendingPhotoComments().length }}</span>
            }
          </button>
          <button 
            (click)="activeTab.set('past-activities')"
            [class.bg-ccnb-blue]="activeTab() === 'past-activities'"
            [class.text-white]="activeTab() === 'past-activities'"
            [class.text-gray-700]="activeTab() !== 'past-activities'"
            [class.shadow-md]="activeTab() === 'past-activities'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">history</i>
            <span>Activités Passées</span>
            <span [class.bg-white/20]="activeTab() === 'past-activities'" [class.bg-ccnb-blue/20]="activeTab() !== 'past-activities'" [class.text-white]="activeTab() === 'past-activities'" [class.text-ccnb-blue]="activeTab() !== 'past-activities'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ pastActivities().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('admin-accounts')"
            [class.bg-ccnb-blue]="activeTab() === 'admin-accounts'"
            [class.text-white]="activeTab() === 'admin-accounts'"
            [class.text-gray-700]="activeTab() !== 'admin-accounts'"
            [class.shadow-md]="activeTab() === 'admin-accounts'"
            class="py-3 px-6 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 hover:bg-ccnb-blue/10"
          >
            <i class="material-icons text-lg">admin_panel_settings</i>
            <span>Comptes Admin</span>
            <span [class.bg-white/20]="activeTab() === 'admin-accounts'" [class.bg-ccnb-blue/20]="activeTab() !== 'admin-accounts'" [class.text-white]="activeTab() === 'admin-accounts'" [class.text-ccnb-blue]="activeTab() !== 'admin-accounts'" class="px-2 py-0.5 rounded-full text-xs font-bold">{{ admins().length }}</span>
          </button>
        </nav>
      </div>

      <!-- Activities Tab -->
      @if (activeTab() === 'activities') {
        <div class="space-y-6">
          <!-- Formulaire de création d'activité -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center gap-3 mb-4">
              <i class="material-icons text-3xl text-ccnb-blue">add_circle</i>
              <h2 class="text-2xl font-semibold">Créer une nouvelle activité</h2>
            </div>
            <form (ngSubmit)="onCreateActivity()" #activityForm="ngForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'activité</label>
                <input 
                  type="text" 
                  [(ngModel)]="activityFormData.name" 
                  name="activityName" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  placeholder="Ex: Tournoi de basketball"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  [(ngModel)]="activityFormData.proposalText" 
                  name="activityDescription" 
                  required
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  placeholder="Décrivez l'activité... Vous pouvez inclure des URLs (http://, https://, www.) qui seront automatiquement converties en liens cliquables."
                ></textarea>
                <p class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <i class="material-icons text-sm">info</i>
                  Les URLs dans le texte seront automatiquement converties en liens qui s'ouvriront dans un nouvel onglet.
                </p>
              </div>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                  <input 
                    type="text" 
                    [(ngModel)]="activityFormData.lieu" 
                    name="lieu" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                    placeholder="Ex: Gymnase du CCNB"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="activityFormData.dateActivite" 
                    name="dateActivite" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                  <input 
                    type="time" 
                    [(ngModel)]="activityFormData.heureActivite" 
                    name="heureActivite" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Type de billet</label>
                  <select 
                    [(ngModel)]="activityFormData.isFree" 
                    name="isFree" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  >
                    <option [value]="true">Gratuit</option>
                    <option [value]="false">Payant</option>
                  </select>
                </div>
                @if (!activityFormData.isFree) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prix ($)</label>
                    <input 
                      type="number" 
                      [(ngModel)]="activityFormData.prix" 
                      name="prix" 
                      min="0"
                      step="0.01"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                }
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Réservation requise</label>
                  <select 
                    [(ngModel)]="activityFormData.reservationRequired" 
                    name="reservationRequired" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  >
                    <option [value]="false">Non</option>
                    <option [value]="true">Oui</option>
                  </select>
                </div>
                @if (activityFormData.reservationRequired) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">URL de réservation</label>
                    <input 
                      type="url" 
                      [(ngModel)]="activityFormData.reservationUrl" 
                      name="reservationUrl" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                }
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Programme détaillé (optionnel)</label>
                <textarea 
                  [(ngModel)]="activityFormData.programme" 
                  name="programme" 
                  rows="6"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  placeholder="Détaillez le programme de l'activité..."
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Photo principale (optionnelle)</label>
                <input 
                  type="file" 
                  (change)="onActivityFileSelected($event)" 
                  accept="image/*"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                />
                @if (activitySelectedFile) {
                  <div class="mt-2 flex items-center gap-2">
                    <i class="material-icons text-gray-500 text-xl">image</i>
                    <span class="text-sm text-gray-600">{{ activitySelectedFile.name }}</span>
                    <button type="button" (click)="activitySelectedFile = null" class="ml-2 text-red-500 hover:text-red-700">
                      <i class="material-icons text-lg">close</i>
                    </button>
                  </div>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Photos supplémentaires (optionnelles)</label>
                <input 
                  type="file" 
                  (change)="onActivityPhotosSelected($event)" 
                  accept="image/*"
                  multiple
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <i class="material-icons text-sm">info</i>
                  Vous pouvez sélectionner plusieurs photos à la fois (Ctrl/Cmd + clic)
                </p>
                @if (activitySelectedPhotos.length > 0) {
                  <div class="mt-2 space-y-2">
                    @for (photo of activitySelectedPhotos; track $index) {
                      <div class="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <i class="material-icons text-gray-500 text-xl">image</i>
                        <span class="text-sm text-gray-600 flex-1">{{ photo.name }}</span>
                        <button type="button" (click)="removeActivityPhoto($index)" class="text-red-500 hover:text-red-700">
                          <i class="material-icons text-lg">close</i>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
              <button 
                type="submit" 
                [disabled]="!activityForm.valid || isCreatingActivity()"
                class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                @if (isCreatingActivity()) {
                  <i class="material-icons animate-spin">refresh</i>
                  <span>Création...</span>
                } @else {
                  <i class="material-icons">add</i>
                  <span>Créer l'activité</span>
                }
              </button>
            </form>
          </div>

          <!-- Recherche et Filtres -->
          <div class="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-fade-in">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2 text-ccnb-blue">
              <i class="material-icons text-ccnb-blue animate-pulse-slow">search</i>
              Rechercher et filtrer des activités
            </h3>
            <div class="space-y-4">
              <div class="flex gap-2">
                <input 
                  type="text" 
                  [ngModel]="searchTerm()"
                  (ngModelChange)="searchTerm.set($event)"
                  placeholder="Rechercher par titre ou description..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent transition-all duration-200 focus:scale-[1.02]"
                />
                @if (searchTerm()) {
                  <button 
                    (click)="clearSearch()"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <i class="material-icons">clear</i>
                  </button>
                }
              </div>
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <i class="material-icons text-base text-ccnb-blue">filter_list</i>
                  Filtrer par votes:
                </label>
                <select 
                  [ngModel]="activityVoteFilter()"
                  (ngModelChange)="activityVoteFilter.set($event)"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent transition-all duration-200 hover:shadow-md bg-white"
                >
                  <option value="all">Toutes ({{ activities().length }})</option>
                  <option value="voted">Avec votes ({{ votedActivitiesCount() }})</option>
                  <option value="not-voted">Sans votes ({{ notVotedActivitiesCount() }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section Activités Proposées (En attente de vote) -->
          <div class="space-y-3 mb-8">
            <div class="flex items-center gap-3 mb-4 animate-fade-in">
              <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-blue to-ccnb-red animate-pulse-slow"></div>
              <h3 class="text-xl font-bold text-ccnb-blue flex items-center gap-2">
                <i class="material-icons text-2xl animate-bounce-slow">pending</i>
                Activités Proposées ({{ filteredProposedActivities().length }})
              </h3>
              <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-red to-ccnb-blue animate-pulse-slow"></div>
            </div>
            <p class="text-gray-600 mb-4 text-center animate-fade-in">Ces activités sont en attente de vote. Publiez-les pour qu'elles soient confirmées.</p>
            
            <!-- Skeleton Loader -->
            @if (proposedActivities().length === 0 && activities().length > 0) {
              <div class="space-y-3">
                @for (skeleton of [1,2,3]; track skeleton) {
                  <div class="bg-white rounded-lg shadow-md border-2 border-gray-200 animate-pulse">
                    <div class="p-4 flex items-center gap-4">
                      <div class="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-5 bg-gray-300 rounded w-1/3"></div>
                        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
            
            @for (activity of filteredProposedActivities(); track activity.id; let i = $index) {
              <div class="bg-white rounded-lg shadow-md border-2 border-yellow-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slide-up-fade relative" 
                   [style.animation-delay]="i * 0.15 + 's'"
                   [style.animation-fill-mode]="'both'"
                   [class.border-l-4]="!activity.isActive" 
                   [class.border-l-gray-400]="!activity.isActive" 
                   [class.border-l-green-500]="activity.isActive">
                <!-- En-tête (toujours visible) -->
                <button 
                  (click)="toggleActivityExpand(activity.id)"
                  class="w-full p-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-yellow-50 hover:to-transparent transition-all duration-200"
                >
                  <div class="flex items-center gap-4 flex-1">
                    @if (activity.imageUrl) {
                      <div class="flex-shrink-0 transition-transform duration-300 hover:scale-110">
                        <img 
                          [src]="getImageUrl(activity.imageUrl)" 
                          alt="Photo"
                          class="w-16 h-16 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          (error)="handleImageError($event)"
                        />
                      </div>
                    } @else {
                      <div class="w-16 h-16 bg-gradient-to-br from-ccnb-blue to-ccnb-red rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-md hover:shadow-lg">
                        <i class="material-icons text-white text-2xl">event</i>
                      </div>
                    }
                    <div class="flex-1 text-left">
                      <div class="flex items-center gap-3 mb-1">
                        <h3 class="text-lg font-semibold text-gray-800 transition-all duration-200 hover:text-ccnb-blue">{{ activity.title }}</h3>
                        @if (activity.isActive) {
                          <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">Active</span>
                        } @else {
                          <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full shadow-sm">Inactive</span>
                        }
                      </div>
                      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        @if (activity.lieu) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">location_on</i>
                            {{ activity.lieu }}
                          </span>
                        }
                        @if (activity.dateActivite) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">calendar_today</i>
                            {{ activity.dateActivite | date:'shortDate' }}
                          </span>
                        }
                        @if (activity.heureActivite) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">schedule</i>
                            {{ activity.heureActivite }}
                          </span>
                        }
                        <span class="flex items-center gap-1 transition-all duration-200 hover:scale-105">
                          <i class="material-icons text-base transition-transform duration-200 hover:scale-110" [class.text-green-600]="activity.isFree" [class.text-orange-600]="!activity.isFree">
                            {{ activity.isFree ? 'money_off' : 'attach_money' }}
                          </i>
                          {{ activity.isFree ? 'Gratuit' : (activity.prix ? activity.prix + '$' : 'Payant') }}
                        </span>
                        @if (activity.reservationRequired) {
                          <span class="flex items-center gap-1 text-ccnb-blue transition-all duration-200 hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">event_available</i>
                            Réservation requise
                          </span>
                        }
                        <span class="flex items-center gap-1 transition-all duration-200 hover:text-red-500 hover:scale-105">
                          <i class="material-icons text-base text-red-500 transition-transform duration-200 hover:scale-110 animate-pulse-slow">favorite</i>
                          <span class="font-semibold">{{ activity.likeCount }}</span> vote(s)
                        </span>
                        <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                          <i class="material-icons text-base text-ccnb-blue transition-transform duration-200 hover:scale-110">comment</i>
                          <span class="font-semibold text-ccnb-blue">{{ activity.commentCount || 0 }}</span> commentaire(s)
                        </span>
                        @if (activity.reviewCount !== undefined && activity.reviewCount > 0) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base text-ccnb-blue transition-transform duration-200 hover:scale-110">rate_review</i>
                            <span class="font-semibold text-ccnb-blue">{{ activity.reviewCount }}</span> avis
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="material-icons transition-transform duration-300 ease-in-out" [class.rotate-180]="isActivityExpanded(activity.id)">
                      expand_more
                    </i>
                  </div>
                </button>
                
                <!-- Contenu dépliable -->
                @if (isActivityExpanded(activity.id)) {
                  <div class="border-t border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white animate-slide-down">
                    <div class="space-y-4">
                      <!-- Image principale (si disponible) -->
                      @if (activity.imageUrl) {
                        <div class="mb-4">
                          <img 
                            [src]="getImageUrl(activity.imageUrl)" 
                            [alt]="activity.title"
                            class="w-full h-64 object-cover rounded-lg shadow-md"
                            (error)="handleImageError($event)"
                          />
                        </div>
                      }
                      
                      <!-- Description -->
                      <div>
                        <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <i class="material-icons text-ccnb-blue text-lg">description</i>
                          Description
                        </h4>
                        <div class="text-gray-700 whitespace-pre-wrap" [innerHTML]="activity.description | linkify"></div>
                      </div>
                      
                      <!-- Programme -->
                      @if (activity.programme) {
                        <div>
                          <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-lg">list_alt</i>
                            Programme
                          </h4>
                          <div class="text-gray-700 whitespace-pre-wrap" [innerHTML]="activity.programme | linkify"></div>
                        </div>
                      }
                      
                      <!-- Informations complémentaires -->
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-lg">
                          <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-lg">info</i>
                            Informations
                          </h4>
                          <div class="space-y-2 text-sm">
                            @if (activity.lieu) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">location_on</i>
                                <span class="text-gray-600">Lieu:</span>
                                <span class="font-medium">{{ activity.lieu }}</span>
                              </div>
                            }
                            @if (activity.dateActivite) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">calendar_today</i>
                                <span class="text-gray-600">Date:</span>
                                <span class="font-medium">{{ activity.dateActivite | date:'fullDate' }}</span>
                              </div>
                            }
                            @if (activity.heureActivite) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">schedule</i>
                                <span class="text-gray-600">Heure:</span>
                                <span class="font-medium">{{ activity.heureActivite }}</span>
                              </div>
                            }
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-gray-400 text-base" [class.text-green-600]="activity.isFree" [class.text-orange-600]="!activity.isFree">
                                {{ activity.isFree ? 'money_off' : 'attach_money' }}
                              </i>
                              <span class="text-gray-600">Billet:</span>
                              <span class="font-medium">{{ activity.isFree ? 'Gratuit' : (activity.prix ? activity.prix + '$' : 'Payant') }}</span>
                            </div>
                            @if (activity.reservationRequired) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">event_available</i>
                                <span class="text-gray-600">Réservation:</span>
                                <span class="font-medium text-ccnb-blue">Requis</span>
                                @if (activity.reservationUrl) {
                                  <a [href]="activity.reservationUrl" target="_blank" class="text-ccnb-blue hover:underline ml-2">
                                    <i class="material-icons text-base">open_in_new</i>
                                  </a>
                                }
                              </div>
                            }
                          </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-lg">
                          <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-lg">analytics</i>
                            Statistiques
                          </h4>
                          <div class="space-y-2 text-sm">
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-red-500 text-base">favorite</i>
                              <span class="text-gray-600">Likes:</span>
                              <span class="font-medium">{{ activity.likeCount }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-ccnb-blue text-base">comment</i>
                              <span class="text-gray-600">Commentaires:</span>
                              <span class="font-medium text-ccnb-blue">{{ activity.commentCount || 0 }}</span>
                            </div>
                            @if (activity.reviewCount !== undefined && activity.reviewCount > 0) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-ccnb-blue text-base">rate_review</i>
                                <span class="text-gray-600">Avis:</span>
                                <span class="font-medium text-ccnb-blue">{{ activity.reviewCount }}</span>
                              </div>
                            }
                            @if (activity.photos && activity.photos.length > 0) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-ccnb-blue text-base">photo_library</i>
                                <span class="text-gray-600">Photos:</span>
                                <span class="font-medium">{{ activity.photos.length }}</span>
                              </div>
                            }
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-gray-400 text-base">access_time</i>
                              <span class="text-gray-600">Créé le:</span>
                              <span class="font-medium">{{ activity.createdAt | date:'short' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2 pt-4 border-t flex-wrap">
                        <button 
                          (click)="publishActivity(activity.id)"
                          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                        >
                          <i class="material-icons text-base animate-pulse-slow">publish</i>
                          Publier
                        </button>
                        <button 
                          (click)="toggleActivityStatus(activity.id)"
                          [class.bg-green-500]="!activity.isActive"
                          [class.bg-orange-500]="activity.isActive"
                          class="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-all duration-200 text-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                          [title]="activity.isActive ? 'Marquer comme passée (ne sera plus visible par les étudiants)' : 'Réactiver (sera visible par les étudiants)'"
                        >
                          <i class="material-icons text-base">{{ activity.isActive ? 'history' : 'check_circle' }}</i>
                          {{ activity.isActive ? 'Marquer comme passée' : 'Réactiver' }}
                        </button>
                        <button 
                          (click)="deleteActivity(activity.id)"
                          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                        >
                          <i class="material-icons text-base">delete</i>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <div class="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-lg p-8 text-center animate-fade-in border-2 border-dashed border-yellow-300">
                <i class="material-icons text-6xl text-gray-300 mb-4 animate-bounce-slow">pending_actions</i>
                <p class="text-gray-500 text-lg font-semibold">Aucune activité proposée</p>
                @if (activityVoteFilter() === 'voted') {
                  <p class="text-gray-400 text-sm mt-2">Aucune activité proposée avec des votes</p>
                } @else if (activityVoteFilter() === 'not-voted') {
                  <p class="text-gray-400 text-sm mt-2">Aucune activité proposée sans votes</p>
                } @else {
                  <p class="text-gray-400 text-sm mt-2">Créez une nouvelle activité pour commencer</p>
                }
              </div>
            }
          </div>

          <!-- Section Activités Publiées (Confirmées) -->
          <div class="space-y-3">
            <div class="flex items-center gap-3 mb-4 animate-fade-in">
              <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-blue to-ccnb-red animate-pulse-slow"></div>
              <h3 class="text-xl font-bold text-ccnb-blue flex items-center gap-2">
                <i class="material-icons text-2xl animate-bounce-slow">check_circle</i>
                Activités Publiées ({{ filteredPublishedActivities().length }})
              </h3>
              <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-red to-ccnb-blue animate-pulse-slow"></div>
            </div>
            <p class="text-gray-600 mb-4 text-center animate-fade-in">Ces activités sont confirmées et visibles par tous les utilisateurs.</p>
            
            <!-- Skeleton Loader -->
            @if (publishedActivities().length === 0 && activities().length > 0) {
              <div class="space-y-3">
                @for (skeleton of [1,2,3]; track skeleton) {
                  <div class="bg-white rounded-lg shadow-md border-2 border-gray-200 animate-pulse">
                    <div class="p-4 flex items-center gap-4">
                      <div class="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-5 bg-gray-300 rounded w-1/3"></div>
                        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
            
            @for (activity of filteredPublishedActivities(); track activity.id; let i = $index) {
              <div class="bg-white rounded-lg shadow-md border-2 border-green-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slide-up-fade relative" 
                   [style.animation-delay]="i * 0.15 + 's'"
                   [style.animation-fill-mode]="'both'"
                   [class.border-l-4]="!activity.isActive" 
                   [class.border-l-gray-400]="!activity.isActive" 
                   [class.border-l-green-500]="activity.isActive">
                <!-- En-tête (toujours visible) -->
                <button 
                  (click)="toggleActivityExpand(activity.id)"
                  class="w-full p-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200"
                >
                  <div class="flex items-center gap-4 flex-1">
                    @if (activity.imageUrl) {
                      <div class="flex-shrink-0 transition-transform duration-300 hover:scale-110">
                        <img 
                          [src]="getImageUrl(activity.imageUrl)" 
                          alt="Photo"
                          class="w-16 h-16 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          (error)="handleImageError($event)"
                        />
                      </div>
                    } @else {
                      <div class="w-16 h-16 bg-gradient-to-br from-ccnb-blue to-ccnb-red rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-md hover:shadow-lg">
                        <i class="material-icons text-white text-2xl">event</i>
                      </div>
                    }
                    <div class="flex-1 text-left">
                      <div class="flex items-center gap-3 mb-1">
                        <h3 class="text-lg font-semibold text-gray-800 transition-all duration-200 hover:text-ccnb-blue">{{ activity.title }}</h3>
                        @if (activity.isActive) {
                          <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">Active</span>
                        } @else {
                          <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full shadow-sm">Inactive</span>
                        }
                      </div>
                      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        @if (activity.lieu) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">location_on</i>
                            {{ activity.lieu }}
                          </span>
                        }
                        @if (activity.dateActivite) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">calendar_today</i>
                            {{ activity.dateActivite | date:'shortDate' }}
                          </span>
                        }
                        @if (activity.heureActivite) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">schedule</i>
                            {{ activity.heureActivite }}
                          </span>
                        }
                        <span class="flex items-center gap-1 transition-all duration-200 hover:scale-105">
                          <i class="material-icons text-base transition-transform duration-200 hover:scale-110" [class.text-green-600]="activity.isFree" [class.text-orange-600]="!activity.isFree">
                            {{ activity.isFree ? 'money_off' : 'attach_money' }}
                          </i>
                          {{ activity.isFree ? 'Gratuit' : (activity.prix ? activity.prix + '$' : 'Payant') }}
                        </span>
                        @if (activity.reservationRequired) {
                          <span class="flex items-center gap-1 text-ccnb-blue transition-all duration-200 hover:scale-105">
                            <i class="material-icons text-base transition-transform duration-200 hover:scale-110">event_available</i>
                            Réservation requise
                          </span>
                        }
                        <span class="flex items-center gap-1 transition-all duration-200 hover:text-red-500 hover:scale-105">
                          <i class="material-icons text-base text-red-500 transition-transform duration-200 hover:scale-110 animate-pulse-slow">favorite</i>
                          <span class="font-semibold">{{ activity.likeCount }}</span> vote(s)
                        </span>
                        <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                          <i class="material-icons text-base text-ccnb-blue transition-transform duration-200 hover:scale-110">comment</i>
                          <span class="font-semibold text-ccnb-blue">{{ activity.commentCount || 0 }}</span> commentaire(s)
                        </span>
                        @if (activity.reviewCount !== undefined && activity.reviewCount > 0) {
                          <span class="flex items-center gap-1 transition-all duration-200 hover:text-ccnb-blue hover:scale-105">
                            <i class="material-icons text-base text-ccnb-blue transition-transform duration-200 hover:scale-110">rate_review</i>
                            <span class="font-semibold text-ccnb-blue">{{ activity.reviewCount }}</span> avis
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="material-icons transition-transform duration-300 ease-in-out" [class.rotate-180]="isActivityExpanded(activity.id)">
                      expand_more
                    </i>
                  </div>
                </button>
                
                <!-- Badge de statut - toujours visible en bas -->
                <div class="px-4 pb-3 pt-2 border-t bg-gray-50 flex justify-center">
                  <span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <i class="material-icons text-base">check_circle</i>
                    Confirmée
                  </span>
                </div>
                
                <!-- Contenu dépliable -->
                @if (isActivityExpanded(activity.id)) {
                  <div class="border-t border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white animate-slide-down">
                    <div class="space-y-4">
                      <!-- Image principale (si disponible) -->
                      @if (activity.imageUrl) {
                        <div class="mb-4">
                          <img 
                            [src]="getImageUrl(activity.imageUrl)" 
                            [alt]="activity.title"
                            class="w-full h-64 object-cover rounded-lg shadow-md"
                            (error)="handleImageError($event)"
                          />
                        </div>
                      }
                      
                      <!-- Description -->
                      <div>
                        <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <i class="material-icons text-ccnb-blue text-lg">description</i>
                          Description
                        </h4>
                        <div class="text-gray-700 whitespace-pre-wrap" [innerHTML]="activity.description | linkify"></div>
                      </div>
                      
                      <!-- Programme -->
                      @if (activity.programme) {
                        <div>
                          <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-lg">list_alt</i>
                            Programme
                          </h4>
                          <div class="text-gray-700 whitespace-pre-wrap" [innerHTML]="activity.programme | linkify"></div>
                        </div>
                      }
                      
                      <!-- Informations complémentaires -->
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-lg">
                          <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-lg">info</i>
                            Informations
                          </h4>
                          <div class="space-y-2 text-sm">
                            @if (activity.lieu) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">location_on</i>
                                <span class="text-gray-600">Lieu:</span>
                                <span class="font-medium">{{ activity.lieu }}</span>
                              </div>
                            }
                            @if (activity.dateActivite) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">calendar_today</i>
                                <span class="text-gray-600">Date:</span>
                                <span class="font-medium">{{ activity.dateActivite | date:'fullDate' }}</span>
                              </div>
                            }
                            @if (activity.heureActivite) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">schedule</i>
                                <span class="text-gray-600">Heure:</span>
                                <span class="font-medium">{{ activity.heureActivite }}</span>
                              </div>
                            }
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-gray-400 text-base" [class.text-green-600]="activity.isFree" [class.text-orange-600]="!activity.isFree">
                                {{ activity.isFree ? 'money_off' : 'attach_money' }}
                              </i>
                              <span class="text-gray-600">Billet:</span>
                              <span class="font-medium">{{ activity.isFree ? 'Gratuit' : (activity.prix ? activity.prix + '$' : 'Payant') }}</span>
                            </div>
                            @if (activity.reservationRequired) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-gray-400 text-base">event_available</i>
                                <span class="text-gray-600">Réservation:</span>
                                <span class="font-medium text-ccnb-blue">Requis</span>
                                @if (activity.reservationUrl) {
                                  <a [href]="activity.reservationUrl" target="_blank" class="text-ccnb-blue hover:underline ml-2">
                                    <i class="material-icons text-base">open_in_new</i>
                                  </a>
                                }
                              </div>
                            }
                          </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-lg">
                          <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-lg">analytics</i>
                            Statistiques
                          </h4>
                          <div class="space-y-2 text-sm">
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-red-500 text-base">favorite</i>
                              <span class="text-gray-600">Likes:</span>
                              <span class="font-medium">{{ activity.likeCount }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-ccnb-blue text-base">comment</i>
                              <span class="text-gray-600">Commentaires:</span>
                              <span class="font-medium text-ccnb-blue">{{ activity.commentCount || 0 }}</span>
                            </div>
                            @if (activity.reviewCount !== undefined && activity.reviewCount > 0) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-ccnb-blue text-base">rate_review</i>
                                <span class="text-gray-600">Avis:</span>
                                <span class="font-medium text-ccnb-blue">{{ activity.reviewCount }}</span>
                              </div>
                            }
                            @if (activity.photos && activity.photos.length > 0) {
                              <div class="flex items-center gap-2">
                                <i class="material-icons text-ccnb-blue text-base">photo_library</i>
                                <span class="text-gray-600">Photos:</span>
                                <span class="font-medium">{{ activity.photos.length }}</span>
                              </div>
                            }
                            <div class="flex items-center gap-2">
                              <i class="material-icons text-gray-400 text-base">access_time</i>
                              <span class="text-gray-600">Créé le:</span>
                              <span class="font-medium">{{ activity.createdAt | date:'short' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2 pt-4 border-t flex-wrap">
                        <button 
                          (click)="unpublishActivity(activity.id)"
                          class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 text-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                        >
                          <i class="material-icons text-base animate-pulse-slow">unpublished</i>
                          Dépublier
                        </button>
                        <button 
                          (click)="toggleActivityStatus(activity.id)"
                          [class.bg-green-500]="!activity.isActive"
                          [class.bg-orange-500]="activity.isActive"
                          class="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-all duration-200 text-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                          [title]="activity.isActive ? 'Marquer comme passée (ne sera plus visible par les étudiants)' : 'Réactiver (sera visible par les étudiants)'"
                        >
                          <i class="material-icons text-base">{{ activity.isActive ? 'history' : 'check_circle' }}</i>
                          {{ activity.isActive ? 'Marquer comme passée' : 'Réactiver' }}
                        </button>
                        <button 
                          (click)="deleteActivity(activity.id)"
                          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                        >
                          <i class="material-icons text-base">delete</i>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <div class="bg-gradient-to-br from-gray-50 to-green-50 rounded-lg p-8 text-center animate-fade-in border-2 border-dashed border-green-300">
                <i class="material-icons text-6xl text-gray-300 mb-4 animate-bounce-slow">event_available</i>
                <p class="text-gray-500 text-lg font-semibold">Aucune activité publiée</p>
                @if (activityVoteFilter() === 'voted') {
                  <p class="text-gray-400 text-sm mt-2">Aucune activité publiée avec des votes</p>
                } @else if (activityVoteFilter() === 'not-voted') {
                  <p class="text-gray-400 text-sm mt-2">Aucune activité publiée sans votes</p>
                } @else {
                  <p class="text-gray-400 text-sm mt-2">Publiez une activité proposée pour qu'elle soit visible ici</p>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Proposals Tab -->
      @if (activeTab() === 'proposals') {
        <div class="space-y-6">
          <!-- Recherche et Graphique -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Recherche -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <i class="material-icons text-ccnb-blue">search</i>
                Rechercher des propositions
              </h3>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  [ngModel]="searchTerm()"
                  (ngModelChange)="searchTerm.set($event)"
                  placeholder="Rechercher par nom ou description..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                />
                @if (searchTerm()) {
                  <button 
                    (click)="clearSearch()"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <i class="material-icons">clear</i>
                  </button>
                }
              </div>
            </div>

            <!-- Graphique -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <i class="material-icons text-ccnb-blue">bar_chart</i>
                Statistiques des votes
              </h3>
              <div class="h-64">
                <canvas #chartCanvas></canvas>
              </div>
            </div>
          </div>

          <!-- Liste des propositions -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <i class="material-icons text-ccnb-blue">list</i>
              Liste des propositions ({{ filteredProposals().length }})
            </h3>
            @for (proposal of filteredProposals(); track proposal.id) {
              <div class="bg-white rounded-lg shadow-lg p-6" [class.border-l-4]="!proposal.isActive" [class.border-gray-400]="!proposal.isActive">
                <div class="flex gap-6">
                  @if (proposal.photoUrl) {
                    <div class="flex-shrink-0">
                      <img 
                        [src]="getImageUrl(proposal.photoUrl)" 
                        alt="Photo"
                        class="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  }
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <h3 class="text-lg font-semibold text-gray-800">{{ proposal.name }}</h3>
                        @if (proposal.isActive) {
                          <span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <i class="material-icons text-sm">check_circle</i>
                            Active
                          </span>
                        } @else {
                          <span class="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <i class="material-icons text-sm">cancel</i>
                            Inactive
                          </span>
                        }
                      </div>
                      <p class="text-sm text-gray-500">{{ proposal.createdAt | date:'short' }}</p>
                    </div>
                    <div class="text-gray-700 mb-4 whitespace-pre-wrap" [innerHTML]="proposal.proposalText | linkify"></div>
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <i class="material-icons text-lg">favorite</i>
                        <span class="font-semibold">{{ proposal.voteCount }} vote(s)</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button 
                      (click)="toggleProposalStatus(proposal.id)"
                      [class.bg-green-500]="!proposal.isActive"
                      [class.bg-gray-500]="proposal.isActive"
                      class="px-4 py-2 text-white rounded-lg hover:opacity-80 transition text-sm"
                    >
                      {{ proposal.isActive ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button 
                      (click)="deleteProposal(proposal.id)"
                      class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      <i class="material-icons text-xl align-middle">delete</i>
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-gray-500 text-center py-8">Aucune proposition</p>
            }
          </div>
        </div>
      }

      <!-- Reviews Tab -->
      @if (activeTab() === 'reviews') {
        <div class="space-y-4">
          <!-- Filtre -->
          <div class="bg-white rounded-lg shadow p-4 mb-4">
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-gray-700">Filtrer :</span>
              <button
                (click)="reviewFilter.set('all')"
                [class.bg-ccnb-blue]="reviewFilter() === 'all'"
                [class.text-white]="reviewFilter() === 'all'"
                [class.text-gray-700]="reviewFilter() !== 'all'"
                class="px-4 py-2 rounded-lg transition"
              >
                Tous ({{ reviews().length }})
              </button>
              <button
                (click)="reviewFilter.set('pending')"
                [class.bg-yellow-500]="reviewFilter() === 'pending'"
                [class.text-white]="reviewFilter() === 'pending'"
                [class.text-gray-700]="reviewFilter() !== 'pending'"
                class="px-4 py-2 rounded-lg transition"
              >
                En attente ({{ getPendingReviewsCount() }})
              </button>
              <button
                (click)="reviewFilter.set('approved')"
                [class.bg-green-500]="reviewFilter() === 'approved'"
                [class.text-white]="reviewFilter() === 'approved'"
                [class.text-gray-700]="reviewFilter() !== 'approved'"
                class="px-4 py-2 rounded-lg transition"
              >
                Approuvés ({{ getApprovedReviewsCount() }})
              </button>
            </div>
          </div>

          @for (review of getFilteredReviews(); track review.id) {
            <div class="bg-white rounded-lg shadow-lg p-6" [class.border-l-4]="!review.isApproved" [class.border-yellow-500]="!review.isApproved" [class.border-green-500]="review.isApproved">
              <div class="flex gap-6">
                @if (review.photoUrl) {
                  <div class="flex-shrink-0">
                    <img 
                      [src]="getImageUrl(review.photoUrl)" 
                      alt="Photo"
                      class="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>
                }
                <div class="flex-1">
                  <!-- Activité associée - Mise en évidence -->
                  @if (review.activityId && review.activityTitle) {
                    <div class="mb-4 p-4 bg-gradient-to-r from-ccnb-blue/20 to-ccnb-red/20 rounded-lg border-2 border-ccnb-blue shadow-md">
                      <div class="flex items-center gap-3">
                        <div class="bg-ccnb-blue rounded-full p-2">
                          <i class="material-icons text-white text-xl">event</i>
                        </div>
                        <div class="flex-1">
                          <p class="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Activité associée:</p>
                          <h4 class="text-base font-bold text-ccnb-blue hover:text-ccnb-red transition-colors">{{ review.activityTitle }}</h4>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="mb-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                      <div class="flex items-center gap-2">
                        <i class="material-icons text-yellow-600 text-lg">warning</i>
                        <div>
                          <p class="text-sm font-semibold text-yellow-800">Aucune activité associée trouvée</p>
                          <p class="text-xs text-yellow-700 mt-1">ID de l'avis: {{ review.id }}</p>
                          @if (review.activityId) {
                            <p class="text-xs text-yellow-700">Activity ID présent mais titre manquant: {{ review.activityId }}</p>
                          }
                        </div>
                      </div>
                    </div>
                  }
                  
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <h3 class="text-lg font-semibold text-gray-800">{{ review.name }}</h3>
                      @if (review.isApproved) {
                        <span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <i class="material-icons text-sm">check_circle</i>
                          Approuvé
                        </span>
                      } @else {
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <i class="material-icons text-sm">schedule</i>
                          En attente d'approbation
                        </span>
                      }
                    </div>
                    <p class="text-sm text-gray-500">{{ review.createdAt | date:'short' }}</p>
                  </div>
                  <p class="text-gray-700 mb-4 whitespace-pre-wrap">{{ review.reviewText }}</p>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <i class="material-icons text-lg">favorite</i>
                    <span>{{ review.likeCount }} like(s)</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button 
                    (click)="toggleReviewApproval(review.id)"
                    [class.bg-green-500]="!review.isApproved"
                    [class.bg-yellow-500]="review.isApproved"
                    [class.text-white]="true"
                    class="px-4 py-2 rounded-lg hover:opacity-80 transition flex items-center gap-2"
                    [title]="review.isApproved ? 'Désapprouver' : 'Approuver'"
                  >
                    @if (review.isApproved) {
                      <i class="material-icons text-lg">visibility_off</i>
                      <span class="text-sm">Désapprouver</span>
                    } @else {
                      <i class="material-icons text-lg">check</i>
                      <span class="text-sm">Approuver</span>
                    }
                  </button>
                  <button 
                    (click)="deleteReview(review.id)"
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <i class="material-icons text-lg">delete</i>
                    <span class="text-sm">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="text-center py-12">
              <i class="material-icons text-6xl text-gray-300 mb-4">comment</i>
              <p class="text-gray-500 text-lg">Aucun avis</p>
            </div>
          }
        </div>
      }

      <!-- Photo Comments Tab -->
      @if (activeTab() === 'photo-comments') {
        <div class="space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div class="flex items-center gap-2">
              <i class="material-icons text-blue-500">info</i>
              <p class="text-blue-700 text-sm">
                Modérez les commentaires laissés sur les photos des activités. Seuls les commentaires approuvés seront visibles par les étudiants.
              </p>
            </div>
          </div>
          
          @for (comment of pendingPhotoComments(); track comment.id) {
            <div class="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">{{ comment.name }}</h3>
                    @if (comment.isApproved) {
                      <span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <i class="material-icons text-sm">check_circle</i>
                        Approuvé
                      </span>
                    } @else {
                      <span class="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <i class="material-icons text-sm">schedule</i>
                        En attente
                      </span>
                    }
                  </div>
                  <p class="text-sm text-gray-500 mb-3">{{ comment.createdAt | date:'short' }}</p>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ comment.commentText }}</p>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                  @if (!comment.isApproved) {
                    <button 
                      (click)="approvePhotoComment(comment.id)"
                      class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                      title="Approuver ce commentaire"
                    >
                      <i class="material-icons text-lg">check</i>
                      <span class="text-sm">Approuver</span>
                    </button>
                  }
                  <button 
                    (click)="rejectPhotoComment(comment.id)"
                    [class.bg-yellow-500]="comment.isApproved"
                    [class.bg-red-500]="!comment.isApproved"
                    class="px-4 py-2 text-white rounded-lg hover:opacity-80 transition flex items-center gap-2"
                    [title]="comment.isApproved ? 'Désapprouver' : 'Rejeter'"
                  >
                    <i class="material-icons text-lg">{{ comment.isApproved ? 'visibility_off' : 'close' }}</i>
                    <span class="text-sm">{{ comment.isApproved ? 'Désapprouver' : 'Rejeter' }}</span>
                  </button>
                  <button 
                    (click)="deletePhotoComment(comment.id)"
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                    title="Supprimer ce commentaire"
                  >
                    <i class="material-icons text-lg">delete</i>
                    <span class="text-sm">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="text-center py-12 bg-gray-50 rounded-lg">
              <i class="material-icons text-6xl text-gray-300 mb-4">comment</i>
              <p class="text-gray-500 text-lg">Aucun commentaire en attente de modération</p>
            </div>
          }
        </div>
      }

      <!-- Contacts Tab -->
      @if (activeTab() === 'contacts') {
        <div class="space-y-4">
          @for (contact of contacts(); track contact.id) {
            <div class="bg-white rounded-lg shadow p-6" [class.bg-gray-50]="contact.isRead">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold">{{ contact.name }}</h3>
                    <span class="text-sm text-gray-500">{{ contact.email }}</span>
                    @if (contact.isRead) {
                      <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Lu</span>
                    } @else {
                      <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Non lu</span>
                    }
                  </div>
                  <p class="text-sm text-gray-500 mb-2">{{ contact.createdAt | date:'short' }}</p>
                  <p class="text-gray-700">{{ contact.message }}</p>
                </div>
                <div class="flex gap-2 ml-4">
                  @if (!contact.isRead) {
                    <button 
                      (click)="markAsRead(contact.id)"
                      class="text-blue-500 hover:text-blue-700"
                      title="Marquer comme lu"
                    >
                      <i class="material-icons text-xl align-middle">check</i>
                    </button>
                  }
                  <button 
                    (click)="deleteContact(contact.id)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <i class="material-icons text-xl align-middle">delete</i>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <p class="text-gray-500 text-center py-8">Aucun contact</p>
          }
        </div>
      }

      <!-- Past Activities Tab -->
      @if (activeTab() === 'past-activities') {
        <div class="space-y-6">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div class="flex items-center gap-2">
              <i class="material-icons text-blue-500">info</i>
              <p class="text-blue-700 text-sm">
                Ajoutez des photos aux activités passées pour que les étudiants puissent les voir, les liker et commenter.
              </p>
            </div>
          </div>
          
          @for (activity of pastActivities(); track activity.id) {
            <div class="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden">
              <div class="p-6">
                <div class="flex items-start gap-4 mb-4">
                  @if (activity.imageUrl) {
                    <img 
                      [src]="getImageUrl(activity.imageUrl)" 
                      [alt]="activity.title"
                      class="w-24 h-24 object-cover rounded-lg"
                      (error)="handleImageError($event)"
                    />
                  }
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ activity.title }}</h3>
                    <p class="text-sm text-gray-600 mb-2">
                      <i class="material-icons text-base align-middle">calendar_today</i>
                      Date: {{ activity.dateActivite | date:'fullDate' }}
                    </p>
                    <p class="text-gray-700 text-sm line-clamp-2">{{ activity.description }}</p>
                  </div>
                </div>
                
                <!-- Formulaire d'ajout de photos -->
                <div class="border-t pt-4 mt-4">
                  <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i class="material-icons text-ccnb-blue">add_photo_alternate</i>
                    Ajouter des photos
                  </h4>
                  <form (ngSubmit)="addPhotoToPastActivity(activity.id)" class="space-y-3">
                    <input
                      type="file"
                      #photoInput
                      (change)="onPastActivityPhotoSelected($event, activity.id)"
                      accept="image/*"
                      multiple
                      class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue"
                    />
                    <button
                      type="submit"
                      [disabled]="!selectedPastActivityPhotos.has(activity.id) || selectedPastActivityPhotos.get(activity.id)?.length === 0"
                      class="px-4 py-2 bg-ccnb-blue text-white rounded-lg hover:bg-ccnb-red transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i class="material-icons text-base align-middle">upload</i>
                      Ajouter les photos
                    </button>
                  </form>
                  
                  <!-- Photos existantes -->
                  @if (activity.photos && activity.photos.length > 0) {
                    <div class="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-5 border-2 border-gray-200 shadow-lg animate-fade-in">
                      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div class="flex flex-wrap items-center gap-3">
                          <h5 class="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <i class="material-icons text-ccnb-blue text-2xl">photo_library</i>
                            <span>Photos existantes</span>
                            <span class="bg-ccnb-blue text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                              {{ activity.photos.length }}
                            </span>
                          </h5>
                          @if (getSelectedPhotosCount(activity.id) > 0) {
                            <span class="bg-ccnb-blue text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse-slow shadow-lg flex items-center gap-2">
                              <i class="material-icons text-base">check_circle</i>
                              {{ getSelectedPhotosCount(activity.id) }} sélectionnée(s)
                            </span>
                          }
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                          <button
                            (click)="toggleSelectAllPhotos(activity.id)"
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transform font-medium"
                            title="Sélectionner toutes les photos"
                          >
                            <i class="material-icons text-base">{{ areAllPhotosSelected(activity.id) ? 'deselect' : 'select_all' }}</i>
                            <span>{{ areAllPhotosSelected(activity.id) ? 'Tout désélectionner' : 'Tout sélectionner' }}</span>
                          </button>
                          @if (getSelectedPhotosCount(activity.id) > 0) {
                            <button
                              (click)="deleteSelectedPhotos(activity.id)"
                              [disabled]="isDeletingPhotos()"
                              class="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm flex items-center gap-2 shadow-lg hover:shadow-xl animate-shake disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none"
                              title="Supprimer les photos sélectionnées"
                            >
                              <i class="material-icons text-base" [class.animate-spin]="isDeletingPhotos()">{{ isDeletingPhotos() ? 'hourglass_empty' : 'delete_sweep' }}</i>
                              <span>{{ isDeletingPhotos() ? 'Suppression...' : 'Supprimer (' + getSelectedPhotosCount(activity.id) + ')' }}</span>
                            </button>
                          }
                        </div>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        @for (photo of activity.photos; track photo.id; let i = $index) {
                          <div 
                            class="relative group cursor-pointer transition-all duration-300 hover:scale-105 transform animate-fade-in"
                            [style.animation-delay]="i * 0.05 + 's'"
                            [class.ring-4]="isPhotoSelected(activity.id, photo.id)"
                            [class.ring-ccnb-blue]="isPhotoSelected(activity.id, photo.id)"
                            [class.ring-offset-2]="isPhotoSelected(activity.id, photo.id)"
                            [class.shadow-xl]="isPhotoSelected(activity.id, photo.id)"
                            (click)="togglePhotoSelection(activity.id, photo.id)"
                          >
                            <!-- Checkbox de sélection -->
                            <div class="absolute top-2 left-2 z-20">
                              <div 
                                class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                                [class.bg-ccnb-blue]="isPhotoSelected(activity.id, photo.id)"
                                [class.bg-white/90]="!isPhotoSelected(activity.id, photo.id)"
                                [class.shadow-lg]="isPhotoSelected(activity.id, photo.id)"
                                [class.animate-pulse-slow]="isPhotoSelected(activity.id, photo.id)"
                              >
                                <i 
                                  class="material-icons text-base transition-transform duration-200"
                                  [class.text-white]="isPhotoSelected(activity.id, photo.id)"
                                  [class.text-gray-500]="!isPhotoSelected(activity.id, photo.id)"
                                  [class.scale-125]="isPhotoSelected(activity.id, photo.id)"
                                >{{ isPhotoSelected(activity.id, photo.id) ? 'check_circle' : 'radio_button_unchecked' }}</i>
                              </div>
                            </div>
                            
                            <!-- Image -->
                            <div class="relative overflow-hidden rounded-lg border-2 transition-all duration-300"
                                 [class.border-ccnb-blue]="isPhotoSelected(activity.id, photo.id)"
                                 [class.border-gray-200]="!isPhotoSelected(activity.id, photo.id)"
                                 [class.shadow-lg]="isPhotoSelected(activity.id, photo.id)">
                              <img 
                                [src]="getImageUrl(photo.photoUrl)" 
                                alt="Photo"
                                class="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110"
                                (error)="handleImageError($event)"
                                loading="lazy"
                              />
                              <!-- Overlay au survol -->
                              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            <!-- Bouton de suppression individuelle -->
                            <button
                              (click)="deleteActivityPhoto(photo.id!); $event.stopPropagation()"
                              class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg z-20 backdrop-blur-sm"
                              title="Supprimer cette photo"
                            >
                              <i class="material-icons text-base">delete</i>
                            </button>
                            
                            <!-- Indicateur de sélection en bas -->
                            @if (isPhotoSelected(activity.id, photo.id)) {
                              <div class="absolute bottom-0 left-0 right-0 bg-ccnb-blue/90 text-white text-xs font-bold py-1 text-center backdrop-blur-sm animate-fade-in">
                                Sélectionnée
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="bg-gray-50 rounded-lg p-8 text-center">
              <i class="material-icons text-6xl text-gray-300 mb-4">history</i>
              <p class="text-gray-500 text-lg">Aucune activité passée</p>
            </div>
          }
        </div>
      }

      <!-- Admin Accounts Tab -->
      @if (activeTab() === 'admin-accounts') {
        <div class="space-y-6">
          <!-- Formulaire de création d'admin -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center gap-3 mb-4">
              <i class="material-icons text-3xl text-ccnb-blue">person_add</i>
              <h2 class="text-2xl font-semibold">Créer un nouveau compte admin</h2>
            </div>
            <form (ngSubmit)="createAdmin()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
                <input
                  type="text"
                  [(ngModel)]="newAdminUsername"
                  name="newAdminUsername"
                  required
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue"
                  placeholder="Entrez le nom d'utilisateur"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  type="password"
                  [(ngModel)]="newAdminPassword"
                  name="newAdminPassword"
                  required
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue"
                  placeholder="Entrez le mot de passe"
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-ccnb-blue text-white rounded-lg hover:bg-ccnb-red transition-all duration-200"
              >
                <i class="material-icons text-base align-middle">add</i>
                Créer le compte
              </button>
            </form>
          </div>

          <!-- Liste des admins -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-xl font-semibold mb-4">Comptes admin existants</h3>
            <div class="space-y-3">
              @for (admin of admins(); track admin.id) {
                <div class="border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <h4 class="text-lg font-semibold">{{ admin.username }}</h4>
                      @if (admin.isActive) {
                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Actif</span>
                      } @else {
                        <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactif</span>
                      }
                    </div>
                    <p class="text-sm text-gray-500 mt-1">
                      Créé le {{ admin.createdAt | date:'short' }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      (click)="toggleAdminStatus(admin.id)"
                      [class.bg-green-500]="!admin.isActive"
                      [class.bg-gray-500]="admin.isActive"
                      class="px-3 py-2 text-white rounded-lg hover:opacity-80 transition-all text-sm"
                      [title]="admin.isActive ? 'Désactiver' : 'Activer'"
                    >
                      <i class="material-icons text-base">{{ admin.isActive ? 'toggle_on' : 'toggle_off' }}</i>
                    </button>
                    <button
                      (click)="openChangePasswordModal(admin.id)"
                      class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      title="Changer le mot de passe"
                    >
                      <i class="material-icons text-base">lock</i>
                    </button>
                    <button
                      (click)="deleteAdmin(admin.id)"
                      class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      title="Supprimer"
                    >
                      <i class="material-icons text-base">delete</i>
                    </button>
                  </div>
                </div>
              } @empty {
                <p class="text-gray-500 text-center py-4">Aucun compte admin</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal pour changer le mot de passe -->
      @if (showChangePasswordModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-semibold mb-4">Changer le mot de passe</h3>
            <form (ngSubmit)="changeAdminPassword()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  required
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue"
                  placeholder="Entrez le nouveau mot de passe"
                />
              </div>
              <div class="flex gap-2">
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-ccnb-blue text-white rounded-lg hover:bg-ccnb-red transition-all"
                >
                  Changer
                </button>
                <button
                  type="button"
                  (click)="closeChangePasswordModal()"
                  class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      </div>
    }
  `
})
export class AdminComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  username = '';
  password = '';
  loginError = signal('');
  isLoggingIn = signal(false);
  
  activeTab = signal<'activities' | 'proposals' | 'reviews' | 'contacts' | 'photo-comments' | 'past-activities' | 'admin-accounts'>('activities');
  activities = signal<Activity[]>([]);
  proposedActivities = signal<Activity[]>([]);
  publishedActivities = signal<Activity[]>([]);
  pastActivities = signal<Activity[]>([]);
  proposals = signal<Proposal[]>([]);
  reviews = signal<Review[]>([]);
  contacts = signal<Contact[]>([]);
  admins = signal<Admin[]>([]);
  pendingPhotoComments = signal<ActivityPhotoComment[]>([]);
  reviewFilter = signal<'all' | 'pending' | 'approved'>('all');
  activityVoteFilter = signal<'all' | 'voted' | 'not-voted'>('all'); // Filtre pour activités votées/non votées
  
  activityFormData = {
    name: '',
    proposalText: '',
    programme: '',
    lieu: '',
    dateActivite: '',
    heureActivite: '',
    isFree: true,
    prix: 0,
    reservationRequired: false,
    reservationUrl: '',
    photo: null as File | null
  };
  
  expandedActivities = signal<Set<number>>(new Set());
  activitySelectedFile: File | null = null;
  activitySelectedPhotos: File[] = [];
  selectedPastActivityPhotos = new Map<number, File[]>();
  selectedPhotosForDeletion = new Map<number, Set<number>>(); // activityId -> Set<photoId>
  isCreatingActivity = signal(false);
  searchTerm = signal('');
  isDeletingPhotos = signal(false);
  
  // Admin account management
  newAdminUsername = '';
  newAdminPassword = '';
  showChangePasswordModal = signal(false);
  adminIdToChangePassword: number | null = null;
  newPassword = '';
  
  filteredActivities = computed(() => {
    const activities = this.activities();
    const search = this.searchTerm().toLowerCase();
    if (search) {
      return activities.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.description.toLowerCase().includes(search)
      );
    }
    return activities;
  });
  
  filteredProposedActivities = computed(() => {
    let activities = this.proposedActivities();
    const search = this.searchTerm().toLowerCase();
    const voteFilter = this.activityVoteFilter();
    
    // Filtrer par recherche
    if (search) {
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.description.toLowerCase().includes(search)
      );
    }
    
    // Filtrer par vote
    if (voteFilter === 'voted') {
      activities = activities.filter(a => a.likeCount > 0);
    } else if (voteFilter === 'not-voted') {
      activities = activities.filter(a => a.likeCount === 0);
    }
    
    return activities;
  });
  
  filteredPublishedActivities = computed(() => {
    let activities = this.publishedActivities();
    const search = this.searchTerm().toLowerCase();
    const voteFilter = this.activityVoteFilter();
    
    // Filtrer par recherche
    if (search) {
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.description.toLowerCase().includes(search)
      );
    }
    
    // Filtrer par vote
    if (voteFilter === 'voted') {
      activities = activities.filter(a => a.likeCount > 0);
    } else if (voteFilter === 'not-voted') {
      activities = activities.filter(a => a.likeCount === 0);
    }
    
    return activities;
  });

  // Computed signals pour les compteurs de votes (utilise toutes les activités)
  votedActivitiesCount = computed(() => {
    return this.activities().filter(a => a.likeCount > 0).length;
  });

  notVotedActivitiesCount = computed(() => {
    return this.activities().filter(a => a.likeCount === 0).length;
  });

  filteredProposals = computed(() => {
    const proposals = this.proposals();
    const search = this.searchTerm().toLowerCase();
    if (search) {
      return proposals.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.proposalText.toLowerCase().includes(search)
      );
    }
    return proposals;
  });

  constructor() {
    // Check if already authenticated
    if (this.authService.checkAuth()) {
      this.loadData();
    }
  }

  ngOnInit() {
    // Chart.js est déjà chargé de manière statique
  }

  ngAfterViewInit() {
    // Chart will be initialized when data is loaded
    setTimeout(() => this.updateChart(), 100);
  }

  loadData() {
    this.loadActivities();
    this.loadProposals();
    this.loadReviews();
    this.loadContacts();
    this.loadPastActivities();
    this.loadAdmins();
    this.loadPendingPhotoComments();
  }

  loadActivities() {
    // Charger toutes les activités (pour compatibilité)
    this.apiService.getAllActivitiesForAdmin().subscribe({
      next: (data) => {
        this.activities.set(data);
        setTimeout(() => this.updateChart(), 100);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des activités:', err);
        this.toastService.error('Erreur lors du chargement des activités');
      }
    });
    
    // Charger les activités proposées séparément progressivement
    this.apiService.getProposedActivitiesForAdmin().subscribe({
      next: (data) => {
        this.loadActivitiesProgressively(data, this.proposedActivities, 100);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des activités proposées:', err);
      }
    });
    
    // Charger les activités publiées séparément progressivement
    this.apiService.getPublishedActivitiesForAdmin().subscribe({
      next: (data) => {
        this.loadActivitiesProgressively(data, this.publishedActivities, 100);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des activités publiées:', err);
      }
    });
  }

  private loadActivitiesProgressively(
    activities: any[],
    targetSignal: typeof this.proposedActivities | typeof this.publishedActivities,
    delayMs: number
  ) {
    targetSignal.set([]);
    activities.forEach((activity, index) => {
      setTimeout(() => {
        targetSignal.update(current => [...current, activity]);
      }, index * delayMs);
    });
  }

  onLogin() {
    this.isLoggingIn.set(true);
    this.loginError.set('');
    
    this.apiService.adminLogin({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.setAuthenticated(true);
          this.toastService.success('Connexion réussie !');
          this.loadData();
        } else {
          const errorMsg = response.message || 'Identifiants incorrects';
          this.loginError.set(errorMsg);
          this.toastService.error(errorMsg);
        }
        this.isLoggingIn.set(false);
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        let errorMsg = 'Erreur de connexion';
        if (err.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else if (err.status === 401) {
          errorMsg = 'Identifiants incorrects';
        } else {
          errorMsg = 'Erreur de connexion: ' + (err.error?.message || err.message || 'Erreur inconnue');
        }
        this.loginError.set(errorMsg);
        this.toastService.error(errorMsg);
        this.isLoggingIn.set(false);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.username = '';
    this.password = '';
    this.toastService.info('Vous avez été déconnecté');
  }

  loadProposals() {
    this.apiService.getAllProposalsForAdmin().subscribe({
      next: (data) => {
        this.proposals.set(data);
        this.updateChart();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors du chargement des activités');
      }
    });
  }

  loadReviews() {
    this.apiService.getAllReviews().subscribe({
      next: (data) => {
        console.log('Reviews chargées:', data);
        // Log pour déboguer les activités associées
        data.forEach(review => {
          if (review.activityId && review.activityTitle) {
            console.log(`Review ${review.id} associée à l'activité: ${review.activityTitle} (ID: ${review.activityId})`);
          } else {
            console.warn(`Review ${review.id} n'a pas d'activité associée`);
          }
        });
        this.reviews.set(data);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors du chargement des avis');
      }
    });
  }

  loadContacts() {
    this.apiService.getContacts().subscribe({
      next: (data) => this.contacts.set(data),
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors du chargement des contacts');
      }
    });
  }

  loadPastActivities() {
    this.apiService.getPastActivitiesForAdmin().subscribe({
      next: (data) => {
        this.pastActivities.set(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des activités passées:', err);
        this.toastService.error('Erreur lors du chargement des activités passées');
      }
    });
  }

  loadAdmins() {
    this.apiService.getAllAdmins().subscribe({
      next: (data) => {
        this.admins.set(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des admins:', err);
        this.toastService.error('Erreur lors du chargement des admins');
      }
    });
  }

  onPastActivityPhotoSelected(event: Event, activityId: number) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedPastActivityPhotos.set(activityId, files);
    }
  }

  addPhotoToPastActivity(activityId: number) {
    const files = this.selectedPastActivityPhotos.get(activityId);
    if (!files || files.length === 0) {
      this.toastService.error('Veuillez sélectionner au moins une photo');
      return;
    }

    // Ajouter chaque photo une par une
    let completed = 0;
    let errors = 0;

    files.forEach((file, index) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('displayOrder', index.toString());

      this.apiService.addPhotoToActivity(activityId, formData).subscribe({
        next: () => {
          completed++;
          if (completed + errors === files.length) {
            if (errors === 0) {
              this.toastService.success(`${completed} photo(s) ajoutée(s) avec succès`);
            } else {
              this.toastService.warning(`${completed} photo(s) ajoutée(s), ${errors} erreur(s)`);
            }
            this.selectedPastActivityPhotos.delete(activityId);
            this.loadPastActivities();
          }
        },
        error: (err) => {
          errors++;
          console.error('Erreur lors de l\'ajout de la photo:', err);
          if (completed + errors === files.length) {
            if (completed > 0) {
              this.toastService.warning(`${completed} photo(s) ajoutée(s), ${errors} erreur(s)`);
            } else {
              this.toastService.error('Erreur lors de l\'ajout des photos');
            }
            this.loadPastActivities();
          }
        }
      });
    });
  }

  // Sélection multiple de photos
  togglePhotoSelection(activityId: number, photoId: number) {
    if (!this.selectedPhotosForDeletion.has(activityId)) {
      this.selectedPhotosForDeletion.set(activityId, new Set());
    }
    const selected = this.selectedPhotosForDeletion.get(activityId)!;
    if (selected.has(photoId)) {
      selected.delete(photoId);
    } else {
      selected.add(photoId);
    }
    this.selectedPhotosForDeletion.set(activityId, new Set(selected));
  }

  isPhotoSelected(activityId: number, photoId: number): boolean {
    return this.selectedPhotosForDeletion.get(activityId)?.has(photoId) || false;
  }

  getSelectedPhotosCount(activityId: number): number {
    return this.selectedPhotosForDeletion.get(activityId)?.size || 0;
  }

  toggleSelectAllPhotos(activityId: number) {
    const activity = this.pastActivities().find(a => a.id === activityId);
    if (!activity || !activity.photos) return;

    const allSelected = this.areAllPhotosSelected(activityId);
    if (allSelected) {
      // Désélectionner toutes
      this.selectedPhotosForDeletion.delete(activityId);
    } else {
      // Sélectionner toutes
      const allPhotoIds = new Set(activity.photos.map(p => p.id!));
      this.selectedPhotosForDeletion.set(activityId, allPhotoIds);
    }
  }

  areAllPhotosSelected(activityId: number): boolean {
    const activity = this.pastActivities().find(a => a.id === activityId);
    if (!activity || !activity.photos || activity.photos.length === 0) return false;
    
    const selected = this.selectedPhotosForDeletion.get(activityId);
    if (!selected || selected.size === 0) return false;
    
    return selected.size === activity.photos.length;
  }

  deleteSelectedPhotos(activityId: number) {
    const selected = this.selectedPhotosForDeletion.get(activityId);
    if (!selected || selected.size === 0) {
      this.toastService.warning('Aucune photo sélectionnée');
      return;
    }

    const count = selected.size;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${count} photo(s) ? Cette action est irréversible.`)) {
      return;
    }

    this.isDeletingPhotos.set(true);
    const photoIds = Array.from(selected);
    let completed = 0;
    let errors = 0;

    photoIds.forEach(photoId => {
      this.apiService.deleteActivityPhoto(photoId).subscribe({
        next: () => {
          completed++;
          if (completed + errors === photoIds.length) {
            this.isDeletingPhotos.set(false);
            if (errors === 0) {
              this.toastService.success(`${completed} photo(s) supprimée(s) avec succès`);
            } else {
              this.toastService.warning(`${completed} photo(s) supprimée(s), ${errors} erreur(s)`);
            }
            this.selectedPhotosForDeletion.delete(activityId);
            this.loadPastActivities();
          }
        },
        error: (err) => {
          errors++;
          console.error('Erreur lors de la suppression de la photo:', err);
          if (completed + errors === photoIds.length) {
            this.isDeletingPhotos.set(false);
            if (completed > 0) {
              this.toastService.warning(`${completed} photo(s) supprimée(s), ${errors} erreur(s)`);
            } else {
              this.toastService.error('Erreur lors de la suppression des photos');
            }
            this.loadPastActivities();
          }
        }
      });
    });
  }

  deleteActivityPhoto(photoId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est irréversible.')) {
      return;
    }

    this.apiService.deleteActivityPhoto(photoId).subscribe({
      next: () => {
        this.toastService.success('Photo supprimée avec succès');
        // Retirer de la sélection si elle était sélectionnée
        this.selectedPhotosForDeletion.forEach((selected, activityId) => {
          if (selected.has(photoId)) {
            selected.delete(photoId);
            if (selected.size === 0) {
              this.selectedPhotosForDeletion.delete(activityId);
            } else {
              this.selectedPhotosForDeletion.set(activityId, new Set(selected));
            }
          }
        });
        this.loadPastActivities();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la photo:', err);
        this.toastService.error('Erreur lors de la suppression de la photo');
      }
    });
  }

  createAdmin() {
    if (!this.newAdminUsername || !this.newAdminPassword) {
      this.toastService.error('Veuillez remplir tous les champs');
      return;
    }

    this.apiService.createAdmin({
      username: this.newAdminUsername,
      password: this.newAdminPassword
    }).subscribe({
      next: () => {
        this.toastService.success('Compte admin créé avec succès');
        this.newAdminUsername = '';
        this.newAdminPassword = '';
        this.loadAdmins();
      },
      error: (err) => {
        console.error('Erreur lors de la création du compte admin:', err);
        if (err.status === 400 || err.error?.message?.includes('already exists')) {
          this.toastService.error('Ce nom d\'utilisateur existe déjà');
        } else {
          this.toastService.error('Erreur lors de la création du compte admin');
        }
      }
    });
  }

  toggleAdminStatus(adminId: number) {
    this.apiService.toggleAdminStatus(adminId).subscribe({
      next: () => {
        this.toastService.success('Statut du compte admin modifié avec succès');
        this.loadAdmins();
      },
      error: (err) => {
        console.error('Erreur lors de la modification du statut:', err);
        this.toastService.error('Erreur lors de la modification du statut');
      }
    });
  }

  openChangePasswordModal(adminId: number) {
    this.adminIdToChangePassword = adminId;
    this.newPassword = '';
    this.showChangePasswordModal.set(true);
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal.set(false);
    this.adminIdToChangePassword = null;
    this.newPassword = '';
  }

  changeAdminPassword() {
    if (!this.adminIdToChangePassword || !this.newPassword) {
      this.toastService.error('Veuillez entrer un nouveau mot de passe');
      return;
    }

    this.apiService.changeAdminPassword(this.adminIdToChangePassword, this.newPassword).subscribe({
      next: () => {
        this.toastService.success('Mot de passe modifié avec succès');
        this.closeChangePasswordModal();
        this.loadAdmins();
      },
      error: (err) => {
        console.error('Erreur lors du changement de mot de passe:', err);
        this.toastService.error('Erreur lors du changement de mot de passe');
      }
    });
  }

  deleteAdmin(adminId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte admin ?')) {
      this.apiService.deleteAdmin(adminId).subscribe({
        next: () => {
          this.toastService.success('Compte admin supprimé avec succès');
          this.loadAdmins();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du compte admin:', err);
          this.toastService.error('Erreur lors de la suppression du compte admin');
        }
      });
    }
  }

  loadPendingPhotoComments() {
    this.apiService.getPendingPhotoComments().subscribe({
      next: (data) => {
        this.pendingPhotoComments.set(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires de photos:', err);
        this.toastService.error('Erreur lors du chargement des commentaires de photos');
      }
    });
  }

  approvePhotoComment(commentId: number) {
    this.apiService.approvePhotoComment(commentId).subscribe({
      next: () => {
        this.toastService.success('Commentaire approuvé avec succès');
        this.loadPendingPhotoComments();
      },
      error: (err) => {
        console.error('Erreur lors de l\'approbation du commentaire:', err);
        this.toastService.error('Erreur lors de l\'approbation du commentaire');
      }
    });
  }

  rejectPhotoComment(commentId: number) {
    this.apiService.rejectPhotoComment(commentId).subscribe({
      next: () => {
        this.toastService.success('Commentaire rejeté avec succès');
        this.loadPendingPhotoComments();
      },
      error: (err) => {
        console.error('Erreur lors du rejet du commentaire:', err);
        this.toastService.error('Erreur lors du rejet du commentaire');
      }
    });
  }

  deletePhotoComment(commentId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.apiService.deletePhotoComment(commentId).subscribe({
        next: () => {
          this.toastService.success('Commentaire supprimé avec succès');
          this.loadPendingPhotoComments();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du commentaire:', err);
          this.toastService.error('Erreur lors de la suppression du commentaire');
        }
      });
    }
  }

  deleteProposal(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette proposition ?')) {
      this.apiService.deleteProposal(id).subscribe({
        next: () => {
          this.toastService.success('Activité supprimée avec succès');
          this.loadProposals();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.toastService.error('Erreur lors de la suppression de l\'activité');
        }
      });
    }
  }

  toggleReviewApproval(id: number) {
    this.apiService.toggleReviewApproval(id).subscribe({
      next: () => {
        this.toastService.success('Statut de l\'avis modifié avec succès');
        this.loadReviews();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors de la modification du statut');
      }
    });
  }

  deleteReview(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.apiService.deleteReview(id).subscribe({
        next: () => {
          this.toastService.success('Avis supprimé avec succès');
          this.loadReviews();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.toastService.error('Erreur lors de la suppression de l\'avis');
        }
      });
    }
  }

  markAsRead(id: number) {
    this.apiService.markContactAsRead(id).subscribe({
      next: () => {
        this.toastService.success('Message marqué comme lu');
        this.loadContacts();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors du marquage du message');
      }
    });
  }

  deleteContact(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      this.apiService.deleteContact(id).subscribe({
        next: () => {
          this.toastService.success('Contact supprimé avec succès');
          this.loadContacts();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.toastService.error('Erreur lors de la suppression du contact');
        }
      });
    }
  }

  getImageUrl(photoUrl: string | undefined): string {
    if (!photoUrl) return '';
    
    // Correction automatique : supprimer /public_html/aeccb si présent deux fois
    if (photoUrl.includes('/public_html/aeccb')) {
      console.warn('URL incorrecte détectée (contient /public_html/aeccb), correction automatique...', photoUrl);
      photoUrl = photoUrl.replace('/public_html/aeccb', '');
      console.log('URL corrigée:', photoUrl);
    }
    
    // Si c'est une URL complète (http/https), retourner tel quel
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    // Sinon, c'est un fichier uploadé
    return `${this.apiService.getBaseUrl()}/uploads/${photoUrl}`;
  }
  
  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getFilteredReviews(): Review[] {
    const filter = this.reviewFilter();
    if (filter === 'all') {
      return this.reviews();
    } else if (filter === 'pending') {
      return this.reviews().filter(r => !r.isApproved);
    } else {
      return this.reviews().filter(r => r.isApproved);
    }
  }

  getPendingReviewsCount(): number {
    return this.reviews().filter(r => !r.isApproved).length;
  }

  getApprovedReviewsCount(): number {
    return this.reviews().filter(r => r.isApproved).length;
  }

  getUnreadContactsCount(): number {
    return this.contacts().filter(c => !c.isRead).length;
  }

  toggleActivityStatus(id: number) {
    const activity = this.activities().find(a => a.id === id);
    const wasActive = activity?.isActive ?? true;
    
    this.apiService.toggleActivityStatus(id).subscribe({
      next: () => {
        if (wasActive) {
          this.toastService.success('Activité marquée comme passée. Elle n\'est plus visible par les étudiants.');
        } else {
          this.toastService.success('Activité réactivée. Elle est maintenant visible par les étudiants.');
        }
        this.loadActivities();
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors de la modification du statut');
      }
    });
  }

  deleteActivity(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      this.apiService.deleteActivity(id).subscribe({
        next: () => {
          this.toastService.success('Activité supprimée avec succès');
          this.loadActivities();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          this.toastService.error('Erreur lors de la suppression de l\'activité');
        }
      });
    }
  }

  publishActivity(id: number) {
    this.apiService.publishActivity(id).subscribe({
      next: () => {
        this.toastService.success('Activité publiée avec succès ! Elle est maintenant visible pour tous les utilisateurs.');
        this.loadActivities();
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors de la publication de l\'activité');
      }
    });
  }

  unpublishActivity(id: number) {
    this.apiService.unpublishActivity(id).subscribe({
      next: () => {
        this.toastService.success('Activité dépubliée. Elle est maintenant en attente de vote.');
        this.loadActivities();
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors de la dépublication de l\'activité');
      }
    });
  }

  onCreateActivity() {
    if (!this.activityFormData.name || !this.activityFormData.proposalText) return;
    
    this.isCreatingActivity.set(true);
    const formData = new FormData();
    formData.append('title', this.activityFormData.name);
    formData.append('description', this.activityFormData.proposalText);
    if (this.activityFormData.programme) {
      formData.append('programme', this.activityFormData.programme);
    }
    if (this.activityFormData.lieu) {
      formData.append('lieu', this.activityFormData.lieu);
    }
    if (this.activityFormData.dateActivite) {
      formData.append('dateActivite', this.activityFormData.dateActivite);
    }
    if (this.activityFormData.heureActivite) {
      formData.append('heureActivite', this.activityFormData.heureActivite);
    }
    formData.append('isFree', String(this.activityFormData.isFree));
    if (!this.activityFormData.isFree && this.activityFormData.prix) {
      formData.append('prix', String(this.activityFormData.prix));
    }
    formData.append('reservationRequired', String(this.activityFormData.reservationRequired));
    if (this.activityFormData.reservationRequired && this.activityFormData.reservationUrl) {
      formData.append('reservationUrl', this.activityFormData.reservationUrl);
    }
    if (this.activityFormData.photo) {
      formData.append('image', this.activityFormData.photo);
    }
    // Ajouter les photos supplémentaires
    this.activitySelectedPhotos.forEach((photo, index) => {
      formData.append('photos', photo);
    });

    this.apiService.createActivity(formData).subscribe({
      next: () => {
        this.activityFormData = { 
          name: '', 
          proposalText: '', 
          programme: '',
          lieu: '',
          dateActivite: '',
          heureActivite: '',
          isFree: true,
          prix: 0,
          reservationRequired: false,
          reservationUrl: '',
          photo: null 
        };
        this.activitySelectedFile = null;
        this.activitySelectedPhotos = [];
        this.isCreatingActivity.set(false);
        this.toastService.success('Activité créée avec succès !');
        this.loadActivities();
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.isCreatingActivity.set(false);
        this.toastService.error('Erreur lors de la création de l\'activité');
      }
    });
  }
  
  toggleActivityExpand(activityId: number) {
    const expanded = this.expandedActivities();
    if (expanded.has(activityId)) {
      expanded.delete(activityId);
    } else {
      expanded.add(activityId);
    }
    this.expandedActivities.set(new Set(expanded));
  }
  
  isActivityExpanded(activityId: number): boolean {
    return this.expandedActivities().has(activityId);
  }

  onActivityFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.activitySelectedFile = input.files[0];
      this.activityFormData.photo = input.files[0];
    }
  }

  onActivityPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.activitySelectedPhotos.push(...files);
    }
  }

  removeActivityPhoto(index: number) {
    this.activitySelectedPhotos.splice(index, 1);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  toggleProposalStatus(id: number) {
    this.apiService.toggleProposalStatus(id).subscribe({
      next: () => {
        const proposal = this.proposals().find(p => p.id === id);
        const status = proposal?.isActive ? 'désactivée' : 'activée';
        this.toastService.success(`Proposition ${status} avec succès`);
        this.loadProposals();
      },
      error: (err) => {
        console.error('Erreur:', err);
        if (err.status === 404) {
          this.toastService.error('Proposition introuvable. Elle a peut-être été supprimée.');
        } else if (err.status === 0) {
          this.toastService.error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
        } else {
          this.toastService.error('Erreur lors de la modification du statut de la proposition');
        }
        // Recharger les propositions pour mettre à jour la liste
        this.loadProposals();
      }
    });
  }

  updateChart() {
    if (!this.chartCanvas?.nativeElement) return;
    
    const proposals = this.proposals();
    if (proposals.length === 0) return;
    
    const sortedProposals = [...proposals]
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 10); // Top 10
    
    const labels = sortedProposals.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name);
    const data = sortedProposals.map(p => p.voteCount);
    
    ChartService.destroyChart(this.chart);
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de votes',
          data: data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };
    
    this.chart = ChartService.createChart(this.chartCanvas.nativeElement, config);
  }
}

