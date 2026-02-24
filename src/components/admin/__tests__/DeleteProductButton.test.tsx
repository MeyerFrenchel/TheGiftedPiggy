import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteProductButton from '../DeleteProductButton';

describe('DeleteProductButton', () => {
  const defaultProps = {
    productId: 'product-abc',
    productName: 'Test Product',
    csrfToken: 'test-csrf-token-uuid',
  };

  describe('initial state', () => {
    it('shows "Delete" button', () => {
      render(<DeleteProductButton {...defaultProps} />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('does not show confirmation UI initially', () => {
      render(<DeleteProductButton {...defaultProps} />);
      expect(screen.queryByText(/yes, delete/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    });
  });

  describe('after clicking Delete', () => {
    it('shows "Yes, delete" and "Cancel" buttons', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows product name in confirmation text', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });

    it('hides initial Delete button', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    });
  });

  describe('Cancel', () => {
    it('returns to initial state when Cancel is clicked', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.queryByText(/yes, delete/i)).not.toBeInTheDocument();
    });
  });

  describe('form structure', () => {
    it('form has method="post"', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const form = screen.getByRole('button', { name: /yes, delete/i }).closest('form');
      expect(form).toHaveAttribute('method', 'post');
    });

    it('has hidden input action=delete', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const actionInput = document.querySelector('input[name="action"]') as HTMLInputElement;
      expect(actionInput).toBeTruthy();
      expect(actionInput.value).toBe('delete');
    });

    it('has hidden input id=productId', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const idInput = document.querySelector('input[name="id"]') as HTMLInputElement;
      expect(idInput).toBeTruthy();
      expect(idInput.value).toBe('product-abc');
    });

    it('"Yes, delete" is type="submit"', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const submitBtn = screen.getByRole('button', { name: /yes, delete/i });
      expect(submitBtn).toHaveAttribute('type', 'submit');
    });

    it('"Cancel" is type="button"', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      expect(cancelBtn).toHaveAttribute('type', 'button');
    });
  });

  describe('CSRF protection', () => {
    it('includes a hidden csrf_token input in the confirmation form', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      expect(csrfInput).toBeTruthy();
      expect(csrfInput.type).toBe('hidden');
    });

    it('csrf_token input value matches the csrfToken prop', async () => {
      render(<DeleteProductButton {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      const csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      expect(csrfInput.value).toBe('test-csrf-token-uuid');
    });

    it('csrf_token input is not present before confirmation is shown', () => {
      render(<DeleteProductButton {...defaultProps} />);
      // Before clicking Delete the form is not mounted at all
      expect(document.querySelector('input[name="csrf_token"]')).toBeNull();
    });

    it('csrf_token input value updates when a different token prop is passed', async () => {
      const { rerender } = render(<DeleteProductButton {...defaultProps} csrfToken="token-A" />);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));

      let csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      expect(csrfInput.value).toBe('token-A');

      rerender(<DeleteProductButton {...defaultProps} csrfToken="token-B" />);
      csrfInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      expect(csrfInput.value).toBe('token-B');
    });
  });
});
