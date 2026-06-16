import type { Brand, Category, Product, ProductImage, ProductSpec } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/admin/actions";
import { ProductImageEditor } from "@/components/admin/product-image-editor";

type ProductWithChildren = Product & { images?: ProductImage[]; specs?: ProductSpec[] };

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  brands: Brand[];
  categories: Category[];
  product?: ProductWithChildren;
};

const input = "h-11 rounded-lg border border-[#0ea5e9]/24 bg-white px-3 text-sm outline-none focus:border-[#0ea5e9]";
const area = "min-h-28 rounded-lg border border-[#0ea5e9]/24 bg-white p-3 text-sm outline-none focus:border-[#0ea5e9]";
const label = "grid gap-1 text-sm font-bold text-slate-700";

function value(inputValue: unknown) {
  return inputValue == null ? "" : String(inputValue);
}

export function ProductForm({ action, brands, categories, product }: Props) {
  const specs = product?.specs?.map((spec) => `${spec.key} | ${spec.value}${spec.group ? ` | ${spec.group}` : ""}`).join("\n") ?? "";
  const deleteAction = product ? deleteProduct.bind(null, product.id) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <form id="product-form" action={action} className="grid gap-5">
        <section className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
          <h2 className="text-xl font-black">Basic Info</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={label}>Name<input name="name" required defaultValue={product?.name} className={input} /></label>
            <label className={label}>Slug<input name="slug" required defaultValue={product?.slug} className={input} /></label>
            <label className={label}>Model<input name="model" required defaultValue={product?.model} className={input} /></label>
            <label className={label}>SKU<input name="sku" required defaultValue={product?.sku} className={input} /></label>
            <label className={label}>Brand<select name="brandId" required defaultValue={product?.brandId} className={input}>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
            <label className={label}>Category<select name="categoryId" required defaultValue={product?.categoryId} className={input}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className={`${label} md:col-span-2`}>Short description<textarea name="shortDescription" required defaultValue={product?.shortDescription} className={area} /></label>
            <label className={`${label} md:col-span-2`}>Full description<textarea name="description" required defaultValue={product?.description} className="min-h-44 rounded-lg border border-[#0ea5e9]/24 bg-white p-3 text-sm outline-none focus:border-[#0ea5e9]" /></label>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
          <h2 className="text-xl font-black">Price And Stock</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className={label}>Price<input name="price" required inputMode="decimal" defaultValue={value(product?.price)} className={input} /></label>
            <label className={label}>Old price<input name="oldPrice" inputMode="decimal" defaultValue={value(product?.oldPrice)} className={input} /></label>
            <label className={label}>Cost price<input name="costPrice" inputMode="decimal" defaultValue={value(product?.costPrice)} className={input} /></label>
            <label className={label}>Stock<input name="stock" required inputMode="numeric" defaultValue={value(product?.stock ?? 0)} className={input} /></label>
            <label className={label}>Warranty months<input name="warrantyMonths" inputMode="numeric" defaultValue={value(product?.warrantyMonths ?? 24)} className={input} /></label>
            <label className={label}>Status<select name="status" defaultValue={product?.status ?? "draft"} className={input}><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></label>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
          <h2 className="text-xl font-black">Technical Data</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className={label}>Area min<input name="recommendedAreaMin" inputMode="numeric" defaultValue={value(product?.recommendedAreaMin)} className={input} /></label>
            <label className={label}>Area max<input name="recommendedAreaMax" inputMode="numeric" defaultValue={value(product?.recommendedAreaMax)} className={input} /></label>
            <label className={label}>BTU<input name="btu" inputMode="numeric" defaultValue={value(product?.btu)} className={input} /></label>
            <label className={label}>kW<input name="kw" inputMode="decimal" defaultValue={value(product?.kw)} className={input} /></label>
            <label className={label}>Energy class<input name="energyClass" defaultValue={value(product?.energyClass)} className={input} /></label>
            <label className={label}>Inverter<select name="inverter" defaultValue={product?.inverter == null ? "" : String(product.inverter)} className={input}><option value="">unknown</option><option value="true">yes</option><option value="false">no</option></select></label>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
          <h2 className="text-xl font-black">Images</h2>
          <div className="mt-4">
            <ProductImageEditor productName={product?.name} mainImageUrl={product?.mainImageUrl} images={product?.images ?? []} />
          </div>
        </section>

        <section className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
          <h2 className="text-xl font-black">Source, Specs And SEO</h2>
          <div className="mt-4 grid gap-4">
            <label className={label}>Source provider<input name="sourceProvider" defaultValue={value(product?.sourceProvider ?? "")} placeholder="midea, technoshop, manual" className={input} /></label>
            <label className={label}>Source URL<input name="sourceUrl" defaultValue={value(product?.sourceUrl)} className={input} /></label>
            {product?.sourceLastSyncedAt ? <p className="text-xs font-bold text-slate-500">Last source sync: {product.sourceLastSyncedAt.toISOString()} / {product.sourcePriceStatus ?? "unknown"}</p> : null}
            <label className={label}>Specifications<textarea name="specs" defaultValue={specs} placeholder="Power | 12000 BTU | Main" className={area} /></label>
            <label className={label}>SEO title<input name="seoTitle" defaultValue={value(product?.seoTitle)} className={input} /></label>
            <label className={label}>SEO description<textarea name="seoDescription" defaultValue={value(product?.seoDescription)} className={area} /></label>
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border border-[#0ea5e9]/16 bg-white/92 p-3 shadow-xl backdrop-blur">
          <Button size="lg">Save product</Button>
        </div>
      </form>

      <aside className="grid content-start gap-4">
        <div className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
          <h2 className="font-black">Publishing</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
            <label className="flex items-center gap-2"><input name="isFeatured" form="product-form" type="checkbox" defaultChecked={product?.isFeatured} /> Featured</label>
            <label className="flex items-center gap-2"><input name="isBestSeller" form="product-form" type="checkbox" defaultChecked={product?.isBestSeller} /> Bestseller</label>
            <label className="flex items-center gap-2"><input name="installationAvailable" form="product-form" type="checkbox" defaultChecked={product?.installationAvailable ?? true} /> Installation available</label>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Images, specs, prices, stock, SEO, source links, and publishing flags all save together.</p>
        </div>

        {deleteAction ? (
          <form action={deleteAction} className="rounded-[18px] border border-red-200 bg-white p-5">
            <h2 className="font-black text-red-700">Danger Zone</h2>
            <p className="mt-2 text-sm text-slate-600">Deleting removes the product, its images, and specs.</p>
            <Button variant="ghost" className="mt-4 text-red-700 hover:bg-red-50">Delete product</Button>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
