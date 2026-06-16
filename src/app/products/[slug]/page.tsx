import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { fallbackImage } from "@/lib/content";
import { getProductBySlug, getProducts } from "@/lib/data/products";
import { getI18n } from "@/lib/i18n";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { formatGel, monthly } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `/products/${product.slug}`,
      type: "website",
      images: [product.mainImageUrl || fallbackImage],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = await getI18n();
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getProducts({ category: product.category.slug });
  const areaLabel =
    product.recommendedAreaMin && product.recommendedAreaMax
      ? `${product.recommendedAreaMin}-${product.recommendedAreaMax} m²`
      : t.common.agreed;
  const powerLabel = product.btu ? `${product.btu} BTU` : product.kw ? `${product.kw} kW` : product.model;
  return (
    <section className="section bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: t.common.home, url: "/" },
            { name: product.category.name, url: `/${product.category.slug}` },
            { name: product.name, url: `/products/${product.slug}` },
          ])),
        }}
      />
      <div className="container">
        <div className="mb-5 text-sm text-slate-500">{t.common.home} / {product.category.name} / {product.name}</div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="grid gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <Image src={product.mainImageUrl || fallbackImage} alt={product.name} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image) => <div key={image.id} className="relative aspect-square overflow-hidden rounded-md bg-slate-100"><Image src={image.url} alt={image.alt} fill className="object-cover" /></div>)}
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase text-[#0ea5e9]">{product.brand.name} / {product.model}</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">{product.name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{product.shortDescription}</p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-end gap-3">
                <strong className="text-4xl text-slate-950">{formatGel(product.price)}</strong>
                {product.oldPrice ? <span className="text-lg text-slate-400 line-through">{formatGel(product.oldPrice)}</span> : null}
              </div>
              <p className="mt-1 font-bold text-[#0ea5e9]">{t.productDetail.monthly.replace("{price}", String(monthly(product.price)))}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span>{t.common.stock}: {product.stock > 0 ? t.productDetail.inStock : t.productDetail.preorder}</span>
                <span>{t.common.warranty}: {product.warrantyMonths} {t.common.month}</span>
                <span>{t.common.area}: {areaLabel}</span>
                <span>{t.common.power}: {powerLabel}</span>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <LinkButton href={`/checkout?product=${product.slug}`} size="lg"><ShoppingCart size={18} /> {t.common.buy}</LinkButton>
              <LinkButton href="/products" variant="outline" size="lg">{t.common.backToProducts}</LinkButton>
              {product.sourceUrl ? <LinkButton href={product.sourceUrl} variant="outline" size="lg"><ExternalLink size={18} /> {t.common.officialPage}</LinkButton> : null}
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_.8fr]">
          <div>
            <h2 className="text-2xl font-black">{t.common.description}</h2>
            <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">{product.description}</p>
            <h2 className="mt-8 text-2xl font-black">{t.common.included}</h2>
            <p className="mt-3 leading-8 text-slate-700">{t.productDetail.includedText}</p>
          </div>
          <div>
            <h2 className="text-2xl font-black">{t.common.specs}</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              {product.specs.map((spec) => <div key={spec.id} className="grid grid-cols-2 border-b border-slate-200 bg-white p-3 text-sm last:border-0"><strong>{spec.key}</strong><span>{spec.value}</span></div>)}
            </div>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="mb-5 text-2xl font-black">{t.common.related}</h2>
          <div className="grid gap-5 md:grid-cols-3">{related.filter((item) => item.slug !== product.slug).slice(0, 3).map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </div>
      </div>
    </section>
  );
}
