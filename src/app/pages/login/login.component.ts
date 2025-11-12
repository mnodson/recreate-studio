import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <img src="images/Hero_Logo_White.png" alt="RecreateStudio" class="logo">
        <h1>Admin Login</h1>
        <p class="subtitle">Sign in to manage your galleries</p>

        @if (error()) {
          <div class="error-message">
            {{ error() }}
          </div>
        }

        <button
          class="btn-google"
          (click)="signInWithGoogle()"
          [disabled]="loading()">
          @if (loading()) {
            <div class="spinner"></div>
            <span>Signing in...</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span>Sign in with Google</span>
          }
        </button>

        <p class="disclaimer">
          Only authorized users can access the admin panel
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%);
      padding: 2rem;
    }

    .login-card {
      background: rgba(30, 20, 40, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(192, 132, 252, 0.2);
      padding: 3rem;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .logo {
      width: 100%;
      max-width: 250px;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 300;
      margin: 0 0 0.5rem 0;
      color: #e6d7ff;
      background: linear-gradient(135deg, #e6d7ff, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #b8a9d1;
      margin: 0 0 2rem 0;
      font-size: 1rem;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .btn-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: white;
      color: #333;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;

      svg {
        flex-shrink: 0;
      }

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .disclaimer {
      color: #8e7fa5;
      font-size: 0.85rem;
      margin: 0;
    }
  `]
})
export class LoginComponent {
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // If already authenticated, redirect to admin
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/gallery-admin']);
    }
  }

  async signInWithGoogle() {
    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.signInWithGoogle();
      // Redirect to admin page
      this.router.navigate(['/gallery-admin']);
    } catch (error: any) {
      this.error.set(error.message || 'Failed to sign in. Please try again.');
      this.loading.set(false);
    }
  }
}
