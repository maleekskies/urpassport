import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the pages that are actually public. /dashboard/* requires a session
// and isn't meaningful content to a crawler.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/login`, lastModified: new Date() },
    { url: `${SITE_URL}/terms`, lastModified: new Date() },
    { url: `${SITE_URL}/privacy`, lastModified: new Date() },
  ];
}
