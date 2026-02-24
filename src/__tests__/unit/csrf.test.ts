import { describe, it, expect, vi } from 'vitest';
import { generateCsrfToken, setCsrfCookie, readCsrfCookie, validateCsrfTokens } from '@lib/csrf';

// ---------------------------------------------------------------------------
// generateCsrfToken
// ---------------------------------------------------------------------------
describe('generateCsrfToken', () => {
  it('returns a string', () => {
    expect(typeof generateCsrfToken()).toBe('string');
  });

  it('returns a valid UUID v4', () => {
    const token = generateCsrfToken();
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(token).toMatch(uuidV4);
  });

  it('returns a unique value on each call', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateCsrfToken()));
    expect(tokens.size).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// validateCsrfTokens
// ---------------------------------------------------------------------------
describe('validateCsrfTokens', () => {
  it('returns true when both tokens are identical', () => {
    expect(validateCsrfTokens('abc-123', 'abc-123')).toBe(true);
  });

  it('returns true when comparing two matching generated UUIDs', () => {
    const token = generateCsrfToken();
    expect(validateCsrfTokens(token, token)).toBe(true);
  });

  it('returns false when tokens differ', () => {
    expect(validateCsrfTokens('abc-123', 'abc-124')).toBe(false);
  });

  it('returns false when tokens differ in only the last character', () => {
    // Tests that every character position is compared
    const a = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const b = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab';
    expect(validateCsrfTokens(a, b)).toBe(false);
  });

  it('returns false when tokens differ in only the first character', () => {
    const a = 'xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const b = 'yaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validateCsrfTokens(a, b)).toBe(false);
  });

  it('returns false when two different UUIDs are compared', () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    // UUIDs are random — if by cosmic chance they match, skip the assertion
    if (t1 !== t2) {
      expect(validateCsrfTokens(t1, t2)).toBe(false);
    }
  });

  it('returns false when cookieToken is empty', () => {
    expect(validateCsrfTokens('', 'some-token')).toBe(false);
  });

  it('returns false when formToken is empty', () => {
    expect(validateCsrfTokens('some-token', '')).toBe(false);
  });

  it('returns false when both tokens are empty', () => {
    expect(validateCsrfTokens('', '')).toBe(false);
  });

  it('returns false when lengths differ (guards against short-circuit bypass)', () => {
    expect(validateCsrfTokens('abc', 'abcd')).toBe(false);
    expect(validateCsrfTokens('abcd', 'abc')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(validateCsrfTokens('Token-ABC', 'token-abc')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// setCsrfCookie
// ---------------------------------------------------------------------------
describe('setCsrfCookie', () => {
  it('calls cookies.set with the correct cookie name and token value', () => {
    const cookies = { set: vi.fn() };
    setCsrfCookie(cookies as any, 'my-test-token');
    expect(cookies.set).toHaveBeenCalledOnce();
    const [name, value] = cookies.set.mock.calls[0];
    expect(name).toBe('csrf_token');
    expect(value).toBe('my-test-token');
  });

  it('sets httpOnly: true', () => {
    const cookies = { set: vi.fn() };
    setCsrfCookie(cookies as any, 'tok');
    const options = cookies.set.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
  });

  it('sets sameSite: "strict"', () => {
    const cookies = { set: vi.fn() };
    setCsrfCookie(cookies as any, 'tok');
    const options = cookies.set.mock.calls[0][2];
    expect(options.sameSite).toBe('strict');
  });

  it('scopes cookie to /admin path', () => {
    const cookies = { set: vi.fn() };
    setCsrfCookie(cookies as any, 'tok');
    const options = cookies.set.mock.calls[0][2];
    expect(options.path).toBe('/admin');
  });

  it('sets maxAge to 3600 (1 hour)', () => {
    const cookies = { set: vi.fn() };
    setCsrfCookie(cookies as any, 'tok');
    const options = cookies.set.mock.calls[0][2];
    expect(options.maxAge).toBe(3600);
  });
});

// ---------------------------------------------------------------------------
// readCsrfCookie
// ---------------------------------------------------------------------------
describe('readCsrfCookie', () => {
  it('returns the stored cookie value', () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: 'stored-token' }) };
    expect(readCsrfCookie(cookies as any)).toBe('stored-token');
  });

  it('looks up the "csrf_token" cookie by name', () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: 'x' }) };
    readCsrfCookie(cookies as any);
    expect(cookies.get).toHaveBeenCalledWith('csrf_token');
  });

  it('returns an empty string when the cookie is absent', () => {
    const cookies = { get: vi.fn().mockReturnValue(undefined) };
    expect(readCsrfCookie(cookies as any)).toBe('');
  });

  it('returns an empty string when cookies.get returns null', () => {
    const cookies = { get: vi.fn().mockReturnValue(null) };
    expect(readCsrfCookie(cookies as any)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Round-trip: generate → set → read → validate
// ---------------------------------------------------------------------------
describe('CSRF round-trip', () => {
  it('a token set via setCsrfCookie can be read back and validated', () => {
    const stored: Record<string, { value: string }> = {};
    const cookies = {
      set: vi.fn((name: string, value: string) => { stored[name] = { value }; }),
      get: vi.fn((name: string) => stored[name]),
    };

    const token = generateCsrfToken();
    setCsrfCookie(cookies as any, token);
    const readBack = readCsrfCookie(cookies as any);

    expect(validateCsrfTokens(readBack, token)).toBe(true);
  });

  it('validation fails after token rotation (old form token vs new cookie)', () => {
    const stored: Record<string, { value: string }> = {};
    const cookies = {
      set: vi.fn((name: string, value: string) => { stored[name] = { value }; }),
      get: vi.fn((name: string) => stored[name]),
    };

    const oldToken = generateCsrfToken();
    setCsrfCookie(cookies as any, oldToken);

    // Simulate rotation — new token written to cookie
    const newToken = generateCsrfToken();
    setCsrfCookie(cookies as any, newToken);

    // Old form token should no longer match the new cookie
    const cookieValue = readCsrfCookie(cookies as any);
    expect(validateCsrfTokens(cookieValue, oldToken)).toBe(false);
  });
});
