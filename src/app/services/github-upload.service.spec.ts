import { TestBed } from '@angular/core/testing';

import { GithubUploadService } from './github-upload.service';

describe('GithubUploadService', () => {
  let service: GithubUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GithubUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
