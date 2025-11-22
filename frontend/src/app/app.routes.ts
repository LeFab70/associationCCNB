import { Routes } from '@angular/router';
import { studentAuthGuard } from './guards/student-auth.guard';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/auth-choice/auth-choice.component').then(m => m.AuthChoiceComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [studentAuthGuard]
  },
  {
    path: 'proposals',
    loadComponent: () => import('./components/proposals/proposals.component').then(m => m.ProposalsComponent),
    canActivate: [studentAuthGuard]
  },
  {
    path: 'activities',
    loadComponent: () => import('./components/activities/activities.component').then(m => m.ActivitiesComponent),
    canActivate: [studentAuthGuard]
  },
  {
    path: 'activities/:id',
    loadComponent: () => import('./components/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent),
    canActivate: [studentAuthGuard]
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent),
    canActivate: [studentAuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminAuthGuard]
  },
  {
    path: 'create-profile',
    loadComponent: () => import('./components/create-profile/create-profile.component').then(m => m.CreateProfileComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  }
];
