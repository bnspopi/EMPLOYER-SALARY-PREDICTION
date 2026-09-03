import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = `https://${BRAND.domain}`;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
