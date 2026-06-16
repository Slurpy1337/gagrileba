import Link from "next/link";
import { MessageCircle, Phone, ShoppingCart, Send, ClipboardList } from "lucide-react";
import { site } from "@/lib/content";
import { getI18n } from "@/lib/i18n";

export async function MobileBar() {
  const { t } = await getI18n();
  const items = [
    { href: `tel:${site.phone}`, label: t.common.call, icon: Phone },
    { href: site.messenger, label: "Messenger", icon: MessageCircle },
    { href: site.whatsapp, label: "WhatsApp", icon: Send },
    { href: "/cart", label: t.header.cart, icon: ShoppingCart },
    { href: "/calculator", label: t.nav.picker, icon: ClipboardList },
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-700">
          <item.icon size={19} />
          {item.label}
        </Link>
      ))}
    </div>
  );
}
