import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { listGuides } from "@/lib/engine";
import { POSTS } from "@/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${BRAND.domain}`;
  const now = new Date();

  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/analyze", priority: 0.9, freq: "monthly" },
    { path: "/pricing", priority: 0.9, freq: "monthly" },
    { path: "/for-recruiters", priority: 0.8, freq: "monthly" },
    { path: "/salaries", priority: 0.8, freq: "weekly" },
    { path: "/blog", priority: 0.7, freq: "weekly" },
    { path: "/about", priority: 0.5, freq: "yearly" },
    { path: "/help", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "yearly" },
    { path: "/privacy", priority: 0.4, freq: "yearly" },
    { path: "/terms", priority: 0.4, freq: "yearly" },
    { path: "/auth/signin", priority: 0.4, freq: "yearly" },
    { path: "/auth/signup", priority: 0.4, freq: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const guideEntries: MetadataRoute.Sitemap = listGuides().map((g) => ({
    url: `${base}/salaries/${g.slug}`,
    lastModified: new Date(g.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...guideEntries, ...postEntries];
}
