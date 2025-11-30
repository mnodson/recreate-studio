import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NavigationComponent } from './components/navigation.component';
import { PromotionalBannerComponent } from './components/promotional-banner.component';
import { shutterAnimation } from './route-animations';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, PromotionalBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [shutterAnimation]
})
export class App {
  private router = inject(Router);
  shutterActive = signal(false);
  showNavigation = signal(true);

  constructor() {
    // Listen to navigation events
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.shutterActive.set(true);
      } else {
        // Delay removing the active state to let animation complete
        setTimeout(() => this.shutterActive.set(false), 600);
      }

      // Hide navigation and shutter animation for shared gallery route
      if (event instanceof NavigationEnd) {
        const isSharedGallery = event.url.includes('/gallery/shared/');
        this.showNavigation.set(!isSharedGallery);

        // Don't show shutter animation for shared galleries
        if (isSharedGallery) {
          this.shutterActive.set(false);
        }
      }
    });
  }
}
