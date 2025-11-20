import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Activity } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LinkifyPipe } from '../../pipes/linkify.pipe';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, LinkifyPipe, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 text-center">
        <div class="flex items-center justify-center gap-4 mb-4">
          <h1 class="text-4xl font-bold text-ccnb-blue">Activités de l'Association</h1>
          <button
            (click)="refreshActivities()"
            [disabled]="isRefreshing()"
            class="bg-ccnb-blue text-white rounded-full p-3 hover:bg-ccnb-red transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-110"
            title="Rafraîchir les activités"
          >
            <i class="material-icons align-middle" [class.animate-refresh-spin]="isRefreshing()">refresh</i>
          </button>
        </div>
        <p class="text-gray-600 text-lg mb-6">Découvrez les activités organisées par l'association étudiante du CCNB</p>
        
        <!-- Barre de recherche -->
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8 animate-fade-in">
          <div class="flex items-center gap-2 mb-4">
            <i class="material-icons text-ccnb-blue text-2xl">search</i>
            <h3 class="text-lg font-semibold text-gray-800">Rechercher une activité</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4 flex items-center gap-2">
            <i class="material-icons text-sm text-ccnb-blue">info</i>
            Recherchez dans toutes les activités : confirmées, proposées et passées
          </p>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="material-icons text-sm align-middle">title</i>
                Recherche par titre
              </label>
              <input
                type="text"
                [(ngModel)]="searchTitle"
                (ngModelChange)="onSearchChange()"
                placeholder="Entrez le titre de l'activité..."
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="material-icons text-sm align-middle">calendar_today</i>
                Recherche par date
              </label>
              <input
                type="date"
                [(ngModel)]="searchDate"
                (ngModelChange)="onSearchChange()"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ccnb-blue focus:border-transparent transition-all"
              />
            </div>
          </div>
          @if (searchTitle() || searchDate()) {
            <button
              (click)="clearSearch()"
              class="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-2"
            >
              <i class="material-icons text-sm">clear</i>
              Effacer la recherche
            </button>
          }
        </div>
      </div>

      <!-- Section Activités Publiées (Confirmées) -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6 animate-fade-in">
          <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-blue to-ccnb-red animate-pulse-slow"></div>
          <h2 class="text-2xl font-bold text-ccnb-blue flex items-center gap-2">
            <i class="material-icons text-3xl animate-bounce-slow">check_circle</i>
            Activités Confirmées ({{ filteredPublishedActivities().length }})
          </h2>
          <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-red to-ccnb-blue animate-pulse-slow"></div>
        </div>
        <p class="text-gray-600 mb-6 text-center animate-fade-in">Ces activités sont confirmées et auront lieu</p>
        
        <!-- Skeleton Loader -->
        @if (isLoadingPublished()) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (skeleton of [1,2,3,4,5,6]; track skeleton) {
              <div class="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 animate-pulse">
                <div class="h-48 bg-gray-300"></div>
                <div class="p-6 space-y-4">
                  <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div class="h-4 bg-gray-300 rounded"></div>
                  <div class="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div class="h-10 bg-gray-300 rounded mt-4"></div>
                </div>
              </div>
            }
          </div>
        }
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (activity of filteredPublishedActivities(); track activity.id; let i = $index) {
            <a [routerLink]="['/activities', activity.id]" 
               class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] block cursor-pointer border-2 border-green-200 relative animate-slide-up-fade flex flex-col"
               [style.animation-delay]="i * 0.15 + 's'"
               [style.animation-fill-mode]="'both'">
              
              <!-- Image -->
              @if (activity.imageUrl) {
                <div class="relative h-48 overflow-hidden bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark group/image">
                  <img
                    [src]="getImageUrl(activity.imageUrl)"
                    [alt]="activity.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                    (error)="handleImageError($event)"
                    loading="lazy"
                  />
                  <!-- Overlay au survol -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                  
                  <!-- Badge "Confirmée" en haut à gauche -->
                  <div class="absolute top-3 left-3 z-10">
                    <span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-fade-in">
                      <i class="material-icons text-sm">check_circle</i>
                      Confirmée
                    </span>
                  </div>
                  
                  <!-- Bouton like en haut à droite -->
                  <div class="absolute top-3 right-3 z-10">
                    <button
                      (click)="toggleLike(activity.id); $event.stopPropagation(); $event.preventDefault()"
                      [class.text-red-500]="activity.hasLiked"
                      [class.text-white]="!activity.hasLiked"
                      [class.animate-pulse-slow]="activity.hasLiked"
                      class="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-all duration-200 shadow-lg hover:scale-110 hover:shadow-xl transform"
                      title="Liker cette activité"
                    >
                      <i class="material-icons align-middle text-lg transition-transform duration-200 hover:scale-125">{{ activity.hasLiked ? 'favorite' : 'favorite_border' }}</i>
                    </button>
                  </div>
                </div>
              } @else {
                <div class="h-48 bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark flex items-center justify-center relative">
                  <i class="material-icons text-6xl text-white/50 transition-transform duration-300 hover:scale-110">event</i>
                  <!-- Bouton like même sans image -->
                  <div class="absolute top-3 right-3 z-10">
                    <button
                      (click)="toggleLike(activity.id); $event.stopPropagation(); $event.preventDefault()"
                      [class.text-red-500]="activity.hasLiked"
                      [class.text-white]="!activity.hasLiked"
                      class="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-all duration-200 shadow-lg hover:scale-110 hover:shadow-xl"
                      title="Liker cette activité"
                    >
                      <i class="material-icons align-middle text-lg transition-transform duration-200 hover:scale-125">{{ activity.hasLiked ? 'favorite' : 'favorite_border' }}</i>
                    </button>
                  </div>
                </div>
              }

              <!-- Contenu -->
              <div class="p-6 flex-1 flex flex-col">
                <h3 class="text-xl font-bold text-gray-800 mb-2 transition-all duration-200 hover:text-ccnb-blue">{{ activity.title }}</h3>
                <p class="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <i class="material-icons text-xs">access_time</i>
                  {{ activity.createdAt | date:'short' }}
                </p>
                <div class="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-3 flex-1" [innerHTML]="activity.description | linkify"></div>
                
                <!-- Like Button, Commentaires et Avis -->
                <div class="flex items-center justify-between pt-4 border-t gap-4">
                  <button
                    (click)="toggleLike(activity.id); $event.stopPropagation(); $event.preventDefault()"
                    [class.text-red-500]="activity.hasLiked"
                    [class.text-gray-400]="!activity.hasLiked"
                    class="flex items-center gap-2 hover:scale-110 transition-all duration-200"
                  >
                    <i class="material-icons align-middle text-3xl transition-transform duration-200 hover:scale-125 animate-pulse-slow" [class.text-red-500]="activity.hasLiked" [class.text-gray-400]="!activity.hasLiked">
                      {{ activity.hasLiked ? 'favorite' : 'favorite_border' }}
                    </i>
                    <span class="font-semibold text-xl">{{ activity.likeCount }}</span>
                    <span class="text-gray-600">like(s)</span>
                  </button>
                  <div class="flex items-center gap-2 text-ccnb-blue">
                    <i class="material-icons align-middle text-2xl transition-transform duration-200 hover:scale-125">comment</i>
                    <span class="font-semibold text-lg">{{ activity.commentCount || 0 }}</span>
                    <span class="text-sm text-gray-600">commentaire(s)</span>
                  </div>
                  <div class="flex items-center gap-2 text-ccnb-blue">
                    <i class="material-icons align-middle text-2xl transition-transform duration-200 hover:scale-125">rate_review</i>
                    <span class="font-semibold text-lg">{{ activity.reviewCount || 0 }}</span>
                    <span class="text-sm text-gray-600">avis</span>
                  </div>
                </div>
              </div>
              
              <!-- Badge de statut en bas - toujours visible -->
              <div class="px-6 pb-4 pt-2 border-t bg-gray-50 flex justify-center">
                <span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <i class="material-icons text-base">check_circle</i>
                  Confirmée
                </span>
              </div>
            </a>
          } @empty {
            <div class="col-span-full text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg animate-fade-in border-2 border-dashed border-green-300">
              <i class="material-icons text-6xl text-gray-300 mb-4 animate-bounce-slow">event_available</i>
              <p class="text-gray-500 text-lg font-semibold">Aucune activité confirmée pour le moment</p>
              <p class="text-gray-400 text-sm mt-2">Les activités confirmées apparaîtront ici</p>
            </div>
          }
        </div>
      </div>

      <!-- Section Activités Proposées (En attente de vote) -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6 animate-fade-in">
          <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-blue to-ccnb-red animate-pulse-slow"></div>
          <h2 class="text-2xl font-bold text-ccnb-blue flex items-center gap-2">
            <i class="material-icons text-3xl animate-bounce-slow">pending</i>
            Activités Proposées ({{ filteredProposedActivities().length }})
          </h2>
          <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-red to-ccnb-blue animate-pulse-slow"></div>
        </div>
        <p class="text-gray-600 mb-6 text-center animate-fade-in">Votez pour ces activités pour qu'elles soient organisées</p>
        
        <!-- Skeleton Loader -->
        @if (isLoadingProposed()) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (skeleton of [1,2,3,4,5,6]; track skeleton) {
              <div class="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 animate-pulse">
                <div class="h-48 bg-gray-300"></div>
                <div class="p-6 space-y-4">
                  <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div class="h-4 bg-gray-300 rounded"></div>
                  <div class="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div class="h-10 bg-gray-300 rounded mt-4"></div>
                </div>
              </div>
            }
          </div>
        }
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (activity of filteredProposedActivities(); track activity.id; let i = $index) {
            <a [routerLink]="['/activities', activity.id]" 
               class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] block cursor-pointer border-2 border-yellow-200 relative animate-slide-up-fade flex flex-col"
               [style.animation-delay]="i * 0.15 + 's'"
               [style.animation-fill-mode]="'both'">
              
              <!-- Image -->
              @if (activity.imageUrl) {
                <div class="relative h-48 overflow-hidden bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark group/image">
                  <img
                    [src]="getImageUrl(activity.imageUrl)"
                    [alt]="activity.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                    (error)="handleImageError($event)"
                    loading="lazy"
                  />
                  <!-- Overlay au survol -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                  
                  <!-- Badge "En vote" en haut à gauche -->
                  <div class="absolute top-3 left-3 z-10">
                    <span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse-slow">
                      <i class="material-icons text-sm animate-spin-slow">pending</i>
                      En vote
                    </span>
                  </div>
                  
                  <!-- Bouton vote en haut à droite -->
                  <div class="absolute top-3 right-3 z-10">
                    <button
                      (click)="toggleLike(activity.id); $event.stopPropagation(); $event.preventDefault()"
                      [class.text-red-500]="activity.hasLiked"
                      [class.text-white]="!activity.hasLiked"
                      [class.animate-pulse-slow]="activity.hasLiked"
                      class="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-all duration-200 shadow-lg hover:scale-110 hover:shadow-xl transform"
                      title="Voter pour cette activité"
                    >
                      <i class="material-icons align-middle text-lg transition-transform duration-200 hover:scale-125">{{ activity.hasLiked ? 'favorite' : 'favorite_border' }}</i>
                    </button>
                  </div>
                </div>
              } @else {
                <div class="h-48 bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark flex items-center justify-center relative">
                  <i class="material-icons text-6xl text-white/50 transition-transform duration-300 hover:scale-110">event</i>
                  <!-- Bouton vote même sans image -->
                  <div class="absolute top-3 right-3 z-10">
                    <button
                      (click)="toggleLike(activity.id); $event.stopPropagation(); $event.preventDefault()"
                      [class.text-red-500]="activity.hasLiked"
                      [class.text-white]="!activity.hasLiked"
                      class="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-all duration-200 shadow-lg hover:scale-110 hover:shadow-xl"
                      title="Voter pour cette activité"
                    >
                      <i class="material-icons align-middle text-lg transition-transform duration-200 hover:scale-125">{{ activity.hasLiked ? 'favorite' : 'favorite_border' }}</i>
                    </button>
                  </div>
                </div>
              }

              <!-- Contenu -->
              <div class="p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-yellow-50">
                <h3 class="text-xl font-bold text-gray-800 mb-2 transition-all duration-200 hover:text-ccnb-blue group-hover:scale-105 transform inline-block">{{ activity.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed" [innerHTML]="activity.description | linkify"></p>
                
                <!-- Informations supplémentaires -->
                @if (activity.dateActivite || activity.lieu || activity.isFree !== undefined) {
                  <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4 pb-3 border-b border-gray-200">
                    @if (activity.dateActivite) {
                      <span class="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
                        <i class="material-icons text-sm text-ccnb-blue">calendar_today</i>
                        <span class="font-medium">{{ activity.dateActivite | date:'short' }}</span>
                      </span>
                    }
                    @if (activity.lieu) {
                      <span class="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg">
                        <i class="material-icons text-sm text-orange-600">location_on</i>
                        <span class="font-medium">{{ activity.lieu }}</span>
                      </span>
                    }
                    @if (activity.isFree !== undefined) {
                      <span class="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                            [class.bg-green-50]="activity.isFree"
                            [class.bg-red-50]="!activity.isFree">
                        <i class="material-icons text-sm" [class.text-green-600]="activity.isFree" [class.text-red-600]="!activity.isFree">
                          {{ activity.isFree ? 'check_circle' : 'attach_money' }}
                        </i>
                        <span class="font-medium" [class.text-green-600]="activity.isFree" [class.text-red-600]="!activity.isFree">
                          {{ activity.isFree ? 'Gratuit' : (activity.prix ? activity.prix + '$' : 'Payant') }}
                        </span>
                      </span>
                    }
                  </div>
                }
                
                <!-- Statistiques en bas -->
                <div class="flex items-center justify-between pt-3">
                  <div class="flex items-center gap-4">
                    <button
                      (click)="toggleLike(activity.id); $event.stopPropagation(); $event.preventDefault()"
                      [class.text-red-500]="activity.hasLiked"
                      [class.text-gray-400]="!activity.hasLiked"
                      class="flex items-center gap-1.5 font-semibold bg-yellow-50 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-yellow-100 hover:scale-105 transform"
                    >
                      <i class="material-icons text-lg transition-transform duration-200 hover:scale-125" [class.animate-pulse-slow]="activity.hasLiked">
                        {{ activity.hasLiked ? 'favorite' : 'favorite_border' }}
                      </i>
                      <span class="text-ccnb-blue">{{ activity.likeCount }} {{ activity.likeCount === 1 ? 'vote' : 'votes' }}</span>
                    </button>
                    @if (activity.commentCount && activity.commentCount > 0) {
                      <span class="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <i class="material-icons text-lg">comment</i>
                        <span>{{ activity.commentCount }}</span>
                      </span>
                    }
                    @if (activity.reviewCount && activity.reviewCount > 0) {
                      <span class="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <i class="material-icons text-lg">rate_review</i>
                        <span>{{ activity.reviewCount }}</span>
                      </span>
                    }
                  </div>
                </div>
                
                <!-- Badge "En vote" toujours visible en bas -->
                <div class="mt-3 pt-3 border-t border-gray-200 flex justify-center">
                  <span class="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse-slow">
                    <i class="material-icons text-sm animate-spin-slow">pending</i>
                    Activité En Vote
                  </span>
                </div>
              </div>
            </a>
          } @empty {
            <div class="col-span-full text-center py-12 bg-gradient-to-br from-gray-50 to-yellow-50 rounded-lg animate-fade-in border-2 border-dashed border-yellow-300">
              <i class="material-icons text-6xl text-gray-300 mb-4 animate-bounce-slow">pending_actions</i>
              <p class="text-gray-500 text-lg font-semibold">Aucune activité proposée pour le moment</p>
              <p class="text-gray-400 text-sm mt-2">Proposez une activité via le formulaire de propositions !</p>
            </div>
          }
        </div>
      </div>

      <!-- Section Activités Passées -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6 animate-fade-in">
          <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-blue to-ccnb-red animate-pulse-slow"></div>
          <h2 class="text-2xl font-bold text-ccnb-blue flex items-center gap-2">
            <i class="material-icons text-3xl animate-bounce-slow">history</i>
            Activités Passées ({{ filteredPastActivities().length }})
          </h2>
          <div class="h-1 flex-1 bg-gradient-to-r from-ccnb-red to-ccnb-blue animate-pulse-slow"></div>
        </div>
        <p class="text-gray-600 mb-6 text-center animate-fade-in">Consultez les photos des activités passées et commentez-les</p>
        
        <!-- Skeleton Loader -->
        @if (isLoadingPast()) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (skeleton of [1,2,3,4,5,6]; track skeleton) {
              <div class="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 animate-pulse">
                <div class="h-48 bg-gray-300"></div>
                <div class="p-6 space-y-4">
                  <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div class="h-4 bg-gray-300 rounded"></div>
                  <div class="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div class="h-10 bg-gray-300 rounded mt-4"></div>
                </div>
              </div>
            }
          </div>
        }
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (activity of filteredPastActivities(); track activity.id; let i = $index) {
            <a [routerLink]="['/activities', activity.id]" 
               class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] block cursor-pointer border-2 border-gray-300 relative animate-slide-up-fade flex flex-col"
               [style.animation-delay]="i * 0.15 + 's'"
               [style.animation-fill-mode]="'both'">
              
              <!-- Image -->
              @if (activity.imageUrl) {
                <div class="relative h-48 overflow-hidden bg-gradient-to-br from-gray-400 to-gray-600">
                  <img
                    [src]="getImageUrl(activity.imageUrl)"
                    [alt]="activity.title"
                    class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    (error)="handleImageError($event)"
                  />
                </div>
              } @else {
                <div class="h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <i class="material-icons text-6xl text-white/50 transition-transform duration-300 hover:scale-110">event</i>
                </div>
              }

              <!-- Contenu -->
              <div class="p-6 flex-1 flex flex-col">
                <h3 class="text-xl font-bold text-gray-800 mb-2 transition-all duration-200 hover:text-ccnb-blue">{{ activity.title }}</h3>
                <p class="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <i class="material-icons text-xs">access_time</i>
                  {{ activity.createdAt | date:'short' }}
                </p>
                <div class="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-3 flex-1" [innerHTML]="activity.description | linkify"></div>
                
                <!-- Informations sur les photos -->
                @if (activity.photos && activity.photos.length > 0) {
                  <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-center gap-2 text-ccnb-blue">
                      <i class="material-icons text-lg">photo_library</i>
                      <span class="font-semibold text-sm">{{ activity.photos.length }} photo(s) disponible(s)</span>
                    </div>
                  </div>
                }
                
                <!-- Commentaires et Avis -->
                <div class="flex items-center justify-between pt-4 border-t gap-4">
                  <div class="flex items-center gap-2 text-ccnb-blue">
                    <i class="material-icons align-middle text-2xl transition-transform duration-200 hover:scale-125">comment</i>
                    <span class="font-semibold text-lg">{{ activity.commentCount || 0 }}</span>
                    <span class="text-sm text-gray-600">commentaire(s)</span>
                  </div>
                  <div class="flex items-center gap-2 text-ccnb-blue">
                    <i class="material-icons align-middle text-2xl transition-transform duration-200 hover:scale-125">rate_review</i>
                    <span class="font-semibold text-lg">{{ activity.reviewCount || 0 }}</span>
                    <span class="text-sm text-gray-600">avis</span>
                  </div>
                </div>
              </div>
              
              <!-- Badge de statut en bas - toujours visible -->
              <div class="px-6 pb-4 pt-2 border-t bg-gray-50 flex justify-center">
                <span class="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <i class="material-icons text-base">history</i>
                  Activité Passée
                </span>
              </div>
            </a>
          } @empty {
            <div class="col-span-full text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-fade-in border-2 border-dashed border-gray-300">
              <i class="material-icons text-6xl text-gray-300 mb-4 animate-bounce-slow">history</i>
              <p class="text-gray-500 text-lg font-semibold">Aucune activité passée pour le moment</p>
              <p class="text-gray-400 text-sm mt-2">Les activités passées apparaîtront ici une fois qu'elles auront été marquées comme passées par l'admin</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ActivitiesComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  publishedActivities = signal<Activity[]>([]);
  proposedActivities = signal<Activity[]>([]);
  pastActivities = signal<Activity[]>([]);
  isLoadingPublished = signal<boolean>(true);
  isLoadingProposed = signal<boolean>(true);
  isLoadingPast = signal<boolean>(true);
  isRefreshing = signal<boolean>(false);
  
  // Recherche
  searchTitle = signal<string>('');
  searchDate = signal<string>('');
  
  // Activités filtrées
  filteredPublishedActivities = computed(() => {
    return this.filterActivities(this.publishedActivities(), this.searchTitle(), this.searchDate());
  });
  
  filteredProposedActivities = computed(() => {
    return this.filterActivities(this.proposedActivities(), this.searchTitle(), this.searchDate());
  });
  
  filteredPastActivities = computed(() => {
    return this.filterActivities(this.pastActivities(), this.searchTitle(), this.searchDate());
  });

  constructor() {
    this.loadActivities();
  }

  loadActivities() {
    // Charger les activités publiées (confirmées) progressivement
    this.apiService.getPublishedActivities().subscribe({
      next: (data) => {
        this.isLoadingPublished.set(false);
        this.loadActivitiesProgressively(data, this.publishedActivities, 100);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des activités publiées:', err);
        this.toastService.error('Erreur lors du chargement des activités publiées');
        this.isLoadingPublished.set(false);
      }
    });

    // Charger les activités proposées (en attente de vote) progressivement
    this.apiService.getProposedActivities().subscribe({
      next: (data) => {
        this.isLoadingProposed.set(false);
        this.loadActivitiesProgressively(data, this.proposedActivities, 100);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des activités proposées:', err);
        this.toastService.error('Erreur lors du chargement des activités proposées');
        this.isLoadingProposed.set(false);
      }
    });

    // Charger les activités passées progressivement
    this.apiService.getPastActivities().subscribe({
      next: (data) => {
        this.isLoadingPast.set(false);
        this.loadActivitiesProgressively(data, this.pastActivities, 100);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des activités passées:', err);
        this.toastService.error('Erreur lors du chargement des activités passées');
        this.isLoadingPast.set(false);
      }
    });
  }

  private loadActivitiesProgressively(
    activities: Activity[],
    targetSignal: typeof this.publishedActivities | typeof this.proposedActivities | typeof this.pastActivities,
    delayMs: number
  ) {
    targetSignal.set([]);
    activities.forEach((activity, index) => {
      setTimeout(() => {
        targetSignal.update(current => [...current, activity]);
      }, index * delayMs);
    });
  }

  refreshActivities() {
    this.isRefreshing.set(true);
    
    // Animation de shake pour les cartes existantes
    const cards = document.querySelectorAll('.animate-slide-up-fade');
    cards.forEach(card => {
      card.classList.add('animate-shake');
      setTimeout(() => {
        card.classList.remove('animate-shake');
      }, 500);
    });

    // Recharger les activités avec animation
    this.isLoadingPublished.set(true);
    this.isLoadingProposed.set(true);
    this.isLoadingPast.set(true);

    // Charger les activités publiées (confirmées) progressivement
    this.apiService.getPublishedActivities().subscribe({
      next: (data) => {
        this.isLoadingPublished.set(false);
        this.loadActivitiesProgressively(data, this.publishedActivities, 100);
        this.isRefreshing.set(false);
        this.toastService.success('Activités rafraîchies avec succès');
      },
      error: (err) => {
        console.error('Erreur lors du rafraîchissement des activités publiées:', err);
        this.toastService.error('Erreur lors du rafraîchissement des activités publiées');
        this.isLoadingPublished.set(false);
        this.isRefreshing.set(false);
      }
    });

    // Charger les activités proposées (en attente de vote) progressivement
    this.apiService.getProposedActivities().subscribe({
      next: (data) => {
        this.isLoadingProposed.set(false);
        this.loadActivitiesProgressively(data, this.proposedActivities, 100);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du rafraîchissement des activités proposées:', err);
        this.toastService.error('Erreur lors du rafraîchissement des activités proposées');
        this.isLoadingProposed.set(false);
        this.isRefreshing.set(false);
      }
    });

    // Charger les activités passées progressivement
    this.apiService.getPastActivities().subscribe({
      next: (data) => {
        this.isLoadingPast.set(false);
        this.loadActivitiesProgressively(data, this.pastActivities, 100);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du rafraîchissement des activités passées:', err);
        this.toastService.error('Erreur lors du rafraîchissement des activités passées');
        this.isLoadingPast.set(false);
        this.isRefreshing.set(false);
      }
    });
  }

  toggleLike(activityId: number) {
    this.apiService.toggleActivityLike(activityId).subscribe({
      next: (updatedActivity) => {
        // Mettre à jour dans la bonne liste selon le statut
        if (updatedActivity.isPublished) {
          this.publishedActivities.update(activities =>
            activities.map(a => a.id === activityId ? updatedActivity : a)
          );
        } else {
          this.proposedActivities.update(activities =>
            activities.map(a => a.id === activityId ? updatedActivity : a)
          );
        }
      },
      error: (err) => {
        console.error('Erreur lors du like:', err);
        this.toastService.error('Erreur lors du like');
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) {
      console.warn('getImageUrl: imageUrl is undefined or empty');
      return '';
    }
    
    // Correction automatique : supprimer /public_html/aeccb si présent deux fois
    if (imageUrl.includes('/public_html/aeccb')) {
      console.warn('URL incorrecte détectée (contient /public_html/aeccb), correction automatique...', imageUrl);
      imageUrl = imageUrl.replace('/public_html/aeccb', '');
      console.log('URL corrigée:', imageUrl);
    }
    
    // Si c'est une URL complète (http/https), retourner tel quel
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('getImageUrl: URL complète détectée:', imageUrl);
      return imageUrl;
    }
    
    // Sinon, c'est un fichier uploadé localement
    const localUrl = `${this.apiService.getBaseUrl()}/uploads/${imageUrl}`;
    console.log('getImageUrl: URL locale construite:', localUrl);
    return localUrl;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    console.error('Erreur de chargement d\'image:', img.src);
    console.error('URL complète:', img.src);
    img.style.display = 'none';
    
    // Afficher un toast pour informer l'utilisateur
    this.toastService.error(`Impossible de charger l'image: ${img.src}`);
  }
  
  // Méthodes de recherche
  filterActivities(activities: Activity[], title: string, date: string): Activity[] {
    let filtered = activities;
    
    // Filtrer par titre
    if (title && title.trim() !== '') {
      const searchTerm = title.toLowerCase().trim();
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrer par date
    if (date && date.trim() !== '') {
      filtered = filtered.filter(activity => {
        if (!activity.dateActivite) return false;
        const activityDate = new Date(activity.dateActivite).toISOString().split('T')[0];
        return activityDate === date;
      });
    }
    
    return filtered;
  }
  
  onSearchChange() {
    // La recherche se fait automatiquement via les computed signals
    // Cette méthode peut être utilisée pour des actions supplémentaires si nécessaire
  }
  
  clearSearch() {
    this.searchTitle.set('');
    this.searchDate.set('');
  }
}

