import { site } from "@/lib/content";
import { fallbackImage } from "@/lib/content";

type ProductForJsonLd = {
  name: string;
  slug: string;
  price: unknown;
  currency: string;
  stock?: number | null;
  sku?: string | null;
  model?: string | null;
  mainImageUrl?: string | null;
  shortDescription?: string | null;
  description: string;
  brand: { name: string };
  category?: { name: string; slug: string } | null;
};

function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      localBusinessJsonLd(),
      websiteJsonLd(),
    ],
  };
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    alternateName: site.geName,
    url: site.url,
    logo: absoluteUrl("/brand/gagrileba-logo-circle.png"),
    image: absoluteUrl(fallbackImage),
    email: site.email,
    telephone: site.phone,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "customer service",
        areaServed: "GE",
        availableLanguage: ["ka", "en", "ru"],
      },
    ],
    sameAs: [site.messenger, site.whatsapp].filter(Boolean),
  };
}

export function localBusinessJsonLd() {
  return {
    "@type": "HVACBusiness",
    "@id": `${site.url}/#local-business`,
    name: site.name,
    alternateName: site.geName,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: absoluteUrl(fallbackImage),
    priceRange: "₾₾",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Tbilisi",
      addressCountry: "GE",
    },
    areaServed: [
      { "@type": "Country", name: "Georgia" },
      { "@type": "City", name: "Tbilisi" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    parentOrganization: { "@id": `${site.url}/#organization` },
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    inLanguage: ["ka-GE", "en", "ru"],
    publisher: { "@id": `${site.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: ProductForJsonLd) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/products/${product.slug}#product`,
    name: product.name,
    brand: { "@type": "Brand", name: product.brand.name },
    category: product.category?.name,
    sku: product.sku ?? undefined,
    model: product.model ?? undefined,
    image: absoluteUrl(product.mainImageUrl || fallbackImage),
    description: product.description,
    offers: {
      "@type": "Offer",
      url: `${site.url}/products/${product.slug}`,
      priceCurrency: product.currency,
      price: String(product.price),
      availability: product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${site.url}/#organization` },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/installation#service`,
    name: "Air conditioner installation in Georgia",
    serviceType: "HVAC installation",
    provider: { "@id": `${site.url}/#local-business` },
    areaServed: [{ "@type": "City", name: "Tbilisi" }, { "@type": "Country", name: "Georgia" }],
    offers: {
      "@type": "Offer",
      priceCurrency: "GEL",
      availability: "https://schema.org/InStock",
      url: `${site.url}/installation`,
    },
  };
}

export function articleJsonLd(post: { title: string; slug: string; excerpt: string; coverImageUrl?: string | null; author?: string | null; publishedAt?: Date | null; updatedAt: Date }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.coverImageUrl || fallbackImage),
    author: { "@type": "Organization", name: post.author || site.name },
    publisher: { "@id": `${site.url}/#organization` },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
