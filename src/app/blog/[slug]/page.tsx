import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  return post
    ? {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
          title: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
          type: "article",
          images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
        },
      }
    : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();
  return (
    <article className="section bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ])),
        }}
      />
      <div className="container max-w-3xl"><h1 className="text-4xl font-black">{post.title}</h1><p className="mt-4 text-lg text-slate-600">{post.excerpt}</p><div className="mt-8 whitespace-pre-line leading-8 text-slate-700">{post.body}</div></div>
    </article>
  );
}
