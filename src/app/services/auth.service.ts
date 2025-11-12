import { Injectable, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  loading = signal(true);

  private googleProvider = new GoogleAuthProvider();

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      // Check if user is authorized
      if (user && !this.isAuthorized(user.email)) {
        console.warn('Unauthorized access attempt:', user.email);
        this.signOut();
        return;
      }
      this.currentUser.set(user);
      this.loading.set(false);
    });
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);

      // Check if the user's email is authorized
      if (!this.isAuthorized(result.user.email)) {
        await signOut(this.auth);
        throw new Error('This account is not authorized to access the admin panel');
      }

      console.log('Signed in successfully:', result.user.email);
      return Promise.resolve();
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAuthorized(email: string | null): boolean {
    if (!email) return false;
    return environment.allowedAdminEmails.includes(email.toLowerCase());
  }
}
