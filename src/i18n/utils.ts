import { ui, defaultLang } from "./ui";
import type { Lang, UiKey } from "./ui";

export { defaultLang };
export type { Lang };

/**
 * Extract the current language from a URL.
 * Romanian pages are at the root (/), English under /en/.
 */
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

/**
 * Returns a translation function for the given language.
 * Falls back to Romanian if a key is missing in English.
 */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    const translations = ui[lang] as Record<string, string>;
    const fallback = ui[defaultLang] as Record<string, string>;
    return translations[key] ?? fallback[key] ?? key;
  };
}

/**
 * Generate the correct path for the given language.
 * Romanian pages live at root, English under /en/.
 */
export function getLocalizedPath(path: string, lang: Lang): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (lang === defaultLang) {
    // Remove /en/ prefix if present
    return cleanPath.replace(/^\/en/, "") || "/";
  }

  // Add /en/ prefix for English
  if (cleanPath.startsWith("/en/") || cleanPath === "/en") {
    return cleanPath;
  }
  return `/en${cleanPath}`;
}

/**
 * Get the alternate language path for the current URL.
 * Used for hreflang tags and language switcher.
 */
export function getAlternatePath(url: URL): { ro: string; en: string } {
  const lang = getLangFromUrl(url);
  const path = url.pathname;

  if (lang === "ro") {
    return {
      ro: path,
      en: getLocalizedPath(path, "en"),
    };
  }

  const pathWithoutLang = path.replace(/^\/en/, "") || "/";
  return {
    ro: pathWithoutLang,
    en: path,
  };
}

/**
 * Map Romanian route segments to English equivalents.
 */
const routeMap: Record<string, string> = {
  "povestea-mea": "my-story",
  produse: "products",
  blog: "blog",
};

/**
 * Map English route segments to Romanian equivalents.
 */
const routeMapReverse: Record<string, string> = Object.fromEntries(
  Object.entries(routeMap).map(([ro, en]) => [en, ro])
);

/**
 * Translate a path segment between languages.
 */
export function translateSegment(segment: string, targetLang: Lang): string {
  if (targetLang === "en") {
    return routeMap[segment] ?? segment;
  }
  return routeMapReverse[segment] ?? segment;
}
