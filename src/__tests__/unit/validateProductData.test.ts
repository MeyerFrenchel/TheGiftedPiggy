import { describe, it, expect } from 'vitest';
import { validateProductData } from '@lib/products';
import type { ParsedProductData } from '@lib/products';

function valid(overrides: Partial<ParsedProductData> = {}): ParsedProductData {
  return {
    slug: 'my-product',
    name: 'My Product',
    name_en: null,
    description: null,
    description_en: null,
    price: 99,
    currency: 'RON',
    image_url: null,
    image_alt: null,
    category: null,
    tags: [],
    featured: false,
    in_stock: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// slug
// ---------------------------------------------------------------------------
describe('validateProductData — slug', () => {
  it('returns no errors for a valid slug', () => {
    expect(validateProductData(valid({ slug: 'my-product-123' }))).toHaveLength(0);
  });

  it('requires slug', () => {
    const errors = validateProductData(valid({ slug: '' }));
    expect(errors.some((e) => e.field === 'slug')).toBe(true);
  });

  it('rejects slugs longer than 100 characters', () => {
    const errors = validateProductData(valid({ slug: 'a'.repeat(101) }));
    expect(errors.some((e) => e.field === 'slug')).toBe(true);
  });

  it('accepts slugs exactly 100 characters long', () => {
    const errors = validateProductData(valid({ slug: 'a'.repeat(100) }));
    expect(errors.some((e) => e.field === 'slug')).toBe(false);
  });

  it('rejects slugs with uppercase letters', () => {
    const errors = validateProductData(valid({ slug: 'My-Product' }));
    expect(errors.some((e) => e.field === 'slug')).toBe(true);
  });

  it('rejects slugs with spaces', () => {
    const errors = validateProductData(valid({ slug: 'my product' }));
    expect(errors.some((e) => e.field === 'slug')).toBe(true);
  });

  it('rejects slugs with special characters', () => {
    const errors = validateProductData(valid({ slug: 'my_product!' }));
    expect(errors.some((e) => e.field === 'slug')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// name
// ---------------------------------------------------------------------------
describe('validateProductData — name', () => {
  it('requires name', () => {
    const errors = validateProductData(valid({ name: '' }));
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('rejects names longer than 255 characters', () => {
    const errors = validateProductData(valid({ name: 'a'.repeat(256) }));
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('accepts names exactly 255 characters long', () => {
    const errors = validateProductData(valid({ name: 'a'.repeat(255) }));
    expect(errors.some((e) => e.field === 'name')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// name_en (optional)
// ---------------------------------------------------------------------------
describe('validateProductData — name_en', () => {
  it('allows null name_en', () => {
    expect(validateProductData(valid({ name_en: null }))).toHaveLength(0);
  });

  it('rejects name_en longer than 255 characters', () => {
    const errors = validateProductData(valid({ name_en: 'a'.repeat(256) }));
    expect(errors.some((e) => e.field === 'name_en')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// description (optional)
// ---------------------------------------------------------------------------
describe('validateProductData — description', () => {
  it('allows null description', () => {
    expect(validateProductData(valid({ description: null }))).toHaveLength(0);
  });

  it('rejects description longer than 2000 characters', () => {
    const errors = validateProductData(valid({ description: 'a'.repeat(2001) }));
    expect(errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('accepts description exactly 2000 characters', () => {
    const errors = validateProductData(valid({ description: 'a'.repeat(2000) }));
    expect(errors.some((e) => e.field === 'description')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// description_en (optional)
// ---------------------------------------------------------------------------
describe('validateProductData — description_en', () => {
  it('allows null description_en', () => {
    expect(validateProductData(valid({ description_en: null }))).toHaveLength(0);
  });

  it('rejects description_en longer than 2000 characters', () => {
    const errors = validateProductData(valid({ description_en: 'a'.repeat(2001) }));
    expect(errors.some((e) => e.field === 'description_en')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// price
// ---------------------------------------------------------------------------
describe('validateProductData — price', () => {
  it('accepts a valid price', () => {
    expect(validateProductData(valid({ price: 49.99 }))).toHaveLength(0);
  });

  it('accepts price of 0', () => {
    expect(validateProductData(valid({ price: 0 }))).toHaveLength(0);
  });

  it('rejects negative price', () => {
    const errors = validateProductData(valid({ price: -1 }));
    expect(errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('rejects NaN price', () => {
    const errors = validateProductData(valid({ price: NaN }));
    expect(errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('rejects Infinity price', () => {
    const errors = validateProductData(valid({ price: Infinity }));
    expect(errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('rejects price above 99999', () => {
    const errors = validateProductData(valid({ price: 100_000 }));
    expect(errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('accepts price exactly at 99999', () => {
    const errors = validateProductData(valid({ price: 99_999 }));
    expect(errors.some((e) => e.field === 'price')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// currency
// ---------------------------------------------------------------------------
describe('validateProductData — currency', () => {
  it('accepts RON', () => {
    expect(validateProductData(valid({ currency: 'RON' }))).toHaveLength(0);
  });

  it('accepts EUR', () => {
    expect(validateProductData(valid({ currency: 'EUR' }))).toHaveLength(0);
  });

  it('rejects unlisted currency', () => {
    const errors = validateProductData(valid({ currency: 'USD' }));
    expect(errors.some((e) => e.field === 'currency')).toBe(true);
  });

  it('rejects empty currency', () => {
    const errors = validateProductData(valid({ currency: '' }));
    expect(errors.some((e) => e.field === 'currency')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// image_url (optional)
// ---------------------------------------------------------------------------
describe('validateProductData — image_url', () => {
  it('allows null image_url', () => {
    expect(validateProductData(valid({ image_url: null }))).toHaveLength(0);
  });

  it('accepts a valid https URL', () => {
    expect(
      validateProductData(valid({ image_url: 'https://example.com/image.jpg' }))
    ).toHaveLength(0);
  });

  it('rejects http URL', () => {
    const errors = validateProductData(valid({ image_url: 'http://example.com/image.jpg' }));
    expect(errors.some((e) => e.field === 'image_url')).toBe(true);
  });

  it('rejects URL without protocol', () => {
    const errors = validateProductData(valid({ image_url: 'example.com/image.jpg' }));
    expect(errors.some((e) => e.field === 'image_url')).toBe(true);
  });

  it('rejects image_url longer than 500 characters', () => {
    const url = 'https://example.com/' + 'a'.repeat(490);
    const errors = validateProductData(valid({ image_url: url }));
    expect(errors.some((e) => e.field === 'image_url')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// image_alt (optional)
// ---------------------------------------------------------------------------
describe('validateProductData — image_alt', () => {
  it('allows null image_alt', () => {
    expect(validateProductData(valid({ image_alt: null }))).toHaveLength(0);
  });

  it('rejects image_alt longer than 255 characters', () => {
    const errors = validateProductData(valid({ image_alt: 'a'.repeat(256) }));
    expect(errors.some((e) => e.field === 'image_alt')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// tags
// ---------------------------------------------------------------------------
describe('validateProductData — tags', () => {
  it('accepts empty tags array', () => {
    expect(validateProductData(valid({ tags: [] }))).toHaveLength(0);
  });

  it('accepts valid tags', () => {
    expect(validateProductData(valid({ tags: ['handmade', 'gift'] }))).toHaveLength(0);
  });

  it('rejects more than 20 tags', () => {
    const errors = validateProductData(valid({ tags: Array.from({ length: 21 }, (_, i) => `tag${i}`) }));
    expect(errors.some((e) => e.field === 'tags')).toBe(true);
  });

  it('accepts exactly 20 tags', () => {
    const errors = validateProductData(valid({ tags: Array.from({ length: 20 }, (_, i) => `tag${i}`) }));
    expect(errors.some((e) => e.field === 'tags')).toBe(false);
  });

  it('rejects a tag longer than 50 characters', () => {
    const errors = validateProductData(valid({ tags: ['a'.repeat(51)] }));
    expect(errors.some((e) => e.field === 'tags')).toBe(true);
  });

  it('accepts a tag exactly 50 characters long', () => {
    const errors = validateProductData(valid({ tags: ['a'.repeat(50)] }));
    expect(errors.some((e) => e.field === 'tags')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Multiple errors
// ---------------------------------------------------------------------------
describe('validateProductData — multiple errors', () => {
  it('returns all errors when multiple fields are invalid', () => {
    const errors = validateProductData(valid({ slug: '', name: '', currency: 'USD', price: -5 }));
    expect(errors.length).toBeGreaterThanOrEqual(4);
    const fields = errors.map((e) => e.field);
    expect(fields).toContain('slug');
    expect(fields).toContain('name');
    expect(fields).toContain('currency');
    expect(fields).toContain('price');
  });

  it('returns empty array for a fully valid product', () => {
    expect(
      validateProductData(
        valid({
          slug: 'handmade-mug',
          name: 'Handmade Mug',
          name_en: 'Handmade Mug EN',
          description: 'A lovely handmade mug.',
          price: 49,
          currency: 'EUR',
          image_url: 'https://cdn.example.com/mug.jpg',
          image_alt: 'Handmade ceramic mug',
          tags: ['ceramic', 'handmade'],
        })
      )
    ).toHaveLength(0);
  });
});
