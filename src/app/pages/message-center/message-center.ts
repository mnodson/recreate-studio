import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactMessageService, ContactMessage } from '../../services/contact-message.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { AdminSubnavComponent } from '../../components/admin-subnav.component';

@Component({
  selector: 'app-message-center',
  standalone: true,
  imports: [CommonModule, AdminSubnavComponent],
  templateUrl: './message-center.html',
  styleUrls: ['./message-center.scss']
})
export class MessageCenterComponent implements OnInit {
  messages = signal<ContactMessage[]>([]);
  filteredMessages = signal<ContactMessage[]>([]);
  loading = signal(true);
  selectedFilter = signal<'all' | 'new' | 'read' | 'archived'>('all');
  selectedMessage = signal<ContactMessage | null>(null);
  showMessageDetail = signal(false);

  constructor(
    private contactMessageService: ContactMessageService,
    private analytics: AnalyticsService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.analytics.trackPageView('message_center');
    await this.loadMessages();
  }

  async loadMessages() {
    this.loading.set(true);
    try {
      const messages = await this.contactMessageService.getAllMessages();
      this.messages.set(messages);
      this.applyFilter();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      this.loading.set(false);
    }
  }

  filterMessages(status: 'all' | 'new' | 'read' | 'archived') {
    this.selectedFilter.set(status);
    this.applyFilter();
  }

  applyFilter() {
    const filter = this.selectedFilter();
    const allMessages = this.messages();

    if (filter === 'all') {
      this.filteredMessages.set(allMessages);
    } else {
      this.filteredMessages.set(allMessages.filter(msg => msg.status === filter));
    }
  }

  async viewMessage(message: ContactMessage) {
    this.selectedMessage.set(message);
    this.showMessageDetail.set(true);

    // Mark as read if it's new
    if (message.status === 'new' && message.id) {
      await this.contactMessageService.markAsRead(message.id);
      await this.loadMessages(); // Refresh to update counts
    }
  }

  closeMessageDetail() {
    this.showMessageDetail.set(false);
    this.selectedMessage.set(null);
  }

  async archiveMessage(messageId: string | undefined) {
    if (!messageId) return;

    try {
      await this.contactMessageService.archiveMessage(messageId);
      this.closeMessageDetail();
      await this.loadMessages();
      this.analytics.trackCustomEvent('message_archived', { messageId });
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  }

  async deleteMessage(messageId: string | undefined) {
    if (!messageId) return;

    if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        await this.contactMessageService.deleteMessage(messageId);
        this.closeMessageDetail();
        await this.loadMessages();
        this.analytics.trackCustomEvent('message_deleted', { messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  }

  getMessageCount(status: 'all' | 'new' | 'read' | 'archived'): number {
    const allMessages = this.messages();
    if (status === 'all') {
      return allMessages.length;
    }
    return allMessages.filter(msg => msg.status === status).length;
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInquiryTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'consultation': 'Consultation',
      'quote': 'Quote Request',
      'package': 'Package Inquiry',
      'booking': 'Session Booking',
      'general': 'General Inquiry'
    };
    return labels[type] || type;
  }

  navigateToPortfolioAdmin(): void {
    this.router.navigate(['/portfolio-admin']);
  }

  navigateToGalleryAdmin(): void {
    this.router.navigate(['/gallery-admin']);
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
