import { MetadataRoute } from "next";
import { locales } from "@/lib/locale";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const pages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "privacy", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "terms", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return pages.flatMap((page) => {
    const entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${page.path ? `/${page.path}` : ""}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}${page.path ? `/${page.path}` : ""}`])),
        },
      });
    }

    return entries;
  });
}
