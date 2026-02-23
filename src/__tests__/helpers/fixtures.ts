import type { ProductRow } from '@lib/products';

export const mockProduct: ProductRow = {
  id: 'test-product-id',
  slug: 'test-product',
  name: 'Test Product',
  name_en: 'Test Product EN',
  description: 'A test product description',
  description_en: 'A test product description in English',
  price: 99,
  currency: 'RON',
  image_url: 'https://test.supabase.co/storage/v1/object/public/product-images/test.jpg',
  image_alt: 'Test product image',
  category: 'gifts',
  tags: ['tag1', 'tag2'],
  featured: true,
  in_stock: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const OMIT = '__OMIT__';

type FormDataOverrides = Partial<Record<string, string | typeof OMIT>>;

export function makeFormData(overrides: FormDataOverrides = {}): FormData {
  const defaults: Record<string, string> = {
    slug: 'test-slug',
    name: 'Test Name',
    name_en: 'Test Name EN',
    description: 'Test description',
    description_en: 'Test description EN',
    price: '99',
    currency: 'RON',
    image_url: 'https://example.com/image.jpg',
    image_alt: 'Alt text',
    category: 'gifts',
    tags: 'tag1, tag2',
    featured: 'true',
    in_stock: 'true',
  };

  const merged = { ...defaults, ...overrides };
  const form = new FormData();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== OMIT) {
      form.append(key, value);
    }
  }
  return form;
}

export { OMIT };
