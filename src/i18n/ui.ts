export const languages = {
  ro: "Română",
  en: "English",
};

export const defaultLang = "ro";

export const ui = {
  ro: {
    // Navigation
    "nav.home": "Acasă",
    "nav.story": "Povestea Mea",
    "nav.products": "Produse",
    "nav.blog": "Blog",
    "nav.contact": "Contact",

    // Hero section
    "hero.tagline": "Cadouri cu suflet, create cu dragoste",
    "hero.subtitle":
      "Descoperă colecția noastră de produse handmade, create cu grijă pentru momentele speciale din viața ta.",
    "hero.cta.products": "Vezi Produsele",
    "hero.cta.story": "Povestea Mea",

    // Products
    "products.title": "Produsele Noastre",
    "products.subtitle": "Fiecare piesă este unică, creată cu drag și dedicație",
    "products.featured": "Produse Recomandate",
    "products.all": "Toate Produsele",
    "products.contact.cta": "Contactează-mă pentru a cumpăra",
    "products.contact.text":
      "Îți place ce vezi? Scrie-mi pentru detalii despre disponibilitate și comandă.",
    "products.price": "Preț",
    "products.inStock": "Disponibil",
    "products.outOfStock": "Momentan indisponibil",
    "products.category": "Categorie",

    // Blog
    "blog.title": "Blogul Meu",
    "blog.subtitle": "Povești, inspirație și idei din lumea cadourilor handmade",
    "blog.readMore": "Citește mai mult",
    "blog.latest": "Ultimele Articole",
    "blog.by": "de",
    "blog.publishedOn": "Publicat pe",
    "blog.updatedOn": "Actualizat pe",
    "blog.noArticles": "Nu există articole încă.",

    // Story page
    "story.title": "Povestea Mea",
    "story.subtitle": "Cum a început totul și de ce iubesc ceea ce fac",

    // Footer
    "footer.tagline": "Cadouri create cu inimă",
    "footer.rights": "Toate drepturile rezervate",
    "footer.madeWith": "Creat cu",
    "footer.contact": "Contact",
    "footer.followUs": "Urmărește-ne",
    "footer.links": "Link-uri Rapide",
    "footer.newsletter": "Abonează-te",
    "footer.newsletterText": "Primești idei de cadouri și noutăți direct în inbox.",
    "footer.newsletterPlaceholder": "Adresa ta de email",
    "footer.newsletterBtn": "Abonează-te",

    // Contact
    "contact.email": "Trimite un email",
    "contact.instagram": "Instagram",
    "contact.facebook": "Facebook",

    // General UI
    "ui.loading": "Se încarcă...",
    "ui.error": "A apărut o eroare",
    "ui.backToHome": "Înapoi acasă",
    "ui.backToBlog": "Înapoi la blog",
    "ui.backToProducts": "Înapoi la produse",
    "ui.language": "Limbă",
    "ui.theme.light": "Temă luminoasă",
    "ui.theme.dark": "Temă întunecată",
    "ui.theme.toggle": "Comută tema",
    "ui.openMenu": "Deschide meniu",
    "ui.closeMenu": "Închide meniu",
    "ui.scrollTop": "Mergi sus",

    // SEO
    "seo.defaultDescription":
      "The Gifted Piggy - Cadouri handmade create cu drag, pentru momentele speciale din viața ta.",
    "seo.siteName": "The Gifted Piggy",

    // 404
    "404.title": "Pagina nu a fost găsită",
    "404.message": "Ne pare rău, pagina pe care o cauți nu există.",
    "404.cta": "Înapoi acasă",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.story": "My Story",
    "nav.products": "Products",
    "nav.blog": "Blog",
    "nav.contact": "Contact",

    // Hero section
    "hero.tagline": "Gifts with soul, made with love",
    "hero.subtitle":
      "Discover our collection of handmade products, carefully crafted for the special moments in your life.",
    "hero.cta.products": "View Products",
    "hero.cta.story": "My Story",

    // Products
    "products.title": "Our Products",
    "products.subtitle": "Every piece is unique, created with love and dedication",
    "products.featured": "Featured Products",
    "products.all": "All Products",
    "products.contact.cta": "Contact me to purchase",
    "products.contact.text": "Like what you see? Write to me for availability details and ordering.",
    "products.price": "Price",
    "products.inStock": "In Stock",
    "products.outOfStock": "Currently unavailable",
    "products.category": "Category",

    // Blog
    "blog.title": "My Blog",
    "blog.subtitle": "Stories, inspiration and ideas from the world of handmade gifts",
    "blog.readMore": "Read more",
    "blog.latest": "Latest Articles",
    "blog.by": "by",
    "blog.publishedOn": "Published on",
    "blog.updatedOn": "Updated on",
    "blog.noArticles": "No articles yet.",

    // Story page
    "story.title": "My Story",
    "story.subtitle": "How it all began and why I love what I do",

    // Footer
    "footer.tagline": "Gifts made with heart",
    "footer.rights": "All rights reserved",
    "footer.madeWith": "Made with",
    "footer.contact": "Contact",
    "footer.followUs": "Follow Us",
    "footer.links": "Quick Links",
    "footer.newsletter": "Newsletter",
    "footer.newsletterText": "Get gift ideas and news directly in your inbox.",
    "footer.newsletterPlaceholder": "Your email address",
    "footer.newsletterBtn": "Subscribe",

    // Contact
    "contact.email": "Send an email",
    "contact.instagram": "Instagram",
    "contact.facebook": "Facebook",

    // General UI
    "ui.loading": "Loading...",
    "ui.error": "An error occurred",
    "ui.backToHome": "Back to home",
    "ui.backToBlog": "Back to blog",
    "ui.backToProducts": "Back to products",
    "ui.language": "Language",
    "ui.theme.light": "Light theme",
    "ui.theme.dark": "Dark theme",
    "ui.theme.toggle": "Toggle theme",
    "ui.openMenu": "Open menu",
    "ui.closeMenu": "Close menu",
    "ui.scrollTop": "Scroll to top",

    // SEO
    "seo.defaultDescription":
      "The Gifted Piggy - Handmade gifts crafted with love, for the special moments in your life.",
    "seo.siteName": "The Gifted Piggy",

    // 404
    "404.title": "Page not found",
    "404.message": "Sorry, the page you're looking for doesn't exist.",
    "404.cta": "Back to home",
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof (typeof ui)["ro"];
