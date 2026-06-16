import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/app/admin/actions";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, specs: { orderBy: { sortOrder: "asc" } } } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { slug: { not: "gas-boilers" } }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="text-3xl font-black">{product.name}</h1>
      <p className="mt-2 text-sm text-slate-600">SKU: {product.sku}</p>
      <div className="mt-6"><ProductForm action={updateProduct.bind(null, product.id)} brands={brands} categories={categories} product={product} /></div>
    </div>
  );
}
