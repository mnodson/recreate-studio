import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth state to finish loading
  while (authService.loading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  router.navigate(['/login']);
  return false;
};
