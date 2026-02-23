import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: true,
  },
  output: "hybrid",
  adapter: netlify(),
  site: "https://thegiftedpiggy.com",
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/admin/"),
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
    resolve: {
      alias: {
        "@lib": path.resolve(__dirname, "src/lib"),
      },
    },
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
