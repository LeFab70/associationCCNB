import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000) {
    const toast: Toast = {
      id: this.toastIdCounter++,
      message,
      type,
      duration
    };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
    
    return toast.id;
  }

  success(message: string, duration: number = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 7000) {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 5000) {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 6000) {
    return this.show(message, 'warning', duration);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear() {
    this.toasts.set([]);
  }
}

