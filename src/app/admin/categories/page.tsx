import { createCategory } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const field = "h-11 rounded-lg border border-[#0ea5e9]/24 px-3 text-sm";

export default async function CategoriesPage() {
  const items = await prisma.category.findMany({ where: { slug: { not: "gas-boilers" } }, include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-black">კატეგორიები</h1>
      <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <h2 className="font-black">ახალი კატეგორია</h2>
          <form action={createCategory} className="mt-4 grid gap-3">
            <input name="name" required placeholder="სახელი" className={field} />
            <input name="slug" placeholder="slug" className={field} />
            <input name="imageUrl" placeholder="სურათის URL" className={field} />
            <textarea name="description" placeholder="აღწერა" className="min-h-24 rounded-lg border border-[#0ea5e9]/24 p-3 text-sm" />
            <input name="seoTitle" placeholder="SEO სათაური" className={field} />
            <textarea name="seoDescription" placeholder="SEO აღწერა" className="min-h-20 rounded-lg border border-[#0ea5e9]/24 p-3 text-sm" />
            <Button>დამატება</Button>
          </form>
        </Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <h2 className="font-black">{item.name}</h2>
              <p className="text-sm text-slate-600">{item.slug}</p>
              <p className="mt-3 text-sm font-bold text-[#0369a1]">{item._count.products} პროდუქტი</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
