import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-subnav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="admin-subnav">
      <div class="admin-subnav-container">
        <a routerLink="/analytics-dashboard" routerLinkActive="active" class="subnav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          <span>Analytics</span>
        </a>
        <a routerLink="/gallery-admin" routerLinkActive="active" class="subnav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Galleries</span>
        </a>
        <a routerLink="/portfolio-admin" routerLinkActive="active" class="subnav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Portfolio</span>
        </a>
        <a routerLink="/message-center" routerLinkActive="active" class="subnav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Messages</span>
        </a>
        <a routerLink="/promotion-admin" routerLinkActive="active" class="subnav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <span>Promotions</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .admin-subnav {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: rgba(26, 15, 46, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(192, 132, 252, 0.2);
      z-index: 900;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .admin-subnav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      justify-content: center;
      -webkit-overflow-scrolling: touch;
    }

    .subnav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      color: #b8a9d1;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
      position: relative;

      svg {
        flex-shrink: 0;
      }

      &:hover {
        color: #e6d7ff;
        background: rgba(192, 132, 252, 0.1);
      }

      &.active {
        color: #c084fc;
        border-bottom-color: #c084fc;
        background: rgba(192, 132, 252, 0.05);

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c084fc, #8b5cf6);
          border-radius: 2px 2px 0 0;
        }
      }
    }

    @media (max-width: 768px) {
      .admin-subnav {
        top: 70px;
      }

      .admin-subnav-container {
        padding: 0 1rem;
        gap: 0.25rem;
      }

      .subnav-item {
        padding: 0.875rem 1rem;
        font-size: 0.875rem;

        span {
          display: none;
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  `]
})
export class AdminSubnavComponent {
  private router = inject(Router);
}
