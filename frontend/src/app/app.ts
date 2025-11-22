import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { StudentAuthService } from './services/student-auth.service';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private studentAuthService = inject(StudentAuthService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isStudent = computed(() => this.studentAuthService.isAuthenticated());
  isAdmin = computed(() => this.authService.isAuthenticated());
  
  studentName = computed(() => {
    const student = this.studentAuthService.currentStudent();
    if (student) {
      return student.prenom ? `${student.prenom} ${student.nom}` : student.nom;
    }
    return '';
  });

  logoutStudent() {
    this.studentAuthService.logout().subscribe({
      next: () => {
        this.toastService.success('Déconnexion réussie - À bientôt !');
        this.router.navigate(['/']);
      },
      error: () => {
        this.toastService.error('Erreur - Impossible de se déconnecter');
      }
    });
  }

  logoutAdmin() {
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.success('Déconnexion réussie - À bientôt !');
        this.router.navigate(['/']);
      },
      error: () => {
        // Même en cas d'erreur, on déconnecte localement
        this.authService.setAuthenticated(false);
        this.toastService.info('Déconnexion - À bientôt !');
        this.router.navigate(['/']);
      }
    });
  }
}
