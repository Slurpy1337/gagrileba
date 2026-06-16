import type { Metadata } from "next";
import { FilterBar } from "@/components/product/filter-bar";
import { ProductCard } from "@/components/product/product-card";
import { LeadForm } from "@/components/forms/lead-form";
import { getProducts, getStorefrontFacets, type ProductFilters } from "@/lib/data/products";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "კონდიციონერები და HVAC პროდუქტები",
  description: "შეარჩიეთ კონდიციონერები, წყლის გამაცხელებლები და HVAC აქსესუარები ფასით, მარაგით, გარანტიითა და მონტაჟის შესაძლებლობით.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "კონდიციონერები და HVAC პროდუქტები | Gagrileba.ge",
    description: "პროდუქტები ოფიციალური გარანტიით, სწრაფი მიწოდებითა და პროფესიონალური მონტაჟით.",
    url: "/products",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { t } = await getI18n();
  const params = await searchParams;
  const filters: ProductFilters = {
    q: params.q,
    category: params.category,
    brand: params.brand,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    area: params.area,
    btu: params.btu,
    inverter: params.inverter,
    stock: params.stock,
    installation: params.installation,
    sort: params.sort,
  };
  const [products, facets] = await Promise.all([getProducts(filters), getStorefrontFacets()]);
  return (
    <section className="section">
      <div className="container">
        <h1 className="text-4xl font-black">{t.productsPage.title}</h1>
        <p className="mt-3 max-w-2xl text-[#075985]">{t.productsPage.intro}</p>
        <div className="mt-7"><FilterBar brands={facets.brands} categories={facets.categories} category={filters.category} /></div>
        {products.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">{t.productsPage.emptyTitle}</h2>
            <p className="mt-2 text-slate-600">{t.productsPage.emptyText}</p>
            <div className="mt-5"><LeadForm source="empty_search" compact labels={t.lead} /></div>
          </div>
        )}
      </div>
    </section>
  );
}
