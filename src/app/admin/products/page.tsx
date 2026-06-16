import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatGel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { brand: true, category: true }, orderBy: [{ status: "asc" }, { updatedAt: "desc" }] });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">პროდუქტები</h1>
          <p className="mt-2 text-sm text-slate-600">{products.length} პროდუქტი კატალოგში</p>
        </div>
        <LinkButton href="/admin/products/new">პროდუქტის დამატება</LinkButton>
      </div>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#f0f9ff] text-[#0369a1]">
              <tr><th className="p-3">პროდუქტი</th><th>კატეგორია</th><th>ფასი</th><th>მარაგი</th><th>სტატუსი</th><th>ნიშნები</th><th className="pr-3 text-right">ქმედება</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-[#0ea5e9]/10">
                  <td className="p-3">
                    <Link href={`/admin/products/${product.id}`} className="font-black text-[#0369a1]">{product.brand.name} {product.model}</Link>
                    <p className="text-xs text-slate-500">{product.name}</p>
                  </td>
                  <td>{product.category.name}</td>
                  <td>{formatGel(product.price)}</td>
                  <td><span className={product.stock <= 3 ? "font-black text-red-600" : "font-bold"}>{product.stock}</span></td>
                  <td><span className="rounded-full bg-[#e0f2fe] px-2 py-1 text-xs font-black text-[#0369a1]">{product.status}</span></td>
                  <td className="text-xs text-slate-600">{[product.isFeatured ? "featured" : "", product.isBestSeller ? "best" : ""].filter(Boolean).join(", ") || "-"}</td>
                  <td className="pr-3 text-right"><Link href={`/admin/products/${product.id}`} className="font-bold text-[#0ea5e9]">რედაქტირება</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
