export const siteConfig = {
  name: "The Gifted Piggy",
  tagline: {
    ro: "Cadouri cu suflet, create cu dragoste",
    en: "Gifts with soul, made with love",
  },
  description: {
    ro: "The Gifted Piggy - Cadouri handmade create cu drag, pentru momentele speciale din viața ta.",
    en: "The Gifted Piggy - Handmade gifts crafted with love, for the special moments in your life.",
  },
  url: "https://thegiftedpiggy.com",
  defaultLocale: "ro",
  locales: ["ro", "en"],
  author: "The Gifted Piggy",
  contact: {
    email: "thegiftedpiggy@gmail.com",
    instagram: "https://instagram.com/thegiftedpiggy",
    facebook: "https://facebook.com/thegiftedpiggy",
  },
  social: {
    twitter: "@thegiftedpiggy",
  },
  ogImage: "/og-image.png",
  currency: "RON",
  currencyLocale: "ro-RO",
} as const;

export type SiteConfig = typeof siteConfig;
