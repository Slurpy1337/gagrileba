import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/actions";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { slug: { not: "gas-boilers" } }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black">ახალი პროდუქტი</h1>
      <p className="mt-2 text-sm text-slate-600">დაამატე პროდუქტი სრული ფასით, მარაგით, სურათებით, სპეციფიკაციებით და SEO-თი.</p>
      <div className="mt-6"><ProductForm action={createProduct} brands={brands} categories={categories} /></div>
    </div>
  );
}
