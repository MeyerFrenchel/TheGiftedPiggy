import { describe, it, expect } from 'vitest';
import { getProduct } from '@lib/products';
import { createSupabaseMock } from '../helpers/supabaseMock';
import { mockProduct } from '../helpers/fixtures';

describe('getProduct', () => {
  it('calls select("*").eq("id", id).single()', async () => {
    const { client, builder } = createSupabaseMock({ data: mockProduct, error: null });

    await getProduct(client, 'test-product-id');

    expect(client.from).toHaveBeenCalledWith('products');
    expect(builder.select).toHaveBeenCalledWith('*');
    expect(builder.eq).toHaveBeenCalledWith('id', 'test-product-id');
    expect(builder.single).toHaveBeenCalled();
  });

  it('returns { success: true, data: product } on success', async () => {
    const { client } = createSupabaseMock({ data: mockProduct, error: null });

    const result = await getProduct(client, 'test-product-id');

    expect(result).toEqual({ success: true, data: mockProduct });
  });

  it('returns { success: false, error } on DB error', async () => {
    const { client } = createSupabaseMock({
      data: null,
      error: { message: 'row not found' },
    });

    const result = await getProduct(client, 'nonexistent-id');

    expect(result).toEqual({ success: false, error: 'row not found' });
  });

  it('returns { success: false } when data is null with no error', async () => {
    const { client } = createSupabaseMock({ data: null, error: null });

    const result = await getProduct(client, 'nonexistent-id');

    expect(result.success).toBe(false);
  });
});
