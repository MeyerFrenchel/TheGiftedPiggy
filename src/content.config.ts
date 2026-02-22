import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      author: z.string().default("The Gifted Piggy"),
      lang: z.enum(["ro", "en"]).default("ro"),
    }),
});

const products = defineCollection({
  loader: file("./src/content/products/products.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      nameEn: z.string(),
      description: z.string(),
      descriptionEn: z.string(),
      price: z.number(),
      currency: z.string().default("RON"),
      image: z.string().optional(),
      imageAlt: z.string(),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      inStock: z.boolean().default(true),
    }),
});

export const collections = { blog, products };
