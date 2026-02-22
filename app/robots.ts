import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://dkagency.az/sitemap.xml",
    host: "https://dkagency.az",
  };
}
