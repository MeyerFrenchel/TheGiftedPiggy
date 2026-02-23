import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Props {
  accessToken: string;
  supabaseUrl: string;
  currentUrl?: string;
}

export default function ImageUpload({ accessToken, supabaseUrl, currentUrl = '' }: Props) {
  const [preview, setPreview] = useState<string>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      const anonKey = (document.querySelector('meta[name="supabase-anon-key"]') as HTMLMetaElement)?.content ?? '';
      const client = createClient(supabaseUrl, anonKey, {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      });

      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await client.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = client.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setPreview(publicUrl);

      // Notify the parent form via custom event
      document.dispatchEvent(new CustomEvent('image-uploaded', { detail: { url: publicUrl } }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: uploading ? '#f9fafb' : '#fff',
          transition: 'border-color 0.15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        {uploading ? (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Uploading…</p>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Drop an image here or <strong>click to browse</strong>
            <br />
            <span style={{ fontSize: '0.75rem' }}>JPEG, PNG, WebP, GIF — max 5 MB</span>
          </p>
        )}
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>{error}</p>
      )}

      {preview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
          />
          <div style={{ fontSize: '0.8rem', color: '#6b7280', wordBreak: 'break-all' }}>
            {preview}
          </div>
          <button
            type="button"
            onClick={() => {
              setPreview('');
              document.dispatchEvent(new CustomEvent('image-uploaded', { detail: { url: '' } }));
            }}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
