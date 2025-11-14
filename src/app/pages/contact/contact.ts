import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  submitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal('');

  inquiryType = signal<string>('');
  packageName = signal<string>('');
  packageCategory = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private analytics: AnalyticsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.analytics.trackPageView('contact');

    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.inquiryType.set(params['type'] || 'general');
      this.packageName.set(params['package'] || '');
      this.packageCategory.set(params['category'] || '');
    });

    // Initialize form
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s\-\(\)]+$/)]],
      inquiryType: [this.inquiryType(), Validators.required],
      packageInterest: [this.packageName()],
      message: ['', [Validators.required, Validators.minLength(10)]],
      preferredContact: ['email'],
      sessionDate: ['']
    });

    // Update form when query params change
    if (this.packageName()) {
      this.contactForm.patchValue({
        packageInterest: this.packageName(),
        inquiryType: this.inquiryType()
      });
    }
  }

  getInquiryTypeLabel(): string {
    const type = this.inquiryType();
    switch(type) {
      case 'consultation': return 'Schedule a Consultation';
      case 'quote': return 'Request a Quote';
      case 'package': return `Inquire About ${this.packageName()}`;
      case 'booking': return 'Book a Session';
      default: return 'General Inquiry';
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    // Track form submission
    this.analytics.trackCustomEvent('contact_form_submit', {
      inquiry_type: this.contactForm.value.inquiryType,
      package_interest: this.contactForm.value.packageInterest
    });

    // TODO: Implement email sending functionality
    // For now, simulate submission
    setTimeout(() => {
      console.log('Form data:', this.contactForm.value);

      this.http.post('https://www.form-to-email.com/api/s/Od52yxz5BRTI', this.contactForm.value, {
        headers: {
           "Content-Type": "application/json"
        }
      })


      this.submitting.set(false);
      this.submitSuccess.set(true);

      // Reset form after success
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }, 1500);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    if (field.errors['pattern']) return 'Please enter a valid phone number';

    return '';
  }
}
