import Image from "next/image";
import { Eye, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { fallbackImage } from "@/lib/content";
import { getI18n } from "@/lib/i18n";
import { formatGel, monthly } from "@/lib/utils";

type Product = {
  name: string;
  slug: string;
  model: string;
  price: unknown;
  oldPrice?: unknown;
  stock: number;
  warrantyMonths: number;
  recommendedAreaMin?: number | null;
  recommendedAreaMax?: number | null;
  btu?: number | null;
  kw?: unknown | null;
  mainImageUrl?: string | null;
  brand: { name: string };
};

export async function ProductCard({ product }: { product: Product }) {
  const { t } = await getI18n();
  const areaLabel =
    product.recommendedAreaMin && product.recommendedAreaMax
      ? `${product.recommendedAreaMin}-${product.recommendedAreaMax} m²`
      : t.product.customArea;
  const powerLabel = product.btu ? `${product.btu} BTU` : product.kw ? `${product.kw} kW` : product.model;

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#e0f2fe]">
        <Image src={product.mainImageUrl || fallbackImage} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#0369a1] shadow-sm">{product.brand.name}</div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[#0ea5e9]">{product.model}</p>
            <h3 className="mt-1 line-clamp-2 min-h-10 text-base font-black text-[#0f172a]">{product.name}</h3>
          </div>
          <span className={product.stock > 0 ? "rounded-full bg-[#e0f2fe] px-2 py-1 text-xs font-bold text-[#0369a1]" : "rounded-full bg-white px-2 py-1 text-xs font-bold text-[#0369a1] ring-1 ring-[#0ea5e9]/25"}>
            {product.stock > 0 ? t.product.inStock : t.product.preorder}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#f0f9ff] p-3 text-xs text-[#075985]">
          <span>{areaLabel}</span>
          <span>{powerLabel}</span>
          <span>{product.warrantyMonths} {t.product.month}</span>
        </div>
        <div>
          <div className="flex items-end gap-2">
            <strong className="text-2xl text-[#0f172a]">{formatGel(product.price as string)}</strong>
            {product.oldPrice ? <span className="text-sm text-slate-400 line-through">{formatGel(product.oldPrice as string)}</span> : null}
          </div>
          <p className="text-sm font-semibold text-[#0ea5e9]">{t.product.monthly.replace("{price}", String(monthly(product.price as string)))}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <LinkButton href={`/products/${product.slug}`} variant="outline" size="sm"><Eye size={16} /> {t.product.view}</LinkButton>
          <LinkButton href={`/checkout?product=${product.slug}`} variant="primary" size="sm"><ShoppingCart size={16} /> {t.product.order}</LinkButton>
        </div>
      </div>
    </Card>
  );
}
