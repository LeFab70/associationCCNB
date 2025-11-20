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
    path: 'activities',
    loadComponent: () => import('./components/activities/activities.component').then(m => m.ActivitiesComponent)
  },
  {
    path: 'activities/:id',
    loadComponent: () => import('./components/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent)
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
