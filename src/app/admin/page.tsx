import Link from "next/link";
import { AdminCharts } from "@/components/admin/dashboard-charts";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { getAdminStats } from "@/lib/data/admin";
import { formatGel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminStats();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">ადმინის დაფა</h1>
          <p className="mt-2 text-sm text-slate-600">სწრაფი სურათი გაყიდვებზე, ლიდებზე, მარაგსა და მონტაჟებზე.</p>
        </div>
        <LinkButton href="/admin/products/new">პროდუქტის დამატება</LinkButton>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="p-5"><p className="text-sm font-bold text-slate-500">დღევანდელი ლიდები</p><strong className="mt-2 block text-3xl">{stats.todayLeads}</strong></Card>
        <Card className="p-5"><p className="text-sm font-bold text-slate-500">დღევანდელი შეკვეთები</p><strong className="mt-2 block text-3xl">{stats.todayOrders}</strong></Card>
        <Card className="p-5"><p className="text-sm font-bold text-slate-500">მონტაჟის მოთხოვნები</p><strong className="mt-2 block text-3xl">{stats.pendingInstallations}</strong></Card>
        <Card className="p-5"><p className="text-sm font-bold text-slate-500">თვის შემოსავალი</p><strong className="mt-2 block text-3xl">{formatGel(stats.revenue)}</strong></Card>
        <Card className="p-5"><p className="text-sm font-bold text-slate-500">გამოქვეყნებული</p><strong className="mt-2 block text-3xl">{stats.publishedProducts}/{stats.productsTotal}</strong></Card>
      </div>

      <div className="mt-6">
        <AdminCharts points={stats.chart} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between"><h2 className="font-black">უკონტაქტო ლიდები</h2><Link href="/admin/leads" className="text-sm font-bold text-[#0ea5e9]">ყველა</Link></div>
          <div className="mt-3 grid gap-2">
            {stats.uncontacted.map((lead) => <div key={lead.id} className="rounded-xl bg-[#f0f9ff] p-3 text-sm"><strong>{lead.name}</strong><p>{lead.phone}</p></div>)}
            {!stats.uncontacted.length ? <p className="text-sm text-slate-500">ახალი ლიდები არ არის.</p> : null}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><h2 className="font-black">დაბალი მარაგი</h2><Link href="/admin/products" className="text-sm font-bold text-[#0ea5e9]">პროდუქტები</Link></div>
          <div className="mt-3 grid gap-2">
            {stats.lowStock.map((product) => <div key={product.id} className="rounded-xl bg-[#f0f9ff] p-3 text-sm"><strong>{product.brand.name} {product.model}</strong><p>მარაგი: {product.stock}</p></div>)}
            {!stats.lowStock.length ? <p className="text-sm text-slate-500">დაბალი მარაგი არ არის.</p> : null}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><h2 className="font-black">ბესტსელერები</h2><Link href="/admin/products" className="text-sm font-bold text-[#0ea5e9]">მართვა</Link></div>
          <div className="mt-3 grid gap-2">
            {stats.topProducts.map((product) => <div key={product.id} className="rounded-xl bg-[#f0f9ff] p-3 text-sm"><strong>{product.brand.name} {product.model}</strong></div>)}
            {!stats.topProducts.length ? <p className="text-sm text-slate-500">ბესტსელერები ჯერ მონიშნული არ არის.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
