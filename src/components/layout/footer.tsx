import Link from "next/link";
import Image from "next/image";
import { categoryLinks, site } from "@/lib/content";
import { getI18n } from "@/lib/i18n";

export async function Footer() {
  const { t } = await getI18n();
  return (
    <footer className="bg-[#0ea5e9] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <Image src="/brand/gagrileba-logo.png" alt={site.name} width={190} height={70} className="h-auto w-44 brightness-0 invert" />
          <p className="mt-4 text-sm text-white/78">{t.footer.text}</p>
        </div>
        <div>
          <h3 className="font-bold">{t.footer.categories}</h3>
          <div className="mt-3 grid gap-2 text-sm text-white/78">
            {categoryLinks.map((item) => {
              const translated = t.categories[item.slug as keyof typeof t.categories];
              return <Link key={item.href} href={item.href}>{translated?.name ?? item.name}</Link>;
            })}
          </div>
        </div>
        <div>
          <h3 className="font-bold">{t.footer.policies}</h3>
          <div className="mt-3 grid gap-2 text-sm text-white/78">
            <Link href="/delivery">{t.footer.delivery}</Link>
            <Link href="/warranty">{t.footer.warranty}</Link>
            <Link href="/returns">{t.footer.returns}</Link>
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">{t.footer.contact}</h3>
          <p className="mt-3 text-sm text-white/78">{site.phone}</p>
          <p className="text-sm text-white/78">{site.email}</p>
          <p className="text-sm text-white/78">{site.address}</p>
        </div>
      </div>
    </footer>
  );
}
