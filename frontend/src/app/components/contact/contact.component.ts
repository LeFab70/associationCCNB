import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold mb-8 text-ccnb-blue text-center">Contactez-nous</h1>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="flex justify-center mb-6">
          <div class="bg-ccnb-blue/10 rounded-full p-6">
            <i class="material-icons text-6xl text-ccnb-blue">mail</i>
          </div>
        </div>
        
        <form (ngSubmit)="onSubmit()" #contactForm="ngForm" class="space-y-6">
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Courriel</label>
            <input 
              type="email" 
              [(ngModel)]="formData.email" 
              name="email" 
              required
              email
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
              placeholder="votre.email@exemple.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea 
              [(ngModel)]="formData.message" 
              name="message" 
              required
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ccnb-blue focus:border-transparent"
              placeholder="Votre message..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            [disabled]="!contactForm.valid || isSubmitting()"
            class="w-full bg-ccnb-blue text-white px-6 py-3 rounded-lg hover:bg-ccnb-red transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i class="material-icons text-xl align-middle">send</i>
            {{ isSubmitting() ? 'Envoi...' : 'Envoyer' }}
          </button>
        </form>

      </div>
    </div>
  `
})
export class ContactComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  
  isSubmitting = signal(false);
  
  formData = {
    name: '',
    email: '',
    message: ''
  };

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) return;
    
    this.isSubmitting.set(true);

    this.apiService.createContact(this.formData).subscribe({
      next: () => {
        this.formData = { name: '', email: '', message: '' };
        this.isSubmitting.set(false);
        this.toastService.success('Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.');
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi:', err);
        this.isSubmitting.set(false);
        this.toastService.error('Erreur lors de l\'envoi du message');
      }
    });
  }
}

