import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Proposal } from '../../services/api.service';
import { LinkifyPipe } from '../../pipes/linkify.pipe';
import { ToastService } from '../../services/toast.service';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-proposals',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkifyPipe, FileUploadComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 text-ccnb-blue">Activités Proposées</h1>
        <p class="text-gray-600">Découvrez les activités proposées par l'association et votez pour celles qui vous intéressent</p>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8 animate-fade-in border-2 border-gray-100 hover:border-ccnb-blue/30 transition-all duration-300">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-ccnb-blue/10 rounded-full p-3">
            <i class="material-icons text-3xl text-ccnb-blue animate-pulse-slow">lightbulb</i>
          </div>
          <h2 class="text-2xl font-semibold text-ccnb-blue">Proposer une activité</h2>
        </div>
        <p class="text-gray-600 mb-6 text-sm flex items-center gap-2">
          <i class="material-icons text-sm text-ccnb-blue">info</i>
          Partagez vos idées d'activités avec l'association. Les meilleures propositions seront organisées !
        </p>
        <form (ngSubmit)="onSubmit()" #proposalForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <i class="material-icons text-sm text-ccnb-blue">person</i>
              Nom
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              [(ngModel)]="formData.name" 
              name="name" 
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-ccnb-blue transition-all duration-200"
              placeholder="Votre nom complet"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <i class="material-icons text-sm text-ccnb-blue">description</i>
              Description de l'activité
              <span class="text-red-500">*</span>
            </label>
            <textarea 
              [(ngModel)]="formData.proposalText" 
              name="proposalText" 
              required
              rows="6"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-ccnb-blue transition-all duration-200 resize-none"
              placeholder="Décrivez en détail l'activité que vous souhaitez proposer à l'association. Incluez les informations importantes comme le lieu, la date souhaitée, le nombre de participants, etc."
            ></textarea>
            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <i class="material-icons text-xs">tips_and_updates</i>
              Plus votre description est détaillée, plus votre proposition a de chances d'être retenue !
            </p>
          </div>
          <div>
            <app-file-upload
              label="Photo (optionnelle)"
              accept="image/*"
              [multiple]="false"
              [required]="false"
              [maxSize]="10 * 1024 * 1024"
              hint="Formats acceptés: JPG, PNG, GIF. Taille maximale: 10MB"
              (filesUploaded)="onFileUploaded($event)"
              (uploadError)="onUploadError($event)"
            ></app-file-upload>
          </div>
          <button 
            type="submit" 
            [disabled]="!proposalForm.valid || isSubmitting()"
            class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
          >
            @if (isSubmitting()) {
              <i class="material-icons text-lg align-middle animate-spin-slow">hourglass_empty</i>
              <span>Envoi en cours...</span>
            } @else {
              <i class="material-icons text-lg align-middle">send</i>
              <span>Soumettre la proposition</span>
            }
          </button>
        </form>
      </div>

      <!-- Liste des activités proposées -->
      <div class="space-y-6">
        @if (proposals().length === 0) {
          <div class="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 animate-fade-in">
            <i class="material-icons text-6xl text-gray-400 mb-4 animate-bounce-slow">lightbulb_outline</i>
            <p class="text-xl text-gray-600 font-medium mb-2">Aucune proposition pour le moment</p>
            <p class="text-gray-500">Soyez le premier à soumettre une proposition d'activité !</p>
          </div>
        }
        @for (proposal of proposals(); track proposal.id) {
          <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-ccnb-blue/30 animate-fade-in">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <i class="material-icons text-ccnb-blue">event</i>
                  <h3 class="text-xl font-semibold text-gray-800">{{ proposal.name }}</h3>
                </div>
                <p class="text-sm text-gray-500 mb-3">{{ proposal.createdAt | date:'short' }}</p>
                <div class="text-gray-700 mb-4 whitespace-pre-wrap" [innerHTML]="proposal.proposalText | linkify"></div>
              </div>
              <div class="ml-4">
                <button 
                  (click)="toggleVote(proposal.id)"
                  [class.bg-red-50]="proposal.hasVoted"
                  [class.bg-gray-50]="!proposal.hasVoted"
                  class="flex flex-col items-center gap-1 px-4 py-3 rounded-lg hover:scale-110 transition-all duration-200 border-2 shadow-md hover:shadow-lg"
                  [class.border-red-300]="proposal.hasVoted"
                  [class.border-gray-300]="!proposal.hasVoted"
                  [class.hover:border-red-400]="proposal.hasVoted"
                  [class.hover:border-ccnb-blue]="!proposal.hasVoted"
                >
                  <i class="material-icons align-middle text-2xl transition-transform duration-200 hover:scale-125" [class.text-red-500]="proposal.hasVoted" [class.text-gray-400]="!proposal.hasVoted" [class.animate-pulse-slow]="proposal.hasVoted">{{ proposal.hasVoted ? 'favorite' : 'favorite_border' }}</i>
                  <span class="font-bold text-lg text-ccnb-blue">{{ proposal.voteCount }}</span>
                  <span class="text-xs text-gray-600">vote(s)</span>
                </button>
              </div>
            </div>
            @if (proposal.photoUrl) {
              <div class="mt-4 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-ccnb-blue transition-all duration-300">
                <img 
                  [src]="getImageUrl(proposal.photoUrl)" 
                  [alt]="'Photo de ' + proposal.name"
                  class="max-w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
                  (click)="openImageModal(getImageUrl(proposal.photoUrl))"
                />
              </div>
            }
          </div>
        } @empty {
          <div class="text-center py-12 text-gray-500">
            <p>Aucune proposition pour le moment. Soyez le premier à en soumettre une !</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ProposalsComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  
  proposals = signal<Proposal[]>([]);
  isSubmitting = signal(false);
  
  formData = {
    name: '',
    proposalText: '',
    photoUrl: '' as string
  };

  constructor() {
    this.loadProposals();
  }

  loadProposals() {
    this.apiService.getProposals().subscribe({
      next: (data) => this.proposals.set(data),
      error: (err) => {
        console.error('Erreur lors du chargement des propositions:', err);
        this.toastService.error('Erreur lors du chargement des activités');
      }
    });
  }

  onFileUploaded(urls: string[]) {
    if (urls.length > 0) {
      this.formData.photoUrl = urls[0];
    }
  }

  onUploadError(error: string) {
    this.toastService.error(error);
  }

  onSubmit() {
    if (!this.formData.name || !this.formData.proposalText) return;
    
    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('proposalText', this.formData.proposalText);
    if (this.formData.photoUrl) {
      formData.append('photoUrl', this.formData.photoUrl);
    }

    this.apiService.createProposal(formData).subscribe({
      next: () => {
        this.formData = { name: '', proposalText: '', photoUrl: '' };
        this.isSubmitting.set(false);
        this.toastService.success('Votre proposition a été soumise avec succès !');
        this.loadProposals();
      },
      error: (err) => {
        console.error('Erreur lors de la soumission:', err);
        this.isSubmitting.set(false);
        this.toastService.error('Erreur lors de la soumission de votre proposition');
      }
    });
  }

  toggleVote(proposalId: number) {
    this.apiService.toggleVote(proposalId).subscribe({
      next: (updatedProposal) => {
        this.proposals.update(proposals => 
          proposals.map(p => p.id === proposalId ? updatedProposal : p)
        );
      },
      error: (err) => {
        console.error('Erreur lors du vote:', err);
        this.toastService.error('Erreur lors du vote');
      }
    });
  }

  getImageUrl(photoUrl: string | undefined): string {
    if (!photoUrl) {
      console.warn('getImageUrl (proposals): photoUrl is undefined or empty');
      return '';
    }
    
    // Correction automatique : supprimer /public_html/aeccb si présent deux fois
    if (photoUrl.includes('/public_html/aeccb')) {
      console.warn('URL incorrecte détectée (contient /public_html/aeccb), correction automatique...', photoUrl);
      photoUrl = photoUrl.replace('/public_html/aeccb', '');
      console.log('URL corrigée:', photoUrl);
    }
    
    // Si c'est déjà une URL complète (FTP), la retourner telle quelle
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      console.log('getImageUrl (proposals): URL complète détectée:', photoUrl);
      return photoUrl;
    }
    
    // Sinon, utiliser l'URL locale
    const localUrl = `${this.apiService.getBaseUrl()}/uploads/${photoUrl}`;
    console.log('getImageUrl (proposals): URL locale construite:', localUrl);
    return localUrl;
  }

  openImageModal(imageUrl: string) {
    // Ouvrir l'image en plein écran (simple implémentation)
    window.open(imageUrl, '_blank');
  }
}

