import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "HVAC გიდები და რჩევები",
  description: "გიდები კონდიციონერის შერჩევაზე, BTU სიმძლავრეზე, მონტაჟზე, გათბობაზე, მოვლასა და ენერგოეფექტურობაზე.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const { t } = await getI18n();
  const posts = await prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" } });
  return (
    <section className="section">
      <div className="container">
        <h1 className="text-4xl font-black">{t.blogPage.title}</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">{posts.map((post) => <Card key={post.id} className="p-5"><Link href={`/blog/${post.slug}`} className="text-xl font-black hover:text-[#0ea5e9]">{post.title}</Link><p className="mt-3 text-slate-600">{post.excerpt}</p></Card>)}</div>
      </div>
    </section>
  );
}
