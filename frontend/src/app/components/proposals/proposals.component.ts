import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Proposal } from '../../services/api.service';
import { LinkifyPipe } from '../../pipes/linkify.pipe';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-proposals',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkifyPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 text-ccnb-blue">Activités Proposées</h1>
        <p class="text-gray-600">Découvrez les activités proposées par l'association et votez pour celles qui vous intéressent</p>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex items-center gap-3 mb-4">
          <i class="material-icons text-3xl text-ccnb-blue">lightbulb</i>
          <h2 class="text-2xl font-semibold">Proposer une activité</h2>
        </div>
        <form (ngSubmit)="onSubmit()" #proposalForm="ngForm" class="space-y-4">
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Proposition</label>
            <textarea 
              [(ngModel)]="formData.proposalText" 
              name="proposalText" 
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
              placeholder="Décrivez l'activité que vous souhaitez proposer à l'association..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Photo (optionnelle)</label>
            <input 
              type="file" 
              (change)="onFileSelected($event)" 
              accept="image/*"
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
            [disabled]="!proposalForm.valid || isSubmitting()"
            class="bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting() ? 'Envoi...' : 'Soumettre' }}
          </button>
        </form>
      </div>

      <!-- Liste des activités proposées -->
      <div class="space-y-6">
        @for (proposal of proposals(); track proposal.id) {
          <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
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
                  class="flex flex-col items-center gap-1 px-4 py-3 rounded-lg hover:scale-105 transition border-2"
                  [class.border-red-300]="proposal.hasVoted"
                  [class.border-gray-300]="!proposal.hasVoted"
                >
                  <i class="material-icons align-middle text-2xl" [class.text-red-500]="proposal.hasVoted" [class.text-gray-400]="!proposal.hasVoted">{{ proposal.hasVoted ? 'favorite' : 'favorite_border' }}</i>
                  <span class="font-bold text-lg">{{ proposal.voteCount }}</span>
                  <span class="text-xs text-gray-600">vote(s)</span>
                </button>
              </div>
            </div>
            @if (proposal.photoUrl) {
              <div class="mt-4">
                <img 
                  [src]="getImageUrl(proposal.photoUrl)" 
                  [alt]="'Photo de ' + proposal.name"
                  class="max-w-full h-auto rounded-lg"
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
    photo: null as File | null
  };
  
  selectedFile: File | null = null;

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.formData.photo = input.files[0];
    }
  }

  onSubmit() {
    if (!this.formData.name || !this.formData.proposalText) return;
    
    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('proposalText', this.formData.proposalText);
    if (this.formData.photo) {
      formData.append('photo', this.formData.photo);
    }

    this.apiService.createProposal(formData).subscribe({
      next: () => {
        this.formData = { name: '', proposalText: '', photo: null };
        this.selectedFile = null;
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
    if (!photoUrl) return '';
    return `${this.apiService.getBaseUrl()}/uploads/${photoUrl}`;
  }
}

