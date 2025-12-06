import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'gallery/shared/:token',
    loadComponent: () => import('./pages/shared-gallery/shared-gallery.component').then(m => m.SharedGalleryComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'gallery-admin',
    loadComponent: () => import('./pages/gallery-admin/gallery-admin.component').then(m => m.GalleryAdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'portfolio-admin',
    loadComponent: () => import('./pages/portfolio-admin/portfolio-admin.component').then(m => m.PortfolioAdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'message-center',
    loadComponent: () => import('./pages/message-center/message-center').then(m => m.MessageCenterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'promotion-admin',
    loadComponent: () => import('./pages/promotion-admin/promotion-admin.component').then(m => m.PromotionAdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'analytics-dashboard',
    loadComponent: () => import('./pages/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'packages',
    loadComponent: () => import('./pages/packages/packages.component').then(m => m.PackagesComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  { path: '**', redirectTo: '/home' }
];
