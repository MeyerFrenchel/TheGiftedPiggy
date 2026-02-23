import { vi } from 'vitest';

export function createSupabaseMock(defaultResult = { data: null, error: null }) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve(defaultResult)),
  };

  const storageBucket = {
    upload: vi.fn().mockResolvedValue({ error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/product-images/photo.jpg' },
    }),
  };

  const client = {
    from: vi.fn().mockReturnValue(builder),
    storage: { from: vi.fn().mockReturnValue(storageBucket) },
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  };

  return { client, builder, storageBucket };
}
