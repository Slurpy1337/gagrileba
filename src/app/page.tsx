import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck, Truck, Wind, Wrench } from "lucide-react";
import { HeroCalculator } from "@/components/home/hero-calculator";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { categoryLinks, roomRanges } from "@/lib/content";
import { getBestSellers } from "@/lib/data/products";
import { getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "კონდიციონერები, მონტაჟი და HVAC მაღაზია საქართველოში",
  description: "Gagrileba.ge გეხმარებათ კონდიციონერის შერჩევაში, ყიდვაში, მიწოდებასა და პროფესიონალურ მონტაჟში. ხელმისაწვდომია BOG გადახდა და განვადება.",
  alternates: { canonical: "/" },
};

const trustIcons = [Truck, BadgeCheck, ShieldCheck, CreditCard];

const categoryImages: Record<string, string> = {
  "air-conditioners": "/brand/home/category-conditioners-simple.png",
  installation: "/brand/home/category-installation-simple.png",
  accessories: "/brand/home/category-accessories-simple.png",
};

export default async function HomePage() {
  const { t } = await getI18n();
  const bestSellers = await getBestSellers();

  return (
    <>
      <section className="bg-white pb-10 pt-6">
        <div className="container">
          <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(115deg,#0369a1_0%,#0ea5e9_48%,#38bdf8_100%)] px-6 py-8 shadow-[0_28px_90px_rgba(14,165,233,0.25)] md:px-10 lg:min-h-[520px] lg:px-16 lg:py-14">
            <div className="absolute inset-0 opacity-20 [background:linear-gradient(135deg,transparent_0_38%,#ffffff_38%_40%,transparent_40%_58%,#ffffff_58%_60%,transparent_60%)]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[370px_1fr]">
              <HeroCalculator labels={t.calculator} />
              <div className="relative flex min-h-[300px] items-center lg:min-h-[390px]">
                <div className="relative z-10 max-w-2xl text-white">
                  <p className="text-sm font-black uppercase text-white/78">{t.home.eyebrow}</p>
                  <h1 className="mt-3 text-4xl font-black leading-[1.1] md:text-5xl xl:text-[52px]">{t.home.title}</h1>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">{t.home.subtitle}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <LinkButton href="/air-conditioners" size="lg" className="bg-white px-7 text-[#0369a1] hover:bg-[#f0f9ff]">{t.home.conditioners}</LinkButton>
                    <LinkButton href="/installation" variant="outline" size="lg" className="border-white/45 bg-white/10 px-7 text-white hover:bg-white/20">{t.home.installation}</LinkButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#0ea5e9]/20 bg-white">
        <div className="container grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.trust.map((label, index) => {
            const Icon = trustIcons[index] ?? Truck;
            return (
            <div key={label} className="flex items-center gap-3 rounded-full bg-[#e0f2fe] px-5 py-4 text-sm font-black text-[#0369a1] shadow-sm ring-1 ring-[#0ea5e9]/10">
              <Icon size={19} className="text-[#0ea5e9]" />
              {label}
            </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-black uppercase text-[#0ea5e9]">{t.home.productsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">{t.home.chooseDirection}</h2>
            </div>
            <LinkButton href="/products" variant="outline">{t.home.allProducts}</LinkButton>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {categoryLinks.map((item) => {
              const translated = t.categories[item.slug as keyof typeof t.categories];
              return (
              <a key={item.href} href={item.href} className="group relative min-h-[240px] overflow-hidden rounded-[18px] bg-[#e0f2fe] shadow-sm ring-1 ring-[#0ea5e9]/16 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0ea5e9]/12">
                <Image src={categoryImages[item.slug] ?? "/brand/home/category-conditioners.png"} alt={translated?.name ?? item.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/72 via-[#0369a1]/18 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/18 backdrop-blur">
                    {item.href.includes("installation") ? <Wrench size={21} /> : <Wind size={21} />}
                  </div>
                  <h3 className="text-xl font-black">{translated?.name ?? item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/78">{translated?.desc ?? item.desc}</p>
                </div>
              </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="mb-9 flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-black uppercase text-[#0ea5e9]">{t.home.featured}</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">{t.home.bestsellers}</h2>
            </div>
            <LinkButton href="/products" variant="outline">{t.home.viewAll}</LinkButton>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase text-[#0ea5e9]">{t.home.roomArea}</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">{t.home.chooseSize}</h2>
            <p className="mt-5 max-w-xl leading-8 text-[#075985]">{t.home.sizeText}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roomRanges.map((range) => (
              <LinkButton key={range.label} href={`/products?area=${range.min}-${range.max}`} variant="outline" size="lg" className="justify-between">
                {range.label} <ArrowRight size={17} />
              </LinkButton>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
