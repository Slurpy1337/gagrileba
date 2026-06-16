import Link from "next/link";
import Image from "next/image";
import { Gift, Grid2X2, Phone, Search, ShoppingCart } from "lucide-react";
import { site } from "@/lib/content";
import { getI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LinkButton } from "@/components/ui/button";

export async function Header() {
  const { locale, t } = await getI18n();
  const quickNav = [
    { href: "/products", label: t.header.promo, Icon: Gift },
    { href: "/products", label: t.header.products, Icon: Grid2X2 },
  ];
  const nav = [
    { href: "/air-conditioners", label: t.nav.conditioners },
    { href: "/accessories", label: t.nav.accessories },
    { href: "/calculator", label: t.nav.picker },
    { href: "/blog", label: t.nav.guides },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#0ea5e9]/12 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1240px] px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-fit items-center gap-3">
            <Image src="/brand/gagrileba-logo-circle.png" alt={site.name} width={46} height={46} className="h-11 w-11 rounded-full object-contain" priority />
            <span className="text-xl font-black tracking-wide text-[#0369a1]">{t.brandName}</span>
          </Link>

          <form action="/products" className="hidden h-12 max-w-xl flex-1 items-center rounded-2xl bg-[#f1f5f9] px-4 ring-1 ring-[#0ea5e9]/12 transition focus-within:bg-white focus-within:ring-[#0ea5e9] lg:flex">
            <input name="q" placeholder={t.header.search} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#0f172a] outline-none placeholder:text-slate-400" />
            <button aria-label={t.header.searchLabel} className="text-slate-500 transition hover:text-[#0ea5e9]"><Search size={21} /></button>
          </form>

          <div className="flex min-w-fit items-center justify-end gap-2 md:gap-3">
            <Link href={`tel:${site.phone}`} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[#0369a1] transition hover:bg-[#e0f2fe] xl:flex">
              <Phone size={18} /> {t.header.contact}
            </Link>
            <LanguageSwitcher active={locale} />
            <Link href="/cart" aria-label={t.header.cart} className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#0369a1] transition hover:bg-[#e0f2fe]">
              <ShoppingCart size={21} />
            </Link>
            <LinkButton href="/products" className="hidden px-6 sm:inline-flex">{t.header.buy}</LinkButton>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
          {quickNav.map(({ href, label, Icon }) => (
            <Link key={label} href={href} className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-[#0ea5e9] transition hover:bg-[#e0f2fe]">
              <Icon size={17} /> {label}
            </Link>
          ))}
          <nav className="flex min-w-max items-center gap-6 pl-2">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-black text-slate-500 transition hover:text-[#0ea5e9]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
