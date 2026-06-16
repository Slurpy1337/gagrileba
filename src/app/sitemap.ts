import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { site } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.blogPost.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ]);
  const staticRoutes = [
    "",
    "/products",
    "/air-conditioners",
    "/gas-boilers",
    "/heaters",
    "/water-heaters",
    "/accessories",
    "/installation",
    "/calculator",
    "/contact",
    "/about",
    "/blog",
    "/delivery",
    "/warranty",
    "/returns",
    "/privacy",
    "/terms",
  ];
  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" || route === "/products" ? "daily" as const : "weekly" as const,
      priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
    })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
