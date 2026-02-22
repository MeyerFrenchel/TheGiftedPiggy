import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "../../i18n/ui";
import { ui } from "../../i18n/ui";

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  lang: Lang;
  currentPath: string;
}

export default function MobileMenu({ lang, currentPath }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const t = (key: keyof (typeof ui)["ro"]) => ui[lang][key] ?? ui["ro"][key] ?? key;

  const navItems: NavItem[] = [
    { label: t("nav.home"), href: lang === "en" ? "/en/" : "/" },
    { label: t("nav.story"), href: lang === "en" ? "/en/my-story" : "/povestea-mea" },
    { label: t("nav.products"), href: lang === "en" ? "/en/products" : "/produse" },
    { label: t("nav.blog"), href: lang === "en" ? "/en/blog" : "/blog" },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggle}
        aria-label={isOpen ? t("ui.closeMenu") : t("ui.openMenu")}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-accent)] text-[var(--text-secondary)]"
      >
        {isOpen ? (
          // X icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {/* Portal: Overlay + Panel rendered to document.body to escape header stacking context */}
      {mounted && createPortal(
        <>
          {/* Mobile Menu Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />
          )}

          {/* Mobile Menu Panel */}
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal={isOpen}
            aria-label="Mobile navigation"
            aria-hidden={!isOpen}
            className={`fixed right-0 top-0 z-9999 h-auto w-72 rounded-bl-2xl transform bg-[var(--bg-secondary)] shadow-lg transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] p-4">
              <span
                className="text-lg font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                🐷 The Gifted Piggy
              </span>
              <button
                onClick={close}
                aria-label={t("ui.closeMenu")}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-accent)] text-[var(--text-secondary)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="p-4">
              <ul className="space-y-1" role="list">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/" || item.href === "/en/"
                      ? currentPath === item.href
                      : currentPath.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? "page" : undefined}
                        className={`block rounded-lg px-4 py-3 text-xl font-bold tracking-wide transition-colors ${
                          isActive
                            ? "bg-[var(--color-blush)] text-[var(--color-terracotta)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] hover:text-[var(--color-terracotta)]"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
