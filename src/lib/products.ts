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

export async function createProduct(
  supabase: SupabaseClient,
  data: ParsedProductData
): Promise<ProductResult> {
  const { error } = await supabase.from('products').insert(data);
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  data: ParsedProductData
): Promise<ProductResult> {
  const { error } = await supabase.from('products').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
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
  if (error || !data) return { success: false, error: error?.message ?? 'Not found' };
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
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
