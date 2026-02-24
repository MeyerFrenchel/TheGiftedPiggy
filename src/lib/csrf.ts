const CSRF_COOKIE = 'csrf_token';

export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

export function setCsrfCookie(
  cookies: import('astro').AstroCookies,
  token: string,
): void {
  cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/admin',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60, // 1 hour
  });
}

/** Read the current token from the request cookie (before any overwrite). */
export function readCsrfCookie(
  cookies: import('astro').AstroCookies,
): string {
  return cookies.get(CSRF_COOKIE)?.value ?? '';
}

/**
 * Timing-safe comparison of the token stored in the cookie
 * against the value submitted in the form.
 */
export function validateCsrfTokens(cookieToken: string, formToken: string): boolean {
  if (!cookieToken || !formToken) return false;
  if (cookieToken.length !== formToken.length) return false;
  let diff = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    diff |= cookieToken.charCodeAt(i) ^ formToken.charCodeAt(i);
  }
  return diff === 0;
}
