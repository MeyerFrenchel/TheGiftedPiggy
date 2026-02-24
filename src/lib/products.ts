import type { Database } from './database.types';

export type ProductRow = Database['public']['Tables']['products']['Row'];

export interface ParsedProductData {
  slug: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  image_alt: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  in_stock: boolean;
}

export type ProductResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

type SupabaseClient = {
  from: (table: string) => any;
  storage: {
    from: (bucket: string) => {
      remove: (paths: string[]) => Promise<{ error: Error | null }>;
    };
  };
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const ALLOWED_CURRENCIES = ['RON', 'EUR'] as const;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

const MAX = {
  slug: 100,
  name: 255,
  description: 2000,
  image_url: 500,
  image_alt: 255,
  tag: 50,
  tags: 20,
  price: 99_999,
} as const;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProductData(data: ParsedProductData): ValidationError[] {
  const errors: ValidationError[] = [];

  // slug
  if (!data.slug) {
    errors.push({ field: 'slug', message: 'Slug is required.' });
  } else if (data.slug.length > MAX.slug) {
    errors.push({ field: 'slug', message: `Slug must be at most ${MAX.slug} characters.` });
  } else if (!SLUG_PATTERN.test(data.slug)) {
    errors.push({ field: 'slug', message: 'Slug may only contain lowercase letters, numbers, and hyphens.' });
  }

  // name
  if (!data.name) {
    errors.push({ field: 'name', message: 'Name is required.' });
  } else if (data.name.length > MAX.name) {
    errors.push({ field: 'name', message: `Name must be at most ${MAX.name} characters.` });
  }

  // name_en
  if (data.name_en && data.name_en.length > MAX.name) {
    errors.push({ field: 'name_en', message: `English name must be at most ${MAX.name} characters.` });
  }

  // description
  if (data.description && data.description.length > MAX.description) {
    errors.push({ field: 'description', message: `Description must be at most ${MAX.description} characters.` });
  }

  // description_en
  if (data.description_en && data.description_en.length > MAX.description) {
    errors.push({ field: 'description_en', message: `English description must be at most ${MAX.description} characters.` });
  }

  // price
  if (!Number.isFinite(data.price) || data.price < 0) {
    errors.push({ field: 'price', message: 'Price must be a valid non-negative number.' });
  } else if (data.price > MAX.price) {
    errors.push({ field: 'price', message: `Price must not exceed ${MAX.price}.` });
  }

  // currency
  if (!(ALLOWED_CURRENCIES as readonly string[]).includes(data.currency)) {
    errors.push({ field: 'currency', message: `Currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}.` });
  }

  // image_url — must be https if provided
  if (data.image_url) {
    if (!data.image_url.startsWith('https://')) {
      errors.push({ field: 'image_url', message: 'Image URL must start with https://.' });
    } else if (data.image_url.length > MAX.image_url) {
      errors.push({ field: 'image_url', message: `Image URL must be at most ${MAX.image_url} characters.` });
    }
  }

  // image_alt
  if (data.image_alt && data.image_alt.length > MAX.image_alt) {
    errors.push({ field: 'image_alt', message: `Image alt text must be at most ${MAX.image_alt} characters.` });
  }

  // tags
  if (data.tags.length > MAX.tags) {
    errors.push({ field: 'tags', message: `At most ${MAX.tags} tags are allowed.` });
  }
  for (const tag of data.tags) {
    if (tag.length > MAX.tag) {
      errors.push({ field: 'tags', message: `Tag "${tag}" must be at most ${MAX.tag} characters.` });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export function parseProductFormData(form: FormData): ParsedProductData {
  const tagsRaw = form.get('tags')?.toString() ?? '';
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug: form.get('slug')?.toString() ?? '',
    name: form.get('name')?.toString() ?? '',
    name_en: form.get('name_en')?.toString() || null,
    description: form.get('description')?.toString() || null,
    description_en: form.get('description_en')?.toString() || null,
    price: parseFloat(form.get('price')?.toString() ?? '0'),
    currency: form.get('currency')?.toString() || 'RON',
    image_url: form.get('image_url')?.toString() || null,
    image_alt: form.get('image_alt')?.toString() || null,
    category: form.get('category')?.toString() || null,
    tags,
    featured: form.get('featured') === 'true',
    in_stock: form.get('in_stock') === 'true',
  };
}

export function parseStoragePath(url: string): string | null {
  if (!url) return null;
  const parts = url.split('/product-images/');
  if (parts.length < 2 || !parts[1]) return null;
  return parts[1];
}

// ---------------------------------------------------------------------------
// DB operations — errors are logged server-side, generic message returned
// ---------------------------------------------------------------------------

export async function createProduct(
  supabase: SupabaseClient,
  data: ParsedProductData
): Promise<ProductResult> {
  const { error } = await supabase.from('products').insert(data);
  if (error) {
    console.error('[createProduct]', error.message);
    return { success: false, error: 'Could not save product. Please try again.' };
  }
  return { success: true, data: undefined };
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  data: ParsedProductData
): Promise<ProductResult> {
  const { error } = await supabase.from('products').update(data).eq('id', id);
  if (error) {
    console.error('[updateProduct]', error.message);
    return { success: false, error: 'Could not update product. Please try again.' };
  }
  return { success: true, data: undefined };
}

export async function getProduct(
  supabase: SupabaseClient,
  id: string
): Promise<ProductResult<ProductRow>> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) {
    if (error) console.error('[getProduct]', error.message);
    return { success: false, error: 'Could not load product.' };
  }
  return { success: true, data };
}

export async function deleteProduct(
  supabase: SupabaseClient,
  id: string
): Promise<ProductResult> {
  // Fetch image_url first
  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single();

  // Best-effort storage removal
  if (product?.image_url) {
    const storagePath = parseStoragePath(product.image_url);
    if (storagePath) {
      try {
        await supabase.storage.from('product-images').remove([storagePath]);
      } catch {
        // swallow — proceed with DB delete
      }
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('[deleteProduct]', error.message);
    return { success: false, error: 'Could not delete product. Please try again.' };
  }
  return { success: true, data: undefined };
}
