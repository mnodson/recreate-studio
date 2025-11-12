import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { Environment } from '../../environments/environment.d';

export interface UploadResult {
  filename: string;
  path: string;
  url: string;
  sha: string;
}

/**
 * Service for uploading images to GitHub repository
 * Uploads to recreate-studio-images repo with path: clients/<client-name>/
 */
@Injectable({
  providedIn: 'root'
})
export class GithubUploadService {
  private http = inject(HttpClient);
  private readonly API_BASE = 'https://api.github.com';

  // GitHub config from environment
  private readonly owner = (environment as Environment).github?.owner || 'mnodson';
  private readonly repo = (environment as Environment).github?.repo || 'recreate-studio-images';
  private readonly branch = (environment as Environment).github?.branch || 'main';
  private readonly token = (environment as Environment).github?.token || '';

  /**
   * Upload multiple images to GitHub repository as a single commit
   * @param files - Array of File objects to upload
   * @param clientName - Client name for folder path (will be sanitized)
   * @returns Observable of upload results
   */
  uploadImages(files: File[], clientName: string): Observable<UploadResult[]> {
    if (!this.token) {
      throw new Error('GitHub token not configured');
    }

    const sanitizedClientName = this.sanitizeClientName(clientName);
    const basePath = `clients/${sanitizedClientName}`;

    // Use Git Data API to batch upload all files in a single commit
    return this.batchUploadFiles(files, basePath);
  }

  /**
   * Batch upload files using Git Data API (single commit for all files)
   */
  private batchUploadFiles(files: File[], basePath: string): Observable<UploadResult[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    });

    // Step 1: Get the reference (HEAD of branch)
    return this.http.get<any>(
      `${this.API_BASE}/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`,
      { headers }
    ).pipe(
      switchMap(ref => {
        const baseCommitSha = ref.object.sha;

        // Step 2: Get the base commit
        return this.http.get<any>(
          `${this.API_BASE}/repos/${this.owner}/${this.repo}/git/commits/${baseCommitSha}`,
          { headers }
        ).pipe(
          map(commit => ({ baseCommitSha, baseTreeSha: commit.tree.sha }))
        );
      }),
      switchMap(({ baseCommitSha, baseTreeSha }) => {
        // Step 3: Create blobs for all files in parallel
        const blobCreations = files.map((file, index) =>
          from(this.fileToBase64(file)).pipe(
            switchMap(base64Content => {
              const filename = this.generateUniqueFilename(file, index);
              return this.http.post<any>(
                `${this.API_BASE}/repos/${this.owner}/${this.repo}/git/blobs`,
                {
                  content: base64Content,
                  encoding: 'base64'
                },
                { headers }
              ).pipe(
                map(blob => ({
                  path: `${basePath}/${filename}`,
                  mode: '100644',
                  type: 'blob',
                  sha: blob.sha,
                  filename
                }))
              );
            })
          )
        );

        return forkJoin(blobCreations).pipe(
          map(blobs => ({ baseCommitSha, baseTreeSha, blobs }))
        );
      }),
      switchMap(({ baseCommitSha, baseTreeSha, blobs }) => {
        // Step 4: Create a new tree with all the blobs
        return this.http.post<any>(
          `${this.API_BASE}/repos/${this.owner}/${this.repo}/git/trees`,
          {
            base_tree: baseTreeSha,
            tree: blobs.map(blob => ({
              path: blob.path,
              mode: blob.mode,
              type: blob.type,
              sha: blob.sha
            }))
          },
          { headers }
        ).pipe(
          map(tree => ({ baseCommitSha, treeSha: tree.sha, blobs }))
        );
      }),
      switchMap(({ baseCommitSha, treeSha, blobs }) => {
        // Step 5: Create a commit
        const fileCount = blobs.length;
        return this.http.post<any>(
          `${this.API_BASE}/repos/${this.owner}/${this.repo}/git/commits`,
          {
            message: `Upload ${fileCount} image${fileCount > 1 ? 's' : ''} for client`,
            tree: treeSha,
            parents: [baseCommitSha]
          },
          { headers }
        ).pipe(
          map(commit => ({ commitSha: commit.sha, blobs }))
        );
      }),
      switchMap(({ commitSha, blobs }) => {
        // Step 6: Update the reference
        return this.http.patch<any>(
          `${this.API_BASE}/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`,
          { sha: commitSha },
          { headers }
        ).pipe(
          map(() => blobs)
        );
      }),
      map(blobs => {
        // Step 7: Format results
        return blobs.map(blob => ({
          filename: blob.filename,
          path: blob.path,
          url: `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${blob.path}`,
          sha: blob.sha
        }));
      }),
      catchError(error => {
        console.error('Batch upload error:', error);
        throw new Error(`Failed to upload images: ${error.message || 'Unknown error'}`);
      })
    );
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate unique filename with timestamp, index, and random component
   */
  private generateUniqueFilename(file: File, index: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    return `${baseName}-${timestamp}-${index}-${random}.${extension}`;
  }

  /**
   * Sanitize client name for use in folder path
   */
  private sanitizeClientName(clientName: string): string {
    return clientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed.`
      };
    }

    // Check file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`
      };
    }

    return { valid: true };
  }

  /**
   * Get the relative path for an uploaded image (for use in gallery)
   */
  getRelativeImagePath(uploadResult: UploadResult): string {
    return uploadResult.path;
  }
}