import Link from "next/link";

const links = [
  ["/admin", "დაფა"],
  ["/admin/products", "პროდუქტები"],
  ["/admin/leads", "ლიდები"],
  ["/admin/orders", "შეკვეთები"],
  ["/admin/installations", "მონტაჟი"],
  ["/admin/categories", "კატეგორიები"],
  ["/admin/brands", "ბრენდები"],
  ["/admin/cms", "CMS"],
  ["/admin/settings", "პარამეტრები"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#0ea5e9]/16 bg-white p-5 lg:block">
        <Link href="/admin" className="text-xl font-black text-[#0369a1]">Gagrileba Admin</Link>
        <nav className="mt-8 grid gap-1">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-[#e0f2fe] hover:text-[#0369a1]">{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
