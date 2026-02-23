import { describe, it, expect, vi } from 'vitest';
import { deleteProduct } from '@lib/products';
import { createSupabaseMock } from '../helpers/supabaseMock';
import { mockProduct } from '../helpers/fixtures';

describe('deleteProduct', () => {
  it('calls from() twice — select then delete', async () => {
    const { client, builder } = createSupabaseMock();
    // First call: select image_url → returns product with no image
    builder.then
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: { image_url: null }, error: null })
      )
      // Second call: delete → success
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: null })
      );

    await deleteProduct(client, 'product-123');

    expect(client.from).toHaveBeenCalledTimes(2);
    expect(client.from).toHaveBeenNthCalledWith(1, 'products');
    expect(client.from).toHaveBeenNthCalledWith(2, 'products');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'product-123');
  });

  it('calls storage.from("product-images").remove([filename]) when image is present', async () => {
    const { client, builder, storageBucket } = createSupabaseMock();
    builder.then
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({
          data: { image_url: 'https://test.supabase.co/storage/v1/object/public/product-images/photo.jpg' },
          error: null,
        })
      )
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: null })
      );

    await deleteProduct(client, 'product-123');

    expect(client.storage.from).toHaveBeenCalledWith('product-images');
    expect(storageBucket.remove).toHaveBeenCalledWith(['photo.jpg']);
  });

  it('skips storage removal when image_url is null', async () => {
    const { client, builder, storageBucket } = createSupabaseMock();
    builder.then
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: { image_url: null }, error: null })
      )
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: null })
      );

    await deleteProduct(client, 'product-123');

    expect(storageBucket.remove).not.toHaveBeenCalled();
  });

  it('skips storage removal when product is not found', async () => {
    const { client, builder, storageBucket } = createSupabaseMock();
    builder.then
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: null })
      )
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: null })
      );

    await deleteProduct(client, 'product-123');

    expect(storageBucket.remove).not.toHaveBeenCalled();
  });

  it('proceeds with DB delete even if storage.remove fails → still returns { success: true }', async () => {
    const { client, builder, storageBucket } = createSupabaseMock();
    builder.then
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({
          data: { image_url: 'https://test.supabase.co/storage/v1/object/public/product-images/photo.jpg' },
          error: null,
        })
      )
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: null })
      );
    storageBucket.remove.mockRejectedValueOnce(new Error('Storage error'));

    const result = await deleteProduct(client, 'product-123');

    expect(result).toEqual({ success: true, data: undefined });
    expect(builder.delete).toHaveBeenCalled();
  });

  it('returns { success: false, error } when DB delete fails', async () => {
    const { client, builder } = createSupabaseMock();
    builder.then
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: { image_url: null }, error: null })
      )
      .mockImplementationOnce((resolve: (val: any) => void) =>
        resolve({ data: null, error: { message: 'delete failed' } })
      );

    const result = await deleteProduct(client, 'product-123');

    expect(result).toEqual({ success: false, error: 'delete failed' });
  });
});
