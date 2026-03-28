import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DK Agency",
    short_name: "DK",
    description: "HoReCa media, toolkit ve marketplace platformasi",
    start_url: "/",
    display: "standalone",
    background_color: "var(--dk-night)",
    theme_color: "var(--dk-night)",
    lang: "az",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
