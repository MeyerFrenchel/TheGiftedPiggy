import { describe, it, expect } from 'vitest';
import { updateProduct, parseProductFormData } from '@lib/products';
import { createSupabaseMock } from '../helpers/supabaseMock';
import { makeFormData } from '../helpers/fixtures';

describe('updateProduct', () => {
  it('calls .update(data).eq("id", id)', async () => {
    const { client, builder } = createSupabaseMock({ data: null, error: null });
    const data = parseProductFormData(makeFormData());

    await updateProduct(client, 'product-123', data);

    expect(client.from).toHaveBeenCalledWith('products');
    expect(builder.update).toHaveBeenCalledWith(data);
    expect(builder.eq).toHaveBeenCalledWith('id', 'product-123');
  });

  it('passes parsed data correctly', async () => {
    const { client, builder } = createSupabaseMock({ data: null, error: null });
    const form = makeFormData({ slug: 'updated-slug', name: 'Updated Name', price: '150' });
    const data = parseProductFormData(form);

    await updateProduct(client, 'product-123', data);

    const updatedData = builder.update.mock.calls[0][0];
    expect(updatedData.slug).toBe('updated-slug');
    expect(updatedData.name).toBe('Updated Name');
    expect(updatedData.price).toBe(150);
  });

  it('returns { success: true } on success', async () => {
    const { client } = createSupabaseMock({ data: null, error: null });
    const result = await updateProduct(client, 'product-123', parseProductFormData(makeFormData()));
    expect(result).toEqual({ success: true, data: undefined });
  });

  it('returns { success: false, error } on DB error', async () => {
    const { client } = createSupabaseMock({
      data: null,
      error: { message: 'row not found' },
    });
    const result = await updateProduct(client, 'product-123', parseProductFormData(makeFormData()));
    expect(result).toEqual({ success: false, error: 'row not found' });
  });
});
