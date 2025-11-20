import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        <i class="material-icons text-sm align-middle">cloud_upload</i>
        {{ label || 'Téléverser un fichier' }}
        @if (required) {
          <span class="text-red-500">*</span>
        }
      </label>
      
      <!-- Zone de drop -->
      <div
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        [class.border-ccnb-blue]="isDragging()"
        [class.bg-ccnb-blue/5]="isDragging()"
        [class.border-2]="isDragging()"
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-ccnb-blue hover:bg-gray-50"
      >
        <input
          #fileInput
          type="file"
          [accept]="accept"
          [multiple]="multiple"
          (change)="onFileSelected($event)"
          class="hidden"
        />
        
        @if (isUploading()) {
          <div class="flex flex-col items-center gap-4">
            <div class="animate-spin-slow">
              <i class="material-icons text-6xl text-ccnb-blue">cloud_upload</i>
            </div>
            <p class="text-gray-600 font-medium">Téléversement en cours...</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-ccnb-blue h-2.5 rounded-full transition-all duration-300" [style.width.%]="uploadProgress()"></div>
            </div>
            <p class="text-sm text-gray-500">{{ uploadProgress() }}%</p>
          </div>
        } @else if (selectedFiles().length > 0) {
          <div class="space-y-3">
            @for (file of selectedFiles(); track file.name) {
              <div class="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div class="flex items-center gap-3 flex-1">
                  <i class="material-icons text-ccnb-blue text-2xl">
                    {{ getFileIcon(file.type) }}
                  </i>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="removeFile(file); $event.stopPropagation()"
                  class="ml-2 text-red-500 hover:text-red-700 transition p-1 rounded hover:bg-red-50"
                  title="Supprimer"
                >
                  <i class="material-icons text-lg">close</i>
                </button>
              </div>
            }
            <button
              type="button"
              (click)="fileInput.click(); $event.stopPropagation()"
              class="mt-2 text-sm text-ccnb-blue hover:text-ccnb-red transition flex items-center gap-1"
            >
              <i class="material-icons text-sm">add</i>
              Ajouter un autre fichier
            </button>
          </div>
        } @else {
          <div class="flex flex-col items-center gap-4">
            <i class="material-icons text-6xl text-gray-400">cloud_upload</i>
            <div>
              <p class="text-gray-700 font-medium mb-1">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <p class="text-sm text-gray-500">
                Formats acceptés: {{ accept || 'Tous les fichiers' }}
              </p>
              @if (maxSize) {
                <p class="text-xs text-gray-400 mt-1">Taille maximale: {{ formatFileSize(maxSize) }}</p>
              }
            </div>
          </div>
        }
      </div>
      
      @if (errorMessage()) {
        <div class="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <i class="material-icons text-sm">error</i>
          <span>{{ errorMessage() }}</span>
        </div>
      }
      
      @if (hint) {
        <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <i class="material-icons text-sm">info</i>
          {{ hint }}
        </p>
      }
    </div>
  `
})
export class FileUploadComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  @Input() label?: string;
  @Input() accept?: string = 'image/*';
  @Input() multiple: boolean = false;
  @Input() required: boolean = false;
  @Input() maxSize?: number; // en bytes
  @Input() hint?: string;
  @Input() autoUpload: boolean = true;
  
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() filesUploaded = new EventEmitter<string[]>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFiles = signal<File[]>([]);
  uploadedUrls = signal<string[]>([]);
  isDragging = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  errorMessage = signal<string>('');

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    this.errorMessage.set('');
    
    // Validation de la taille
    if (this.maxSize) {
      const invalidFiles = files.filter(file => file.size > this.maxSize!);
      if (invalidFiles.length > 0) {
        this.errorMessage.set(`Certains fichiers dépassent la taille maximale de ${this.formatFileSize(this.maxSize!)}`);
        files = files.filter(file => file.size <= this.maxSize!);
      }
    }

    // Validation du type
    if (this.accept) {
      const acceptTypes = this.accept.split(',').map(t => t.trim());
      const invalidFiles = files.filter(file => {
        if (acceptTypes.includes('image/*')) {
          return !file.type.startsWith('image/');
        }
        return !acceptTypes.some(type => file.type.includes(type.replace('*', '')));
      });
      
      if (invalidFiles.length > 0) {
        this.errorMessage.set(`Certains fichiers ne sont pas du bon type. Types acceptés: ${this.accept}`);
        files = files.filter(file => {
          if (acceptTypes.includes('image/*')) {
            return file.type.startsWith('image/');
          }
          return acceptTypes.some(type => file.type.includes(type.replace('*', '')));
        });
      }
    }

    if (files.length === 0) {
      return;
    }

    if (this.multiple) {
      this.selectedFiles.set([...this.selectedFiles(), ...files]);
    } else {
      this.selectedFiles.set([files[0]]);
    }

    this.filesSelected.emit(this.selectedFiles());

    if (this.autoUpload) {
      this.uploadFiles();
    }
  }

  removeFile(file: File) {
    this.selectedFiles.set(this.selectedFiles().filter(f => f !== file));
    this.filesSelected.emit(this.selectedFiles());
  }

  clearFiles() {
    this.selectedFiles.set([]);
    this.uploadedUrls.set([]);
    this.errorMessage.set('');
    this.filesSelected.emit([]);
  }

  async uploadFiles() {
    const files = this.selectedFiles();
    if (files.length === 0) {
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set('');

    try {
      if (files.length === 1) {
        // Upload simple
        this.apiService.uploadFile(files[0]).subscribe({
          next: (response) => {
            this.uploadProgress.set(100);
            this.uploadedUrls.set([response.fileUrl]);
            this.filesUploaded.emit([response.fileUrl]);
            this.toastService.success('Fichier uploadé avec succès !');
            setTimeout(() => {
              this.isUploading.set(false);
              this.uploadProgress.set(0);
            }, 500);
          },
          error: (err) => {
            this.isUploading.set(false);
            this.uploadProgress.set(0);
            const errorMsg = err.error?.message || 'Erreur lors de l\'upload du fichier';
            this.errorMessage.set(errorMsg);
            this.uploadError.emit(errorMsg);
            this.toastService.error(errorMsg);
          }
        });
      } else {
        // Upload multiple
        this.apiService.uploadMultipleFiles(files).subscribe({
          next: (response) => {
            this.uploadProgress.set(100);
            const urls = Object.values(response.uploadedFiles);
            this.uploadedUrls.set(urls);
            this.filesUploaded.emit(urls);
            this.toastService.success(`${response.successCount} fichier(s) uploadé(s) avec succès !`);
            setTimeout(() => {
              this.isUploading.set(false);
              this.uploadProgress.set(0);
            }, 500);
          },
          error: (err) => {
            this.isUploading.set(false);
            this.uploadProgress.set(0);
            const errorMsg = err.error?.message || 'Erreur lors de l\'upload des fichiers';
            this.errorMessage.set(errorMsg);
            this.uploadError.emit(errorMsg);
            this.toastService.error(errorMsg);
          }
        });
      }

      // Simulation de progression (pour l'UX)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress < 90) {
          this.uploadProgress.set(progress);
        } else {
          clearInterval(interval);
        }
      }, 200);

    } catch (error: any) {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
      const errorMsg = error.message || 'Erreur lors de l\'upload';
      this.errorMessage.set(errorMsg);
      this.uploadError.emit(errorMsg);
      this.toastService.error(errorMsg);
    }
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video_library';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getUploadedUrls(): string[] {
    return this.uploadedUrls();
  }
}

