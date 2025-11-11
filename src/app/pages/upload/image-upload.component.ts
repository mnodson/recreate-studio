import { Component } from '@angular/core';
import { GithubUploadService } from '../../services/github-upload.service';

@Component({
  selector: 'app-image-upload.component',
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  selectedCategory = 'landscapes';
  imagePreviews: any[] = [];
  uploading = false;

  constructor(private githubUpload: GithubUploadService) { }

  async uploadAll() {
    this.uploading = true;
    const files = this.imagePreviews.map(p => p.file);

    await this.githubUpload.uploadImages(files, this.selectedCategory);

    // Clear previews after successful upload
    this.imagePreviews = [];
    this.uploading = false;

    // Show success message
    alert('Images uploaded successfully! They will be available in a few moments.');
  }
}
