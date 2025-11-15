import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in"
          [ngClass]="{
            'bg-green-50 border-2 border-green-200': toast.type === 'success',
            'bg-red-50 border-2 border-red-200': toast.type === 'error',
            'bg-blue-50 border-2 border-blue-200': toast.type === 'info',
            'bg-yellow-50 border-2 border-yellow-200': toast.type === 'warning'
          }"
        >
          <div class="flex-shrink-0">
            @if (toast.type === 'success') {
              <i class="material-icons text-green-600">check_circle</i>
            } @else if (toast.type === 'error') {
              <i class="material-icons text-red-600">error</i>
            } @else if (toast.type === 'info') {
              <i class="material-icons text-blue-600">info</i>
            } @else {
              <i class="material-icons text-yellow-600">warning</i>
            }
          </div>
          <div class="flex-1">
            <p 
              class="text-sm font-medium"
              [ngClass]="{
                'text-green-800': toast.type === 'success',
                'text-red-800': toast.type === 'error',
                'text-blue-800': toast.type === 'info',
                'text-yellow-800': toast.type === 'warning'
              }"
            >
              {{ toast.message }}
            </p>
          </div>
          <button 
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
          >
            <i class="material-icons text-lg">close</i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}

