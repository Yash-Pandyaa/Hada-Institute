export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Hada Institute",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Hada",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Official digital notes marketplace for a coaching institute. Replace this with verified institute copy before production launch.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  currency: "INR",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  address: process.env.NEXT_PUBLIC_INSTITUTE_ADDRESS || "",
  social: {
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  },
} as const;

export const marketplaceCopy = {
  placeholderNotice:
    "Placeholder catalog content is shown until official institute products are added in the admin dashboard.",
  noInventedContent:
    "Faculty names, achievements, branches, results, testimonials, and contact details are hidden until verified official data is configured.",
};
