import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Review, Comment } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 text-ccnb-blue">Photos des Activités</h1>
        <p class="text-gray-600">Consultez les photos et avis des participants aux activités de l'association</p>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex items-center gap-3 mb-4">
          <i class="material-icons text-3xl text-ccnb-blue">camera_alt</i>
          <h2 class="text-2xl font-semibold">Partager votre expérience</h2>
        </div>
        <form (ngSubmit)="onSubmit()" #reviewForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input 
              type="text" 
              [(ngModel)]="formData.name" 
              name="name" 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Votre avis</label>
            <textarea 
              [(ngModel)]="formData.reviewText" 
              name="reviewText" 
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
              placeholder="Partagez votre expérience et vos impressions après avoir participé à une activité de l'association..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Photo (optionnelle)</label>
            <input 
              type="file" 
              (change)="onFileSelected($event)" 
              accept="image/jpeg,image/png"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
            />
            @if (selectedFile) {
              <div class="mt-2 flex items-center gap-2">
                <i class="material-icons text-gray-500 text-xl align-middle">image</i>
                <span class="text-sm text-gray-600">{{ selectedFile.name }}</span>
                <button type="button" (click)="selectedFile = null" class="ml-2 text-red-500 hover:text-red-700">
                  <i class="material-icons text-lg align-middle">close</i>
                </button>
              </div>
            }
          </div>
          <button 
            type="submit" 
            [disabled]="!reviewForm.valid || isSubmitting()"
            class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            @if (isSubmitting()) {
              <i class="material-icons text-lg animate-spin">refresh</i>
              <span>Envoi...</span>
            } @else {
              <i class="material-icons text-lg">send</i>
              <span>Publier</span>
            }
          </button>
        </form>
        
      </div>

      <!-- Galerie d'avis -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (review of reviews(); track review.id) {
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            @if (review.photoUrl) {
              <img 
                [src]="getImageUrl(review.photoUrl)" 
                [alt]="'Photo de ' + review.name"
                class="w-full h-48 object-cover"
              />
            }
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ review.name }}</h3>
              <p class="text-sm text-gray-500 mb-3">{{ review.createdAt | date:'short' }}</p>
              <p class="text-gray-700 whitespace-pre-wrap mb-4">{{ review.reviewText }}</p>
              
              <!-- Like Button -->
              <button
                (click)="toggleLike(review.id)"
                [class.text-red-500]="review.hasLiked"
                [class.text-gray-400]="!review.hasLiked"
                class="flex items-center gap-2 hover:scale-110 transition mb-4"
              >
                <i class="material-icons align-middle" [class.text-red-500]="review.hasLiked" [class.text-gray-400]="!review.hasLiked">{{ review.hasLiked ? 'favorite' : 'favorite_border' }}</i>
                <span class="font-semibold">{{ review.likeCount }}</span>
              </button>

              <!-- Comments Section -->
              <div class="border-t pt-4 mt-4">
                <h4 class="font-semibold mb-2">Commentaires</h4>
                
                <!-- Comment Form -->
                <form (ngSubmit)="addComment(review.id)" class="mb-4">
                  <input
                    type="text"
                    [(ngModel)]="commentForms[review.id].name"
                    name="commentName"
                    placeholder="Votre nom"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                  />
                  <textarea
                    [(ngModel)]="commentForms[review.id].commentText"
                    name="commentText"
                    placeholder="Votre commentaire..."
                    required
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                  ></textarea>
                  <button
                    type="submit"
                    class="w-full bg-ccnb-blue text-white px-4 py-2 rounded hover:bg-ccnb-red transition text-sm"
                  >
                    Commenter
                  </button>
                </form>

                <!-- Comments List -->
                <div class="space-y-3 max-h-48 overflow-y-auto">
                  @for (comment of comments()[review.id] || []; track comment.id) {
                    <div class="bg-gray-50 p-3 rounded">
                      <div class="flex justify-between items-start mb-1">
                        <span class="font-semibold text-sm">{{ comment.name }}</span>
                        <span class="text-xs text-gray-500">{{ comment.createdAt | date:'short' }}</span>
                      </div>
                      <p class="text-sm text-gray-700">{{ comment.commentText }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12">
            <i class="material-icons text-6xl text-gray-300 mb-4">photo_library</i>
            <p class="text-gray-500 text-lg">Aucune photo pour le moment</p>
            <p class="text-gray-400 text-sm mt-2">Partagez votre première expérience après une activité !</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ReviewsComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  
  reviews = signal<Review[]>([]);
  comments = signal<Record<number, Comment[]>>({});
  commentForms: Record<number, { name: string; commentText: string }> = {};
  isSubmitting = signal(false);

  formData = {
    name: '',
    reviewText: '',
    photo: null as File | null
  };
  
  selectedFile: File | null = null;

  constructor() {
    this.loadReviews();
  }

  loadReviews() {
    this.apiService.getReviews().subscribe({
      next: (data) => {
        this.reviews.set(data);
        // Load comments for each review
        data.forEach(review => {
          this.loadComments(review.id);
          if (!this.commentForms[review.id]) {
            this.commentForms[review.id] = { name: '', commentText: '' };
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des avis:', err);
        this.toastService.error('Erreur lors du chargement des avis');
      }
    });
  }

  loadComments(reviewId: number) {
    this.apiService.getComments(reviewId).subscribe({
      next: (data) => {
        const currentComments = this.comments();
        this.comments.set({ ...currentComments, [reviewId]: data });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires:', err);
        // Pas de toast pour les erreurs de chargement de commentaires (trop fréquent)
      }
    });
  }

  toggleLike(reviewId: number) {
    this.apiService.toggleLike(reviewId).subscribe({
      next: () => {
        this.loadReviews();
      },
      error: (err) => {
        console.error('Erreur lors du like:', err);
        this.toastService.error('Erreur lors du like');
      }
    });
  }

  addComment(reviewId: number) {
    const form = this.commentForms[reviewId];
    if (!form.name || !form.commentText) return;

    this.apiService.createComment(reviewId, {
      name: form.name,
      commentText: form.commentText
    }).subscribe({
      next: () => {
        this.commentForms[reviewId] = { name: '', commentText: '' };
        this.loadComments(reviewId);
        this.toastService.success('Commentaire ajouté avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire:', err);
        this.toastService.error('Erreur lors de l\'ajout du commentaire');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.formData.photo = input.files[0];
    }
  }

  onSubmit() {
    if (!this.formData.name || !this.formData.reviewText) return;
    
    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('reviewText', this.formData.reviewText);
    if (this.formData.photo) {
      formData.append('photo', this.formData.photo);
    }

    this.apiService.createReview(formData).subscribe({
      next: () => {
        this.formData = { name: '', reviewText: '', photo: null };
        this.selectedFile = null;
        this.isSubmitting.set(false);
        this.toastService.success('Votre avis a été soumis avec succès ! Il sera visible après approbation par l\'administrateur.');
        // Ne pas recharger les reviews car le nouvel avis n'est pas encore approuvé
      },
      error: (err) => {
        console.error('Erreur lors de la soumission:', err);
        this.isSubmitting.set(false);
        this.toastService.error('Erreur lors de la soumission de votre avis');
      }
    });
  }

  getImageUrl(photoUrl: string | undefined): string {
    if (!photoUrl) return '';
    return `${this.apiService.getBaseUrl()}/uploads/${photoUrl}`;
  }
}

