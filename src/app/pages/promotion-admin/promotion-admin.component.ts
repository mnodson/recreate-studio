import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PromotionService } from '../../services/promotion.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { Promotion } from '../../models/promotion.model';

@Component({
  selector: 'app-promotion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotion-admin.component.html',
  styleUrl: './promotion-admin.component.scss'
})
export class PromotionAdminComponent implements OnInit {
  private promotionService = inject(PromotionService);
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  promotions = signal<Promotion[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  editingPromotion = signal<Promotion | null>(null);

  // Form model
  formData = signal({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    isActive: true,
    isSiteWide: true,
    targetPackageIds: [] as number[],
    startDate: this.formatDateForInput(new Date()),
    endDate: this.formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 1 week from now
    showBanner: true,
    bannerText: '',
    bannerBackgroundColor: '#8b5cf6',
    bannerTextColor: '#ffffff'
  });

  // Available packages for targeting
  availablePackages = [
    { id: 1, name: 'Mini Session' },
    { id: 2, name: 'Seniors' },
    { id: 3, name: 'Essential' },
    { id: 4, name: 'Premium' },
    { id: 5, name: 'Commercial' },
    { id: 6, name: 'Event Coverage' }
  ];

  ngOnInit() {
    this.analyticsService.trackCustomEvent('admin_page_view', { page: 'promotion_admin' });
    this.loadPromotions();
  }

  loadPromotions() {
    this.isLoading.set(true);
    this.promotionService.getAllPromotions().subscribe({
      next: (promotions) => {
        this.promotions.set(promotions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.showError('Failed to load promotions');
        this.isLoading.set(false);
      }
    });
  }

  async createPromotion() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    try {
      const currentUser = this.authService.currentUser();
      const userEmail = currentUser?.email || 'unknown';

      await this.promotionService.createPromotion({
        ...this.formData(),
        startDate: new Date(this.formData().startDate),
        endDate: new Date(this.formData().endDate),
        createdBy: userEmail
      });

      this.showSuccess('Promotion created successfully!');
      this.analyticsService.trackCustomEvent('promotion_created', {
        promotion_name: this.formData().name,
        discount_type: this.formData().discountType
      });
      this.resetForm();
      this.loadPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      this.showError('Failed to create promotion');
    } finally {
      this.isLoading.set(false);
    }
  }

  async updatePromotion() {
    if (!this.editingPromotion() || !this.validateForm()) {
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    try {
      await this.promotionService.updatePromotion(this.editingPromotion()!.id!, {
        ...this.formData(),
        startDate: new Date(this.formData().startDate),
        endDate: new Date(this.formData().endDate)
      });

      this.showSuccess('Promotion updated successfully!');
      this.analyticsService.trackCustomEvent('promotion_updated', {
        promotion_id: this.editingPromotion()!.id
      });
      this.resetForm();
      this.loadPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      this.showError('Failed to update promotion');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deletePromotion(id: string) {
    if (!confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    try {
      await this.promotionService.deletePromotion(id);
      this.showSuccess('Promotion deleted successfully!');
      this.analyticsService.trackCustomEvent('promotion_deleted', { promotion_id: id });
      this.loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      this.showError('Failed to delete promotion');
    } finally {
      this.isLoading.set(false);
    }
  }

  editPromotion(promotion: Promotion) {
    this.editingPromotion.set(promotion);
    this.formData.set({
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      isActive: promotion.isActive,
      isSiteWide: promotion.isSiteWide,
      targetPackageIds: promotion.targetPackageIds || [],
      startDate: this.formatDateForInput(new Date(promotion.startDate)),
      endDate: this.formatDateForInput(new Date(promotion.endDate)),
      showBanner: promotion.showBanner,
      bannerText: promotion.bannerText,
      bannerBackgroundColor: promotion.bannerBackgroundColor || '#8b5cf6',
      bannerTextColor: promotion.bannerTextColor || '#ffffff'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.editingPromotion.set(null);
    this.formData.set({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      isActive: true,
      isSiteWide: true,
      targetPackageIds: [],
      startDate: this.formatDateForInput(new Date()),
      endDate: this.formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      showBanner: true,
      bannerText: '',
      bannerBackgroundColor: '#8b5cf6',
      bannerTextColor: '#ffffff'
    });
  }

  validateForm(): boolean {
    const data = this.formData();

    if (!data.name.trim()) {
      this.showError('Promotion name is required');
      return false;
    }

    if (!data.description.trim()) {
      this.showError('Description is required');
      return false;
    }

    if (data.discountValue <= 0) {
      this.showError('Discount value must be greater than 0');
      return false;
    }

    if (data.discountType === 'percentage' && data.discountValue > 100) {
      this.showError('Percentage discount cannot exceed 100%');
      return false;
    }

    if (!data.isSiteWide && data.targetPackageIds.length === 0) {
      this.showError('Please select at least one package or enable site-wide promotion');
      return false;
    }

    if (new Date(data.endDate) <= new Date(data.startDate)) {
      this.showError('End date must be after start date');
      return false;
    }

    if (data.showBanner && !data.bannerText.trim()) {
      this.showError('Banner text is required when banner is enabled');
      return false;
    }

    return true;
  }

  togglePackageSelection(packageId: number) {
    const currentIds = this.formData().targetPackageIds;
    const updatedIds = currentIds.includes(packageId)
      ? currentIds.filter(id => id !== packageId)
      : [...currentIds, packageId];

    this.formData.update(data => ({ ...data, targetPackageIds: updatedIds }));
  }

  isPackageSelected(packageId: number): boolean {
    return this.formData().targetPackageIds.includes(packageId);
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isPromotionActive(promotion: Promotion): boolean {
    const now = new Date();
    return (
      promotion.isActive &&
      new Date(promotion.startDate) <= now &&
      new Date(promotion.endDate) >= now
    );
  }

  showError(message: string) {
    this.errorMessage.set(message);
    this.successMessage.set(null);
    setTimeout(() => this.errorMessage.set(null), 5000);
  }

  showSuccess(message: string) {
    this.successMessage.set(message);
    this.errorMessage.set(null);
    setTimeout(() => this.successMessage.set(null), 5000);
  }

  clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  updateFormField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  isPromotionScheduled(promotion: Promotion): boolean {
    return new Date(promotion.startDate) > new Date();
  }

  navigateToGalleryAdmin(): void {
    this.router.navigate(['/gallery-admin']);
  }

  navigateToPortfolioAdmin(): void {
    this.router.navigate(['/portfolio-admin']);
  }

  navigateToMessageCenter(): void {
    this.router.navigate(['/message-center']);
  }
}

