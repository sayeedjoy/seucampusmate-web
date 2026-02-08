export interface OrganizationStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    "@type": string;
    contactType: string;
    email: string;
  };
  address: {
    "@type": string;
    addressCountry: string;
    addressLocality: string;
  };
}

export interface WebSiteStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  potentialAction: {
    "@type": string;
    target: {
      "@type": string;
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface WebApplicationStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
  };
  author: {
    "@type": string;
    name: string;
  };
}

export interface BreadcrumbStructuredData {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

// Organization structured data
export function getOrganizationStructuredData(): OrganizationStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SEU CampusMate",
    description: "A comprehensive student companion app for Southeast University offering academic tools, calculators, and campus resources.",
    url: "https://campusmate.app",
    logo: "https://campusmate.app/logo.webp",
    sameAs: [
      "https://github.com/seu-campusmate",
      "https://discord.gg/seu-campusmate"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@campusmate.app"
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
      addressLocality: "Dhaka"
    }
  };
}

// Website structured data with search action
export function getWebSiteStructuredData(): WebSiteStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SEU CampusMate",
    description: "Ultimate tool for SEU Students - CGPA calculator, attendance tracker, exam routine, and more academic tools.",
    url: "https://campusmate.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://campusmate.app/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// Web application structured data
export function getWebApplicationStructuredData(): WebApplicationStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SEU CampusMate",
    description: "A student companion app for Southeast University offering class routine widgets, CGPA and attendance calculators, faculty reviews, forums, and academic tools.",
    url: "https://campusmate.app",
    applicationCategory: "EducationApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    author: {
      "@type": "Organization",
      name: "SEU CampusMate Team"
    }
  };
}

// Breadcrumb structured data
export function getBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): BreadcrumbStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Software application structured data for tools
export function getSoftwareApplicationStructuredData(toolName: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: toolName,
    description: description,
    url: url,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    author: {
      "@type": "Organization",
      name: "SEU CampusMate Team"
    }
  };
}
