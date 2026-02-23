import { describe, it, expect } from 'vitest';
import { parseStoragePath } from '@lib/products';

describe('parseStoragePath', () => {
  it('extracts filename from a valid Supabase storage URL', () => {
    const url =
      'https://test.supabase.co/storage/v1/object/public/product-images/my-photo.jpg';
    expect(parseStoragePath(url)).toBe('my-photo.jpg');
  });

  it('extracts nested path from storage URL', () => {
    const url =
      'https://test.supabase.co/storage/v1/object/public/product-images/folder/my-photo.webp';
    expect(parseStoragePath(url)).toBe('folder/my-photo.webp');
  });

  it('returns null for a non-storage URL', () => {
    const url = 'https://example.com/images/photo.jpg';
    expect(parseStoragePath(url)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseStoragePath('')).toBeNull();
  });

  it('returns null for a URL with trailing slash and no path after product-images/', () => {
    const url = 'https://test.supabase.co/storage/v1/object/public/product-images/';
    expect(parseStoragePath(url)).toBeNull();
  });

  it('returns null for an arbitrary invalid string', () => {
    expect(parseStoragePath('not-a-url')).toBeNull();
  });
});
