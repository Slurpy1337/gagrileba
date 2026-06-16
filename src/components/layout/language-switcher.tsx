"use client";

import { usePathname, useSearchParams } from "next/navigation";

const labels = [
  { locale: "ka", label: "GE" },
  { locale: "en", label: "EN" },
  { locale: "ru", label: "RU" },
];

export function LanguageSwitcher({ active }: { active: string }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const next = `${pathname}${query ? `?${query}` : ""}`;

  return (
    <div className="flex items-center rounded-full bg-[#f1f5f9] p-1 ring-1 ring-[#0ea5e9]/12">
      {labels.map((item) => (
        <a
          key={item.locale}
          href={`/api/locale?locale=${item.locale}&next=${encodeURIComponent(next)}`}
          className={`flex h-8 items-center rounded-full px-3 text-xs font-black transition ${active === item.locale ? "bg-[#0ea5e9] text-white shadow-sm" : "text-[#0369a1] hover:bg-white"}`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
