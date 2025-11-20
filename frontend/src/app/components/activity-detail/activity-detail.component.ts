import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Activity, Review, Comment, ActivityPhotoComment } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LinkifyPipe } from '../../pipes/linkify.pipe';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LinkifyPipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Bouton retour -->
      <button [routerLink]="['/activities']" class="mb-6 flex items-center gap-2 text-ccnb-blue hover:text-ccnb-red transition">
        <i class="material-icons">arrow_back</i>
        <span>Retour aux activités</span>
      </button>

      @if (activity()) {
        <!-- Détails de l'activité -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <!-- Carrousel de photos -->
          @if (getAllPhotos().length > 0) {
            <div class="relative h-64 md:h-96 overflow-hidden bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark">
              <!-- Photo principale -->
              <img
                [src]="getImageUrl(getAllPhotos()[currentPhotoIndex()]?.photoUrl || activity()!.imageUrl)"
                [alt]="activity()!.title"
                class="w-full h-full object-cover transition-opacity duration-300"
                (error)="handleImageError($event)"
              />
              
              <!-- Boutons de navigation -->
              @if (getAllPhotos().length > 1) {
                <button
                  (click)="previousPhoto()"
                  class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ccnb-blue rounded-full p-2 transition"
                  [class.opacity-50]="currentPhotoIndex() === 0"
                  [disabled]="currentPhotoIndex() === 0"
                >
                  <i class="material-icons">chevron_left</i>
                </button>
                <button
                  (click)="nextPhoto()"
                  class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ccnb-blue rounded-full p-2 transition"
                  [class.opacity-50]="currentPhotoIndex() === getAllPhotos().length - 1"
                  [disabled]="currentPhotoIndex() === getAllPhotos().length - 1"
                >
                  <i class="material-icons">chevron_right</i>
                </button>
                
                <!-- Indicateurs de photos -->
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  @for (photo of getAllPhotos(); track photo.id; let i = $index) {
                    <button
                      (click)="currentPhotoIndex.set(i)"
                      class="w-2 h-2 rounded-full transition"
                      [class.bg-white]="i === currentPhotoIndex()"
                      [class.bg-white/50]="i !== currentPhotoIndex()"
                    ></button>
                  }
                </div>
                
                <!-- Compteur de photos -->
                <div class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {{ currentPhotoIndex() + 1 }} / {{ getAllPhotos().length }}
                </div>
              }
              
              <!-- Bouton Like pour la photo actuelle -->
              @if (getCurrentPhoto()?.id) {
                <div class="absolute bottom-4 right-4 z-10">
                  <button
                    (click)="togglePhotoLike(getCurrentPhoto()!.id!)"
                    [class.text-red-500]="getCurrentPhoto()?.hasLiked"
                    [class.text-white]="!getCurrentPhoto()?.hasLiked"
                    class="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 transition-all duration-200 shadow-lg hover:scale-110"
                    title="Liker cette photo"
                  >
                    <i class="material-icons align-middle text-2xl">{{ getCurrentPhoto()?.hasLiked ? 'favorite' : 'favorite_border' }}</i>
                    <span class="ml-2 font-semibold">{{ getCurrentPhoto()?.likeCount || 0 }}</span>
                  </button>
                </div>
              }
            </div>
            
            <!-- Section Like et Commentaires pour la photo actuelle -->
            @if (getCurrentPhoto()?.id) {
              <div class="p-6 bg-gray-50 border-t">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="material-icons text-ccnb-blue">comment</i>
                    Commentaires sur cette photo ({{ (photoComments()[getCurrentPhoto()!.id!] || []).length }})
                  </h3>
                  
                  <!-- Formulaire de commentaire -->
                  <form (ngSubmit)="addPhotoComment(getCurrentPhoto()!.id!)" class="mb-4 bg-white p-4 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      [(ngModel)]="photoCommentForms[getCurrentPhoto()!.id!].name"
                      name="photoCommentName"
                      placeholder="Votre nom"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                    />
                    <textarea
                      [(ngModel)]="photoCommentForms[getCurrentPhoto()!.id!].commentText"
                      name="photoCommentText"
                      placeholder="Votre commentaire..."
                      required
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                    ></textarea>
                    <button
                      type="submit"
                      class="w-full bg-ccnb-blue text-white px-4 py-2 rounded hover:bg-ccnb-red transition text-sm"
                    >
                      <i class="material-icons text-sm align-middle">send</i>
                      Commenter
                    </button>
                  </form>
                  
                  <!-- Liste des commentaires -->
                  <div class="space-y-3">
                    @for (comment of (photoComments()[getCurrentPhoto()!.id!] || []); track comment.id) {
                      <div class="bg-white p-3 rounded-lg border border-gray-200">
                        <div class="flex justify-between items-start mb-1">
                          <span class="font-semibold text-sm text-gray-800">{{ comment.name }}</span>
                          <span class="text-xs text-gray-500">{{ comment.createdAt | date:'short' }}</span>
                        </div>
                        <p class="text-sm text-gray-700">{{ comment.commentText }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          } @else if (activity()!.imageUrl) {
            <div class="relative h-64 md:h-96 overflow-hidden bg-gradient-to-br from-ccnb-blue to-ccnb-blue-dark">
              <img
                [src]="getImageUrl(activity()!.imageUrl)"
                [alt]="activity()!.title"
                class="w-full h-full object-cover"
                (error)="handleImageError($event)"
              />
            </div>
          }
          
          <div class="p-8">
            <h1 class="text-4xl font-bold text-ccnb-blue mb-4">{{ activity()!.title }}</h1>
            <p class="text-sm text-gray-500 mb-6">{{ activity()!.createdAt | date:'short' }}</p>
            <div class="text-gray-700 whitespace-pre-wrap mb-6 text-lg" [innerHTML]="activity()!.description | linkify"></div>
            
            <!-- Like/Vote Button -->
            <div class="flex items-center gap-4 pt-6 border-t">
              <button
                (click)="toggleLike(activity()!.id)"
                [class.text-red-500]="activity()!.hasLiked"
                [class.text-gray-400]="!activity()!.hasLiked"
                class="flex items-center gap-2 hover:scale-110 transition"
              >
                <i class="material-icons align-middle text-3xl" [class.text-red-500]="activity()!.hasLiked" [class.text-gray-400]="!activity()!.hasLiked">
                  {{ activity()!.hasLiked ? 'favorite' : 'favorite_border' }}
                </i>
                <span class="font-semibold text-xl">{{ activity()!.likeCount }}</span>
                <span class="text-gray-600">{{ activity()!.isPublished ? 'like(s)' : 'vote(s)' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Section Avis -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-ccnb-blue mb-6 flex items-center gap-2">
            <i class="material-icons">comment</i>
            Avis des participants ({{ reviews().length }})
          </h2>

          <!-- Formulaire d'avis -->
          <div class="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 class="text-lg font-semibold mb-4">Partagez votre expérience</h3>
            <form (ngSubmit)="onSubmitReview()" #reviewForm="ngForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Votre nom</label>
                <input
                  type="text"
                  [(ngModel)]="reviewFormData.name"
                  name="name"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Votre avis</label>
                <textarea
                  [(ngModel)]="reviewFormData.reviewText"
                  name="reviewText"
                  required
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
                  placeholder="Partagez votre expérience après avoir participé à cette activité..."
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
                    <i class="material-icons text-gray-500 text-xl">image</i>
                    <span class="text-sm text-gray-600">{{ selectedFile.name }}</span>
                    <button type="button" (click)="selectedFile = null" class="ml-2 text-red-500 hover:text-red-700">
                      <i class="material-icons text-lg">close</i>
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
                  <i class="material-icons animate-spin">refresh</i>
                  <span>Envoi...</span>
                } @else {
                  <i class="material-icons">send</i>
                  <span>Publier mon avis</span>
                }
              </button>
            </form>
          </div>

          <!-- Liste des avis -->
          <div class="space-y-6">
            @for (review of reviews(); track review.id) {
              <div class="border-l-4 pl-6 py-4 rounded-r-lg" [class.border-ccnb-blue]="review.isApproved" [class.border-yellow-500]="!review.isApproved" [class.bg-yellow-50]="!review.isApproved">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <h4 class="font-semibold text-lg text-gray-800">{{ review.name }}</h4>
                    @if (!review.isApproved) {
                      <span class="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <i class="material-icons text-sm">schedule</i>
                        En attente de modération
                      </span>
                    }
                  </div>
                  <span class="text-sm text-gray-500">{{ review.createdAt | date:'short' }}</span>
                </div>
                <p class="text-gray-700 mb-3 whitespace-pre-wrap">{{ review.reviewText }}</p>
                @if (review.photoUrl) {
                  <div class="mt-4">
                    <img
                      [src]="getImageUrl(review.photoUrl)"
                      [alt]="'Photo de ' + review.name"
                      class="max-w-full h-auto rounded-lg"
                    />
                  </div>
                }
                
                <!-- Like Button -->
                <div class="flex items-center gap-4 mt-4 pt-4 border-t">
                  <button
                    (click)="toggleReviewLike(review.id)"
                    [class.text-red-500]="review.hasLiked"
                    [class.text-gray-400]="!review.hasLiked"
                    class="flex items-center gap-2 hover:scale-110 transition"
                  >
                    <i class="material-icons align-middle" [class.text-red-500]="review.hasLiked" [class.text-gray-400]="!review.hasLiked">
                      {{ review.hasLiked ? 'favorite' : 'favorite_border' }}
                    </i>
                    <span class="font-semibold">{{ review.likeCount }}</span>
                    <span class="text-sm text-gray-600">like(s)</span>
                  </button>
                </div>

                <!-- Section Commentaires -->
                <div class="mt-6 pt-6 border-t">
                  <h5 class="font-semibold mb-4 flex items-center gap-2">
                    <i class="material-icons text-ccnb-blue">comment</i>
                    Commentaires ({{ (comments()[review.id] || []).length }})
                  </h5>

                  <!-- Formulaire de commentaire -->
                  <form (ngSubmit)="addComment(review.id)" class="mb-4 bg-gray-50 p-4 rounded-lg">
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
                      <i class="material-icons text-sm align-middle">send</i>
                      Commenter
                    </button>
                  </form>

                  <!-- Liste des commentaires -->
                  <div class="space-y-3">
                    @for (comment of comments()[review.id] || []; track comment.id) {
                      <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex justify-between items-start mb-1">
                          <span class="font-semibold text-sm text-gray-800">{{ comment.name }}</span>
                          <span class="text-xs text-gray-500">{{ comment.createdAt | date:'short' }}</span>
                        </div>
                        <p class="text-sm text-gray-700">{{ comment.commentText }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="text-center py-12 text-gray-500">
                <i class="material-icons text-6xl text-gray-300 mb-4">comment</i>
                <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <i class="material-icons text-6xl text-gray-300 mb-4 animate-spin">refresh</i>
          <p class="text-gray-500">Chargement...</p>
        </div>
      }
    </div>
  `,
})
export class ActivityDetailComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  activity = signal<Activity | null>(null);
  reviews = signal<Review[]>([]);
  comments = signal<Record<number, Comment[]>>({});
  photoComments = signal<Record<number, ActivityPhotoComment[]>>({});
  commentForms: Record<number, { name: string; commentText: string }> = {};
  photoCommentForms: Record<number, { name: string; commentText: string }> = {};
  isSubmitting = signal(false);
  currentPhotoIndex = signal(0);

  reviewFormData = {
    name: '',
    reviewText: '',
    photo: null as File | null
  };

  selectedFile: File | null = null;

  ngOnInit() {
    const activityId = this.route.snapshot.paramMap.get('id');
    if (activityId) {
      this.loadActivity(Number(activityId));
      this.loadReviews(Number(activityId));
    }
  }

  loadActivity(id: number) {
    this.apiService.getActivityById(id).subscribe({
      next: (data) => {
        this.activity.set(data);
        // Charger les commentaires pour chaque photo
        if (data.photos && data.photos.length > 0) {
          data.photos.forEach(photo => {
            if (photo.id) {
              this.loadPhotoComments(photo.id);
              if (!this.photoCommentForms[photo.id]) {
                this.photoCommentForms[photo.id] = { name: '', commentText: '' };
              }
            }
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'activité:', err);
        this.toastService.error('Erreur lors du chargement de l\'activité');
      }
    });
  }
  
  loadPhotoComments(photoId: number) {
    this.apiService.getActivityPhotoComments(photoId).subscribe({
      next: (data) => {
        const currentComments = this.photoComments();
        this.photoComments.set({ ...currentComments, [photoId]: data });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires de photo:', err);
      }
    });
  }

  loadReviews(activityId: number) {
    this.apiService.getReviewsByActivityId(activityId).subscribe({
      next: (data) => {
        this.reviews.set(data);
        // Charger les commentaires pour chaque avis
        data.forEach(review => {
          this.loadComments(review.id);
          if (!this.commentForms[review.id]) {
            this.commentForms[review.id] = { name: '', commentText: '' };
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des avis:', err);
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
      }
    });
  }

  toggleLike(activityId: number) {
    this.apiService.toggleActivityLike(activityId).subscribe({
      next: (updatedActivity) => {
        this.activity.set(updatedActivity);
      },
      error: (err) => {
        console.error('Erreur lors du like:', err);
        this.toastService.error('Erreur lors du like');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.reviewFormData.photo = input.files[0];
    }
  }

  onSubmitReview() {
    if (!this.reviewFormData.name || !this.reviewFormData.reviewText || !this.activity()) return;

    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('name', this.reviewFormData.name);
    formData.append('reviewText', this.reviewFormData.reviewText);
    if (this.reviewFormData.photo) {
      formData.append('photo', this.reviewFormData.photo);
    }

    this.apiService.createReview(this.activity()!.id, formData).subscribe({
      next: () => {
        this.reviewFormData = { name: '', reviewText: '', photo: null };
        this.selectedFile = null;
        this.isSubmitting.set(false);
        this.toastService.success('Votre avis a été soumis avec succès ! Il est maintenant visible.');
        this.loadReviews(this.activity()!.id);
      },
      error: (err) => {
        console.error('Erreur lors de la soumission:', err);
        this.isSubmitting.set(false);
        this.toastService.error('Erreur lors de la soumission de votre avis');
      }
    });
  }

  toggleReviewLike(reviewId: number) {
    this.apiService.toggleLike(reviewId).subscribe({
      next: () => {
        const activityId = this.activity()?.id;
        if (activityId) {
          this.loadReviews(activityId);
        }
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

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) {
      console.warn('getImageUrl (activity-detail): imageUrl is undefined or empty');
      return '';
    }
    
    // Correction automatique : supprimer /public_html/aeccb si présent deux fois
    if (imageUrl.includes('/public_html/aeccb')) {
      console.warn('URL incorrecte détectée (contient /public_html/aeccb), correction automatique...', imageUrl);
      imageUrl = imageUrl.replace('/public_html/aeccb', '');
      console.log('URL corrigée:', imageUrl);
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('getImageUrl (activity-detail): URL complète détectée:', imageUrl);
      return imageUrl;
    }
    
    const localUrl = `${this.apiService.getBaseUrl()}/uploads/${imageUrl}`;
    console.log('getImageUrl (activity-detail): URL locale construite:', localUrl);
    return localUrl;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    console.error('Erreur de chargement d\'image (activity-detail):', img.src);
    console.error('URL complète:', img.src);
    img.style.display = 'none';
    
    // Afficher un toast pour informer l'utilisateur
    this.toastService.error(`Impossible de charger l'image: ${img.src}`);
  }

  getAllPhotos(): Array<{ id?: number; photoUrl: string; displayOrder?: number }> {
    const activityData = this.activity();
    if (!activityData) return [];
    
    const photos: Array<{ id?: number; photoUrl: string; displayOrder?: number }> = [];
    
    // Ajouter la photo principale si elle existe
    if (activityData.imageUrl) {
      photos.push({ photoUrl: activityData.imageUrl, displayOrder: -1 });
    }
    
    // Ajouter les photos supplémentaires
    if (activityData.photos && activityData.photos.length > 0) {
      photos.push(...activityData.photos.map(p => ({ id: p.id, photoUrl: p.photoUrl, displayOrder: p.displayOrder })));
    }
    
    // Trier par displayOrder
    return photos.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  nextPhoto() {
    const photos = this.getAllPhotos();
    if (this.currentPhotoIndex() < photos.length - 1) {
      this.currentPhotoIndex.set(this.currentPhotoIndex() + 1);
    }
  }

  previousPhoto() {
    if (this.currentPhotoIndex() > 0) {
      this.currentPhotoIndex.set(this.currentPhotoIndex() - 1);
    }
  }
  
  getCurrentPhoto() {
    const photos = this.getAllPhotos();
    const index = this.currentPhotoIndex();
    if (index >= 0 && index < photos.length) {
      const photo = photos[index];
      // Récupérer les données complètes de la photo depuis l'activité
      const activityData = this.activity();
      if (activityData?.photos && photo.id) {
        return activityData.photos.find(p => p.id === photo.id);
      }
      return photo;
    }
    return null;
  }
  
  togglePhotoLike(photoId: number) {
    this.apiService.toggleActivityPhotoLike(photoId).subscribe({
      next: () => {
        // Recharger l'activité pour mettre à jour les likes
        const activityId = this.activity()?.id;
        if (activityId) {
          this.loadActivity(activityId);
        }
        this.toastService.success('Like mis à jour');
      },
      error: (err) => {
        console.error('Erreur lors du like de la photo:', err);
        this.toastService.error('Erreur lors du like de la photo');
      }
    });
  }
  
  addPhotoComment(photoId: number) {
    const form = this.photoCommentForms[photoId];
    if (!form.name || !form.commentText) return;

    this.apiService.createActivityPhotoComment(photoId, form.name, form.commentText).subscribe({
      next: () => {
        this.photoCommentForms[photoId] = { name: '', commentText: '' };
        this.loadPhotoComments(photoId);
        this.toastService.success('Commentaire ajouté avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire:', err);
        this.toastService.error('Erreur lors de l\'ajout du commentaire');
      }
    });
  }
}

