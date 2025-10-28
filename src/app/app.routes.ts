import { Routes } from '@angular/router';

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
    path: 'packages', 
    loadComponent: () => import('./pages/packages/packages.component').then(m => m.PackagesComponent) 
  },
  { path: '**', redirectTo: '/home' }
];
