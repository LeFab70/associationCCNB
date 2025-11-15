import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'proposals',
    loadComponent: () => import('./components/proposals/proposals.component').then(m => m.ProposalsComponent)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./components/reviews/reviews.component').then(m => m.ReviewsComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
  }
];
