import type { Lang } from "../../i18n/ui";

interface Props {
  lang: Lang;
  currentPath: string;
}

// Map Romanian paths to English equivalents
const roToEn: Record<string, string> = {
  "/": "/en/",
  "/povestea-mea": "/en/my-story",
  "/produse": "/en/products",
  "/blog": "/en/blog",
};

// Map English paths to Romanian equivalents
const enToRo: Record<string, string> = {
  "/en/": "/",
  "/en": "/",
  "/en/my-story": "/povestea-mea",
  "/en/products": "/produse",
  "/en/blog": "/blog",
};

function getAlternatePath(currentPath: string, currentLang: Lang): string {
  if (currentLang === "ro") {
    // Check for exact match first
    if (roToEn[currentPath]) return roToEn[currentPath];
    // Check for blog post (dynamic routes)
    if (currentPath.startsWith("/blog/")) {
      return "/en/blog/" + currentPath.replace("/blog/", "");
    }
    return "/en/";
  } else {
    // English -> Romanian
    if (enToRo[currentPath]) return enToRo[currentPath];
    // Check for blog post
    if (currentPath.startsWith("/en/blog/")) {
      return "/blog/" + currentPath.replace("/en/blog/", "");
    }
    return "/";
  }
}

export default function LanguageSwitcher({ lang, currentPath }: Props) {
  const targetLang: Lang = lang === "ro" ? "en" : "ro";
  const targetPath = getAlternatePath(currentPath, lang);

  const handleSwitch = () => {
    window.location.href = targetPath;
  };

  return (
    <button
      onClick={handleSwitch}
      aria-label={`Switch to ${targetLang === "ro" ? "Romanian" : "English"}`}
      className="flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors hover:bg-[var(--bg-accent)] text-[var(--text-secondary)]"
    >
      <span aria-hidden="true">{lang === "ro" ? "🇷🇴" : "🇬🇧"}</span>
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
