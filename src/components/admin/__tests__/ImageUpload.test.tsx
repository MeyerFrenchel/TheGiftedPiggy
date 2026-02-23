import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

// Mock storage methods
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockStorageObj = {
  from: vi.fn(() => ({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  })),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ storage: mockStorageObj })),
}));

import ImageUpload from '../ImageUpload';

const defaultProps = {
  accessToken: 'test-token',
  supabaseUrl: 'https://test.supabase.co',
};

function addAnonKeyMeta() {
  const meta = document.createElement('meta');
  meta.name = 'supabase-anon-key';
  meta.content = 'test-anon-key';
  document.head.appendChild(meta);
  return meta;
}

function makeFile(name = 'photo.jpg', type = 'image/jpeg') {
  return new File(['img-content'], name, { type });
}

describe('ImageUpload', () => {
  let metaEl: HTMLMetaElement;

  beforeEach(() => {
    metaEl = addAnonKeyMeta() as HTMLMetaElement;
    mockUpload.mockReset();
    mockGetPublicUrl.mockReset();
    mockStorageObj.from.mockReset();
    mockStorageObj.from.mockReturnValue({ upload: mockUpload, getPublicUrl: mockGetPublicUrl });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/product-images/uploaded.jpg' },
    });
  });

  afterEach(() => {
    metaEl.remove();
  });

  describe('render', () => {
    it('shows drop zone text', () => {
      render(<ImageUpload {...defaultProps} />);
      expect(screen.getByText(/drop an image here/i)).toBeInTheDocument();
    });

    it('shows image preview when currentUrl is provided', () => {
      render(<ImageUpload {...defaultProps} currentUrl="https://example.com/image.jpg" />);
      const img = screen.getByRole('img', { name: /preview/i });
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('does not show preview when currentUrl is empty', () => {
      render(<ImageUpload {...defaultProps} currentUrl="" />);
      expect(screen.queryByRole('img', { name: /preview/i })).not.toBeInTheDocument();
    });
  });

  describe('file upload', () => {
    it('shows "Uploading…" during upload', async () => {
      // Make upload never resolve
      let resolveUpload!: () => void;
      mockUpload.mockReturnValue(
        new Promise<{ error: null }>((res) => {
          resolveUpload = () => res({ error: null });
        })
      );
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Fire change event synchronously so we can check the uploading state before resolution
      fireEvent.change(input, { target: { files: [makeFile()] } });

      expect(await screen.findByText(/uploading/i)).toBeInTheDocument();
      resolveUpload();
    });

    it('shows preview src after successful upload', async () => {
      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, makeFile());

      await waitFor(() => {
        const img = screen.getByRole('img', { name: /preview/i });
        expect(img).toHaveAttribute(
          'src',
          'https://test.supabase.co/storage/v1/object/public/product-images/uploaded.jpg'
        );
      });
    });

    it('dispatches "image-uploaded" event with correct URL', async () => {
      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const eventPromise = new Promise<CustomEvent>((resolve) => {
        document.addEventListener('image-uploaded', (e) => resolve(e as CustomEvent), { once: true });
      });

      await user.upload(input, makeFile());

      const event = await eventPromise;
      expect(event.detail.url).toBe(
        'https://test.supabase.co/storage/v1/object/public/product-images/uploaded.jpg'
      );
    });

    it('calls storage.from("product-images").upload(filename, file, {upsert: false})', async () => {
      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = makeFile();

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockStorageObj.from).toHaveBeenCalledWith('product-images');
        expect(mockUpload).toHaveBeenCalledWith(
          expect.stringMatching(/\.jpg$/),
          file,
          { upsert: false }
        );
      });
    });
  });

  describe('error handling', () => {
    it('shows error message when upload fails', async () => {
      mockUpload.mockResolvedValue({ error: new Error('Upload failed') });

      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, makeFile());

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });
    });

    it('does not show preview on error', async () => {
      mockUpload.mockResolvedValue({ error: new Error('Upload failed') });

      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, makeFile());

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: /preview/i })).not.toBeInTheDocument();
      });
    });

    it('clears error on next successful upload', async () => {
      mockUpload.mockResolvedValueOnce({ error: new Error('Upload failed') });

      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, makeFile('first.jpg'));

      await waitFor(() => expect(screen.getByText(/upload failed/i)).toBeInTheDocument());

      // Second upload with a different filename succeeds (default mock resolves ok)
      await user.upload(input, makeFile('second.jpg'));

      await waitFor(() => {
        expect(screen.queryByText(/upload failed/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Remove button', () => {
    it('is visible when there is a preview', () => {
      render(<ImageUpload {...defaultProps} currentUrl="https://example.com/image.jpg" />);
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('click clears the preview', async () => {
      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} currentUrl="https://example.com/image.jpg" />);
      await user.click(screen.getByRole('button', { name: /remove/i }));
      expect(screen.queryByRole('img', { name: /preview/i })).not.toBeInTheDocument();
    });

    it('dispatches "image-uploaded" with url: "" when Remove is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageUpload {...defaultProps} currentUrl="https://example.com/image.jpg" />);

      const eventPromise = new Promise<CustomEvent>((resolve) => {
        document.addEventListener('image-uploaded', (e) => resolve(e as CustomEvent), { once: true });
      });

      await user.click(screen.getByRole('button', { name: /remove/i }));

      const event = await eventPromise;
      expect(event.detail.url).toBe('');
    });
  });

  describe('drag and drop', () => {
    it('dropped file triggers upload', async () => {
      render(<ImageUpload {...defaultProps} />);

      // Find the outer drop zone div (has onDrop handler)
      const dropZone = screen.getByText(/drop an image here/i).closest('div');
      expect(dropZone).toBeTruthy();

      const file = makeFile('dropped.png', 'image/png');
      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
      });
    });
  });
});
