import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: true,
  },
  output: "static",
  site: "https://thegiftedpiggy.com",
  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "ro",
        locales: {
          ro: "ro-RO",
          en: "en-US",
        },
      },
    }),
    robotsTxt({
      sitemap: "https://thegiftedpiggy.com/sitemap-index.xml",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  i18n: {
    defaultLocale: "ro",
    locales: ["ro", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
});
