import type { Metadata } from "next";
import type { SiteSettings } from "@/app/types/homepage";

// Generate dynamic metadata for homepage
export function generateHomepageMetadata(
  settings?: SiteSettings | null
): Metadata {
  const title = settings?.hero_title || "Find Local Businesses";
  const description =
    settings?.hero_description ||
    "Find local businesses across America. From local outlets to major retailers, discover discounted products and services with minor cosmetic damage in all 50 states.";
  const siteName = settings?.directory_name || "Local Business Directory";

  return {
    title: `${title} | ${siteName}`,
    description: description,
    keywords: [
      "local businesses",
      "business directory",
      "scratch and dent",
      "discount appliances",
      "appliance stores",
      "damaged goods",
      "factory seconds",
      "warehouse stores",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    openGraph: {
      title: `${title} | ${siteName}`,
      description: description,
      siteName: siteName,
      locale: "en_US",
      type: "website",
      images: settings?.logo_url
        ? [
            {
              url: settings.logo_url,
              width: 1200,
              height: 630,
              alt: siteName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description: description,
      images: settings?.logo_url ? [settings.logo_url] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_SITE_VERIFICATION,
      other: {
        "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
      },
    },
  };
}

// Generate JSON-LD structured data for local business directory
export function generateLocalBusinessDirectorySchema(
  settings?: SiteSettings | null,
  stats?: {
    totalBusinesses: number;
    statesCovered: number;
    citiesCovered: number;
  }
) {
  const siteName = settings?.directory_name || "Local Business Directory";
  const description =
    settings?.hero_description ||
    "Find local businesses across America. From local outlets to major retailers, discover discounted products and services with minor cosmetic damage in all 50 states.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description: description,
    url:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://example.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${typeof window !== "undefined" ? window.location.origin : "https://example.com"}/browse-states?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Local Business Directory",
      description: "Directory of local businesses across the United States",
      numberOfItems: stats?.totalBusinesses || 0,
      itemListElement: {
        "@type": "LocalBusiness",
        name: "Business Listings",
        description: `Find businesses in ${stats?.statesCovered || 50} states and ${stats?.citiesCovered || 0} cities`,
        areaServed: {
          "@type": "Country",
          name: "United States",
        },
      },
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: settings?.logo_url
        ? {
            "@type": "ImageObject",
            url: settings.logo_url,
          }
        : undefined,
    },
  };

  return JSON.stringify(schema);
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
}

// Generate FAQ schema
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(schema);
}

// Generate organization schema
export function generateOrganizationSchema(settings?: SiteSettings | null) {
  const siteName = settings?.directory_name || "Local Business Directory";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://example.com",
    logo: settings?.logo_url
      ? {
          "@type": "ImageObject",
          url: settings.logo_url,
        }
      : undefined,
    sameAs: [
      // Add social media links when available
    ],
  };

  return JSON.stringify(schema);
}

// SEO utility functions
export const seoUtils = {
  // Clean and format meta description
  formatMetaDescription: (text: string, maxLength: number = 160): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3).trim() + "...";
  },

  // Generate canonical URL
  generateCanonicalUrl: (path: string = ""): string => {
    if (typeof window === "undefined") return `https://example.com${path}`;
    return `${window.location.origin}${path}`;
  },

  // Generate alt text for images
  generateImageAlt: (siteName: string, context: string = ""): string => {
    return `${siteName}${context ? ` - ${context}` : ""} logo`;
  },

  // Validate and clean URL
  validateUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};
