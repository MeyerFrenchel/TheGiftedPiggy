import { describe, it, expect } from 'vitest';
import { parseProductFormData } from '@lib/products';
import { makeFormData, OMIT } from '../helpers/fixtures';

describe('parseProductFormData', () => {
  describe('required fields', () => {
    it('extracts slug and name', () => {
      const form = makeFormData({ slug: 'my-slug', name: 'My Name' });
      const result = parseProductFormData(form);
      expect(result.slug).toBe('my-slug');
      expect(result.name).toBe('My Name');
    });

    it('defaults slug to empty string when absent', () => {
      const form = makeFormData({ slug: OMIT });
      const result = parseProductFormData(form);
      expect(result.slug).toBe('');
    });

    it('defaults name to empty string when absent', () => {
      const form = makeFormData({ name: OMIT });
      const result = parseProductFormData(form);
      expect(result.name).toBe('');
    });
  });

  describe('optional string fields', () => {
    it('returns null for name_en when empty string', () => {
      const form = makeFormData({ name_en: '' });
      expect(parseProductFormData(form).name_en).toBeNull();
    });

    it('returns null for description when empty string', () => {
      const form = makeFormData({ description: '' });
      expect(parseProductFormData(form).description).toBeNull();
    });

    it('returns null for description_en when empty string', () => {
      const form = makeFormData({ description_en: '' });
      expect(parseProductFormData(form).description_en).toBeNull();
    });

    it('returns null for image_url when empty string', () => {
      const form = makeFormData({ image_url: '' });
      expect(parseProductFormData(form).image_url).toBeNull();
    });

    it('returns null for image_alt when empty string', () => {
      const form = makeFormData({ image_alt: '' });
      expect(parseProductFormData(form).image_alt).toBeNull();
    });

    it('returns null for category when empty string', () => {
      const form = makeFormData({ category: '' });
      expect(parseProductFormData(form).category).toBeNull();
    });

    it('returns value when optional fields are non-empty', () => {
      const form = makeFormData({ name_en: 'Name EN', category: 'gifts' });
      const result = parseProductFormData(form);
      expect(result.name_en).toBe('Name EN');
      expect(result.category).toBe('gifts');
    });
  });

  describe('price', () => {
    it('parses integer price', () => {
      const form = makeFormData({ price: '99' });
      expect(parseProductFormData(form).price).toBe(99);
    });

    it('parses decimal price', () => {
      const form = makeFormData({ price: '12.50' });
      expect(parseProductFormData(form).price).toBe(12.5);
    });

    it('defaults to 0 when price is absent', () => {
      const form = makeFormData({ price: OMIT });
      expect(parseProductFormData(form).price).toBe(0);
    });
  });

  describe('currency', () => {
    it('extracts currency value', () => {
      const form = makeFormData({ currency: 'EUR' });
      expect(parseProductFormData(form).currency).toBe('EUR');
    });

    it('defaults to RON when absent', () => {
      const form = makeFormData({ currency: OMIT });
      expect(parseProductFormData(form).currency).toBe('RON');
    });

    it('defaults to RON when empty string', () => {
      const form = makeFormData({ currency: '' });
      expect(parseProductFormData(form).currency).toBe('RON');
    });
  });

  describe('tags', () => {
    it('splits by comma', () => {
      const form = makeFormData({ tags: 'a,b,c' });
      expect(parseProductFormData(form).tags).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace around tags', () => {
      const form = makeFormData({ tags: ' tag1 , tag2 , tag3 ' });
      expect(parseProductFormData(form).tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('filters empty tags', () => {
      const form = makeFormData({ tags: 'a,,b,' });
      expect(parseProductFormData(form).tags).toEqual(['a', 'b']);
    });

    it('returns empty array when tags absent', () => {
      const form = makeFormData({ tags: OMIT });
      expect(parseProductFormData(form).tags).toEqual([]);
    });

    it('returns empty array when tags is empty string', () => {
      const form = makeFormData({ tags: '' });
      expect(parseProductFormData(form).tags).toEqual([]);
    });

    it('handles single-item tag', () => {
      const form = makeFormData({ tags: 'gift' });
      expect(parseProductFormData(form).tags).toEqual(['gift']);
    });
  });

  describe('booleans', () => {
    it('featured is true when value is "true"', () => {
      const form = makeFormData({ featured: 'true' });
      expect(parseProductFormData(form).featured).toBe(true);
    });

    it('featured is false when absent', () => {
      const form = makeFormData({ featured: OMIT });
      expect(parseProductFormData(form).featured).toBe(false);
    });

    it('featured is false when value is "false"', () => {
      const form = makeFormData({ featured: 'false' });
      expect(parseProductFormData(form).featured).toBe(false);
    });

    it('in_stock is true when value is "true"', () => {
      const form = makeFormData({ in_stock: 'true' });
      expect(parseProductFormData(form).in_stock).toBe(true);
    });

    it('in_stock is false when absent', () => {
      const form = makeFormData({ in_stock: OMIT });
      expect(parseProductFormData(form).in_stock).toBe(false);
    });

    it('in_stock is false when value is "false"', () => {
      const form = makeFormData({ in_stock: 'false' });
      expect(parseProductFormData(form).in_stock).toBe(false);
    });
  });
});
