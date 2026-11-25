import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Dashboard routes require a session and aren't useful to crawlers.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/login`, lastModified: new Date() },
    { url: `${SITE_URL}/terms`, lastModified: new Date() },
    { url: `${SITE_URL}/privacy`, lastModified: new Date() },
  ];
}
