import { Component, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardAnalyticsService, DateRange, DashboardMetrics, MetricCard } from '../../services/dashboard-analytics.service';
import { Subscription } from 'rxjs';
import { AdminSubnavComponent } from '../../components/admin-subnav.component';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, AdminSubnavComponent],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss'
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private analyticsService = inject(DashboardAnalyticsService);
  private router = inject(Router);

  @ViewChild('inquiriesChart', { static: false }) inquiriesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inquiryTypeChart', { static: false }) inquiryTypeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('packageInterestChart', { static: false }) packageInterestChartRef!: ElementRef<HTMLCanvasElement>;

  private inquiriesChart?: Chart;
  private inquiryTypeChart?: Chart;
  private packageInterestChart?: Chart;
  private metricsSubscription?: Subscription;

  selectedDateRange = signal<'week' | 'month' | 'quarter'>('month');
  dateRange = computed(() => {
    return this.analyticsService.getDateRange(this.selectedDateRange());
  });

  metrics = signal<DashboardMetrics | null>(null);
  metricCards = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    return this.analyticsService.getMetricCards(m);
  });

  loading = signal(true);
  selectedTab = signal<'overview' | 'inquiries' | 'galleries' | 'promotions'>('overview');

  ngOnInit(): void {
    this.loadMetrics();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after metrics are loaded
  }

  ngOnDestroy(): void {
    this.metricsSubscription?.unsubscribe();
    this.destroyCharts();
  }

  loadMetrics(): void {
    this.loading.set(true);
    this.metricsSubscription?.unsubscribe();

    this.metricsSubscription = this.analyticsService
      .getDashboardMetrics(this.dateRange())
      .subscribe({
        next: (metrics) => {
          this.metrics.set(metrics);
          this.loading.set(false);
          // Wait for next tick to ensure canvas elements are rendered
          setTimeout(() => this.initializeCharts(), 0);
        },
        error: (error) => {
          console.error('Error loading metrics:', error);
          this.loading.set(false);
        }
      });
  }

  setDateRange(range: 'week' | 'month' | 'quarter'): void {
    this.selectedDateRange.set(range);
    this.loadMetrics();
  }

  setTab(tab: 'overview' | 'inquiries' | 'galleries' | 'promotions'): void {
    this.selectedTab.set(tab);
    // Reinitialize charts after tab change to ensure they render
    // Increased timeout to ensure ViewChild references are updated
    setTimeout(() => this.initializeCharts(), 250);
  }

  private initializeCharts(): void {
    this.destroyCharts();
    const m = this.metrics();
    if (!m) return;

    // Only create charts that are currently visible based on selected tab
    const currentTab = this.selectedTab();

    if (currentTab === 'overview' || currentTab === 'inquiries') {
      this.createInquiriesOverTimeChart(m);
    }

    if (currentTab === 'overview' || currentTab === 'inquiries') {
      this.createInquiryTypeChart(m);
    }

    if (currentTab === 'inquiries') {
      this.createPackageInterestChart(m);
    }
  }

  private createInquiriesOverTimeChart(metrics: DashboardMetrics): void {
    const canvas = this.inquiriesChartRef?.nativeElement;
    if (!canvas || !this.isElementVisible(canvas)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: metrics.inquiriesOverTime.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Inquiries',
          data: metrics.inquiriesOverTime.map(d => d.count),
          borderColor: '#c084fc',
          backgroundColor: 'rgba(192, 132, 252, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#c084fc',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 15, 46, 0.95)',
            titleColor: '#e6d7ff',
            bodyColor: '#e6d7ff',
            borderColor: '#c084fc',
            borderWidth: 1,
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#b8a9d1',
              stepSize: 1
            },
            grid: {
              color: 'rgba(192, 132, 252, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#b8a9d1'
            },
            grid: {
              color: 'rgba(192, 132, 252, 0.1)'
            }
          }
        }
      }
    };

    this.inquiriesChart = new Chart(ctx, config);
  }

  private createInquiryTypeChart(metrics: DashboardMetrics): void {
    const canvas = this.inquiryTypeChartRef?.nativeElement;
    if (!canvas || !this.isElementVisible(canvas)) return;

    if (!metrics.inquiriesByType || metrics.inquiriesByType.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = [
      '#c084fc',
      '#8b5cf6',
      '#7c3aed',
      '#6d28d9',
      '#5b21b6'
    ];

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: metrics.inquiriesByType.map(i => i.type),
        datasets: [{
          data: metrics.inquiriesByType.map(i => i.count),
          backgroundColor: colors.slice(0, metrics.inquiriesByType.length),
          borderColor: '#1a0f2e',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e6d7ff',
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 15, 46, 0.95)',
            titleColor: '#e6d7ff',
            bodyColor: '#e6d7ff',
            borderColor: '#c084fc',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = metrics.totalInquiries;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.inquiryTypeChart = new Chart(ctx, config);
  }

  private createPackageInterestChart(metrics: DashboardMetrics): void {
    const canvas = this.packageInterestChartRef?.nativeElement;
    if (!canvas || !this.isElementVisible(canvas) || metrics.packageInterest.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: metrics.packageInterest.map(p => p.packageName),
        datasets: [{
          label: 'Inquiries',
          data: metrics.packageInterest.map(p => p.count),
          backgroundColor: '#c084fc',
          borderColor: '#8b5cf6',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 15, 46, 0.95)',
            titleColor: '#e6d7ff',
            bodyColor: '#e6d7ff',
            borderColor: '#c084fc',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#b8a9d1',
              stepSize: 1
            },
            grid: {
              color: 'rgba(192, 132, 252, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#b8a9d1'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.packageInterestChart = new Chart(ctx, config);
  }

  private destroyCharts(): void {
    if (this.inquiriesChart) {
      this.inquiriesChart.destroy();
      this.inquiriesChart = undefined;
    }
    if (this.inquiryTypeChart) {
      this.inquiryTypeChart.destroy();
      this.inquiryTypeChart = undefined;
    }
    if (this.packageInterestChart) {
      this.packageInterestChart.destroy();
      this.packageInterestChart = undefined;
    }
  }

  navigateToMessageCenter(): void {
    this.router.navigate(['/message-center']);
  }

  navigateToGalleryAdmin(): void {
    this.router.navigate(['/gallery-admin']);
  }

  navigateToPromotionAdmin(): void {
    this.router.navigate(['/promotion-admin']);
  }

  getTrendIcon(trend?: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  }

  getTrendClass(trend?: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-neutral';
    }
  }

  formatChange(change: number): string {
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  }

  toDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }
    return new Date(value);
  }

  private isElementVisible(element: HTMLElement): boolean {
    return element.offsetParent !== null;
  }
}
