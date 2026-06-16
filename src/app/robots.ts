import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/gagrileba-admin", "/api", "/checkout", "/cart"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/gagrileba-admin", "/api", "/checkout", "/cart"] },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
