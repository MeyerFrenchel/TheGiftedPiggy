import { useState } from 'react';

interface Props {
  productId: string;
  productName: string;
  csrfToken: string;
}

export default function DeleteProductButton({ productId, productName, csrfToken }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form method="post" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="hidden" name="action" value="delete" />
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="csrf_token" value={csrfToken} />
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Delete "{productName}"?</span>
        <button
          type="submit"
          style={{
            padding: '0.375rem 0.75rem',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Yes, delete
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          style={{
            padding: '0.375rem 0.75rem',
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '5px',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      style={{
        padding: '0.375rem 0.75rem',
        background: '#fee2e2',
        color: '#dc2626',
        border: 'none',
        borderRadius: '5px',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Delete
    </button>
  );
}
