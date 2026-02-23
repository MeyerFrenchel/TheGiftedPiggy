import { describe, it, expect, vi } from 'vitest';
import { createProduct, parseProductFormData } from '@lib/products';
import { createSupabaseMock } from '../helpers/supabaseMock';
import { makeFormData, OMIT } from '../helpers/fixtures';

describe('createProduct', () => {
  it('calls from("products").insert() with correctly shaped data', async () => {
    const { client, builder } = createSupabaseMock({ data: null, error: null });
    const form = makeFormData();
    const data = parseProductFormData(form);

    await createProduct(client, data);

    expect(client.from).toHaveBeenCalledWith('products');
    expect(builder.insert).toHaveBeenCalledWith(data);
  });

  it('passes null for empty optional fields', async () => {
    const { client, builder } = createSupabaseMock({ data: null, error: null });
    const form = makeFormData({
      name_en: '',
      description: '',
      description_en: '',
      image_url: '',
      image_alt: '',
      category: '',
    });
    const data = parseProductFormData(form);

    await createProduct(client, data);

    const insertedData = builder.insert.mock.calls[0][0];
    expect(insertedData.name_en).toBeNull();
    expect(insertedData.description).toBeNull();
    expect(insertedData.description_en).toBeNull();
    expect(insertedData.image_url).toBeNull();
    expect(insertedData.image_alt).toBeNull();
    expect(insertedData.category).toBeNull();
  });

  it('passes empty array for empty tags', async () => {
    const { client, builder } = createSupabaseMock({ data: null, error: null });
    const form = makeFormData({ tags: '' });
    const data = parseProductFormData(form);

    await createProduct(client, data);

    const insertedData = builder.insert.mock.calls[0][0];
    expect(insertedData.tags).toEqual([]);
  });

  it('returns { success: true } on success', async () => {
    const { client } = createSupabaseMock({ data: null, error: null });
    const result = await createProduct(client, parseProductFormData(makeFormData()));
    expect(result).toEqual({ success: true, data: undefined });
  });

  it('returns { success: false, error } on DB error', async () => {
    const { client } = createSupabaseMock({
      data: null,
      error: { message: 'duplicate key value' },
    });
    const result = await createProduct(client, parseProductFormData(makeFormData()));
    expect(result).toEqual({ success: false, error: 'duplicate key value' });
  });
});
