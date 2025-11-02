import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should construct proper image URLs', () => {
    const url = service.getImageUrl('portraits/portrait-1/hero.jpg');
    expect(url).toContain('portraits/portrait-1/hero.jpg');
  });

  it('should handle leading slashes in paths', () => {
    const url1 = service.getImageUrl('/portraits/test.jpg');
    const url2 = service.getImageUrl('portraits/test.jpg');
    expect(url1).toBe(url2);
  });

  it('should generate thumbnail URLs', () => {
    const url = service.getThumbnailUrl('portraits/portrait-1/hero.jpg');
    expect(url).toContain('thumbnails/portraits/portrait-1/hero.jpg');
  });

  it('should generate responsive srcset strings', () => {
    const srcset = service.getResponsiveImageSrcset('portraits/portrait-1/hero');
    expect(srcset).toContain('400w');
    expect(srcset).toContain('800w');
    expect(srcset).toContain('1200w');
    expect(srcset).toContain('1920w');
  });

  it('should construct gallery image URLs', () => {
    const url = service.getGalleryImageUrl('portraits', 'summer-2024', 'studio.jpg');
    expect(url).toContain('portraits/summer-2024/studio.jpg');
  });
});
