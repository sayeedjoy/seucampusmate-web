export const siteConfig = {
  name: "SEU CampusMate",
  shortName: "CampusMate",
  description:
    "A student companion app for Southeast University offering class routine widgets, CGPA and attendance calculators, faculty reviews, forums, and academic tools.",
  tagline: "Your Academic Companion",
  url: "https://campusmate.app",

  navLinks: [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "CP Leaderboard", href: "/cp" },
    { label: "Hackathons", href: "/hackathon" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] as const,

  quickLinks: [
    { href: "/tools/cgpa-calculator", label: "CGPA Calculator" },
    { href: "/tools/attendance-calculator", label: "Attendance Tracker" },
    { href: "/tools/question-bank", label: "Question Bank" },
    { href: "/tools/assessment-tracking", label: "Assessment Tracking" },
    { href: "/tools/coverpage", label: "Cover Page Generator" },
  ] as const,

  supportLinks: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
    { href: "/contact", label: "Help Center" },
    { href: "/contact", label: "Feedback" },
  ] as const,

  // Rendered in the footer "Legal" column. Kept here (not in the navbar) so Paddle's
  // domain review finds Pricing + the required policies "accessible via navigation".
  legalLinks: [
    { href: "/pricing", label: "Pricing" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/refund-policy", label: "Refund Policy" },
  ] as const,

  // ⚠️ PLACEHOLDERS — replace with your real business/legal details before submitting
  // to Paddle. The legal name must also appear in the Terms of Service.
  business: {
    legalName: "[YOUR LEGAL NAME / COMPANY NAME]",
    address: "[YOUR REGISTERED ADDRESS]",
    supportEmail: "[YOUR SUPPORT EMAIL]",
    phone: "[YOUR CONTACT PHONE]",
    governingLaw: "[YOUR JURISDICTION, e.g. Bangladesh]",
    // Pricing shown across the site — keep in sync with your Paddle catalog.
    priceMonthly: "[PRICE]",
    priceYearly: "[PRICE]",
    currency: "USD",
    refundWindowDays: "[N]",
  },

  social: {
    github: "https://github.com/sayeedjoy/seucampusmate-web",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    email: "mailto:contact@campusmate.com",
  },

  openGraph: {
    defaultImage: "/logo.webp",
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: "SEU CampusMate Logo",
  },
} as const;

export type SiteConfig = typeof siteConfig;
