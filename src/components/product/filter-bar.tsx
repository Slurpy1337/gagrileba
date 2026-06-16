import { Search } from "lucide-react";
import { roomRanges } from "@/lib/content";
import { getI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export async function FilterBar({ brands, categories, category }: { brands: { slug: string; name: string }[]; categories: { slug: string; name: string }[]; category?: string }) {
  const { t } = await getI18n();
  return (
    <form className="grid gap-3 rounded-[22px] border border-[#0ea5e9]/18 bg-white/95 p-4 shadow-[0_18px_45px_rgba(14,165,233,0.12)] md:grid-cols-4 lg:grid-cols-6">
      <label className="md:col-span-2">
        <span className="sr-only">{t.filter.search}</span>
        <div className="flex items-center gap-2 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
          <Search size={17} className="text-[#0ea5e9]" />
          <input name="q" placeholder={t.filter.searchPlaceholder} className="h-11 w-full outline-none" />
        </div>
      </label>
      <select name="category" defaultValue={category ?? ""} className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
        <option value="">{t.filter.allCategories}</option>
        {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
      </select>
      <select name="brand" className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
        <option value="">{t.filter.allBrands}</option>
        {brands.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
      </select>
      <select name="area" className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
        <option value="">{t.filter.area}</option>
        {roomRanges.map((item) => <option key={item.label} value={`${item.min}-${item.max}`}>{item.label}</option>)}
      </select>
      <select name="sort" className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
        <option value="">{t.filter.recommended}</option>
        <option value="price-asc">{t.filter.priceAsc}</option>
        <option value="price-desc">{t.filter.priceDesc}</option>
        <option value="best">{t.filter.best}</option>
        <option value="newest">{t.filter.newest}</option>
      </select>
      <input name="minPrice" placeholder={t.filter.minPrice} className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4" />
      <input name="maxPrice" placeholder={t.filter.maxPrice} className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4" />
      <select name="inverter" className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
        <option value="">{t.filter.inverter}</option>
        <option value="true">{t.filter.yes}</option>
        <option value="false">{t.filter.no}</option>
      </select>
      <select name="stock" className="h-11 rounded-full border border-[#0ea5e9]/24 bg-[#f0f9ff] px-4">
        <option value="">{t.filter.availability}</option>
        <option value="in">{t.filter.inStock}</option>
      </select>
      <Button type="submit" className="md:col-span-2">{t.filter.submit}</Button>
    </form>
  );
}
