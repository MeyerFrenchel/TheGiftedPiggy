CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  price numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'RON',
  image_url text,
  image_alt text,
  category text,
  tags text[] DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (featured);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_in_stock_idx ON public.products (in_stock);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
