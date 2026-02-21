import type { UiKey } from "@i18n/ui";

export interface NavItem {
  labelKey: UiKey;
  href: {
    ro: string;
    en: string;
  };
}

export const navItems: NavItem[] = [
  {
    labelKey: "nav.home",
    href: { ro: "/", en: "/en/" },
  },
  {
    labelKey: "nav.story",
    href: { ro: "/povestea-mea", en: "/en/my-story" },
  },
  {
    labelKey: "nav.products",
    href: { ro: "/produse", en: "/en/products" },
  },
  {
    labelKey: "nav.blog",
    href: { ro: "/blog", en: "/en/blog" },
  },
];
