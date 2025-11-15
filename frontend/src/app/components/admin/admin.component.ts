import { Component, signal, inject, ViewChild, ElementRef, AfterViewInit, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Proposal, Review, Contact } from '../../services/api.service';
import { LinkifyPipe } from '../../pipes/linkify.pipe';
import { ToastService } from '../../services/toast.service';

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
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex space-x-8">
          <button 
            (click)="activeTab.set('proposals')"
            [class.border-b-2]="activeTab() === 'proposals'"
            [class.border-ccnb-blue]="activeTab() === 'proposals'"
            [class.text-ccnb-blue]="activeTab() === 'proposals'"
            class="py-4 px-1 border-b-2 border-transparent font-medium text-sm"
          >
            Propositions ({{ proposals().length }})
          </button>
          <button 
            (click)="activeTab.set('reviews')"
            [class.border-b-2]="activeTab() === 'reviews'"
            [class.border-ccnb-blue]="activeTab() === 'reviews'"
            [class.text-ccnb-blue]="activeTab() === 'reviews'"
            class="py-4 px-1 border-b-2 border-transparent font-medium text-sm"
          >
            Avis ({{ reviews().length }})
          </button>
          <button 
            (click)="activeTab.set('contacts')"
            [class.border-b-2]="activeTab() === 'contacts'"
            [class.border-ccnb-blue]="activeTab() === 'contacts'"
            [class.text-ccnb-blue]="activeTab() === 'contacts'"
            class="py-4 px-1 border-b-2 border-transparent font-medium text-sm"
          >
            Contacts ({{ contacts().length }})
          </button>
        </nav>
      </div>

      <!-- Proposals Tab -->
      @if (activeTab() === 'proposals') {
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
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Photo (optionnelle)</label>
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

          <!-- Recherche et Graphique -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Recherche -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <i class="material-icons text-ccnb-blue">search</i>
                Rechercher des activités
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

          <!-- Liste des activités -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <i class="material-icons text-ccnb-blue">list</i>
              Liste des activités ({{ filteredProposals().length }})
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
                      class="px-4 py-2 text-white rounded-lg hover:opacity-80 transition flex items-center gap-2"
                      [title]="proposal.isActive ? 'Désactiver' : 'Activer'"
                    >
                      @if (proposal.isActive) {
                        <i class="material-icons text-lg">toggle_on</i>
                        <span class="text-sm">Désactiver</span>
                      } @else {
                        <i class="material-icons text-lg">toggle_off</i>
                        <span class="text-sm">Activer</span>
                      }
                    </button>
                    <button 
                      (click)="deleteProposal(proposal.id)"
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
                <i class="material-icons text-6xl text-gray-300 mb-4">event</i>
                <p class="text-gray-500 text-lg">Aucune activité</p>
              </div>
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
            <div class="bg-white rounded-lg shadow-lg p-6" [class.border-l-4]="!review.isApproved" [class.border-yellow-500]="!review.isApproved">
              <div class="flex gap-6">
                @if (review.photoUrl) {
                  <div class="flex-shrink-0">
                    <img 
                      [src]="getImageUrl(review.photoUrl)" 
                      alt="Photo"
                      class="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                }
                <div class="flex-1">
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
      </div>
    }
  `
})
export class AdminComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any = null;
  
  isAuthenticated = signal(false);
  username = '';
  password = '';
  loginError = signal('');
  isLoggingIn = signal(false);
  
  activeTab = signal<'proposals' | 'reviews' | 'contacts'>('proposals');
  proposals = signal<Proposal[]>([]);
  reviews = signal<Review[]>([]);
  contacts = signal<Contact[]>([]);
  reviewFilter = signal<'all' | 'pending' | 'approved'>('all');
  
  activityFormData = {
    name: '',
    proposalText: '',
    photo: null as File | null
  };
  activitySelectedFile: File | null = null;
  isCreatingActivity = signal(false);
  searchTerm = signal('');
  
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

  private ChartLib: any = null;

  constructor() {
    // Check if already authenticated (from localStorage)
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      this.isAuthenticated.set(true);
      this.loadData();
    }
  }

  async ngOnInit() {
    // Charger Chart.js de manière dynamique pour éviter les problèmes de cache Vite
    try {
      const chartModule = await import('chart.js');
      if (chartModule.Chart && chartModule.registerables) {
        this.ChartLib = chartModule.Chart;
        chartModule.Chart.register(...chartModule.registerables);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de Chart.js:', error);
      this.toastService.error('Erreur lors du chargement de la bibliothèque de graphiques');
    }
  }

  ngAfterViewInit() {
    // Chart will be initialized when data is loaded and Chart.js is ready
    if (this.ChartLib) {
      setTimeout(() => this.updateChart(), 100);
    } else {
      // Retry after Chart.js is loaded
      const checkChart = setInterval(() => {
        if (this.ChartLib) {
          this.updateChart();
          clearInterval(checkChart);
        }
      }, 100);
      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkChart), 5000);
    }
  }

  loadData() {
    this.loadProposals();
    this.loadReviews();
    this.loadContacts();
  }

  onLogin() {
    this.isLoggingIn.set(true);
    this.loginError.set('');
    
    this.apiService.adminLogin({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        if (response.success) {
          this.isAuthenticated.set(true);
          localStorage.setItem('adminAuth', 'true');
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
    this.isAuthenticated.set(false);
    localStorage.removeItem('adminAuth');
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
      next: (data) => this.reviews.set(data),
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
    return `${this.apiService.getBaseUrl()}/uploads/${photoUrl}`;
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

  onCreateActivity() {
    if (!this.activityFormData.name || !this.activityFormData.proposalText) return;
    
    this.isCreatingActivity.set(true);
    const formData = new FormData();
    formData.append('name', this.activityFormData.name);
    formData.append('proposalText', this.activityFormData.proposalText);
    if (this.activityFormData.photo) {
      formData.append('photo', this.activityFormData.photo);
    }

    this.apiService.createProposal(formData).subscribe({
      next: () => {
        this.activityFormData = { name: '', proposalText: '', photo: null };
        this.activitySelectedFile = null;
        this.isCreatingActivity.set(false);
        this.toastService.success('Activité créée avec succès !');
        this.loadProposals();
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.isCreatingActivity.set(false);
        this.toastService.error('Erreur lors de la création de l\'activité');
      }
    });
  }

  onActivityFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.activitySelectedFile = input.files[0];
      this.activityFormData.photo = input.files[0];
    }
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  toggleProposalStatus(id: number) {
    this.apiService.toggleProposalStatus(id).subscribe({
      next: () => {
        const proposal = this.proposals().find(p => p.id === id);
        const status = proposal?.isActive ? 'désactivée' : 'activée';
        this.toastService.success(`Activité ${status} avec succès`);
        this.loadProposals();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors de la modification du statut de l\'activité');
      }
    });
  }

  updateChart() {
    if (!this.chartCanvas?.nativeElement || !this.ChartLib) return;
    
    const proposals = this.proposals();
    if (proposals.length === 0) return;
    
    const sortedProposals = [...proposals]
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 10); // Top 10
    
    const labels = sortedProposals.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name);
    const data = sortedProposals.map(p => p.voteCount);
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    this.chart = new this.ChartLib(this.chartCanvas.nativeElement, {
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
    });
  }
}

