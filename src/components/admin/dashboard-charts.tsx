import { formatGel } from "@/lib/utils";

type Point = { label: string; orders: number; leads: number; revenue: number };

function maxValue(points: Point[], key: "orders" | "leads" | "revenue") {
  return Math.max(1, ...points.map((point) => Number(point[key] || 0)));
}

export function AdminCharts({ points }: { points: Point[] }) {
  const maxRevenue = maxValue(points, "revenue");
  const maxActivity = Math.max(maxValue(points, "orders"), maxValue(points, "leads"));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
        <div className="flex items-center justify-between">
          <h2 className="font-black">შემოსავალი ბოლო 14 დღეში</h2>
          <span className="text-sm font-bold text-[#0369a1]">{formatGel(points.reduce((sum, point) => sum + point.revenue, 0))}</span>
        </div>
        <div className="mt-6 flex h-56 items-end gap-2">
          {points.map((point) => (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end rounded-full bg-[#f0f9ff]">
                <div className="w-full rounded-full bg-[#0ea5e9]" style={{ height: `${Math.max(6, (point.revenue / maxRevenue) * 100)}%` }} title={`${point.label}: ${formatGel(point.revenue)}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-[#0ea5e9]/16 bg-white p-5 shadow-[0_18px_45px_rgba(14,165,233,0.12)]">
        <h2 className="font-black">ლიდები და შეკვეთები</h2>
        <div className="mt-6 grid gap-3">
          {points.map((point) => (
            <div key={point.label} className="grid grid-cols-[56px_1fr_42px] items-center gap-3 text-sm">
              <span className="font-bold text-slate-500">{point.label}</span>
              <div className="grid gap-1">
                <div className="h-2 rounded-full bg-[#f0f9ff]"><div className="h-2 rounded-full bg-[#0ea5e9]" style={{ width: `${Math.max(4, (point.leads / maxActivity) * 100)}%` }} /></div>
                <div className="h-2 rounded-full bg-[#f0f9ff]"><div className="h-2 rounded-full bg-[#0369a1]" style={{ width: `${Math.max(4, (point.orders / maxActivity) * 100)}%` }} /></div>
              </div>
              <span className="text-right font-bold text-slate-600">{point.leads}/{point.orders}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-4 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-2"><i className="h-2 w-5 rounded-full bg-[#0ea5e9]" /> ლიდები</span>
          <span className="inline-flex items-center gap-2"><i className="h-2 w-5 rounded-full bg-[#0369a1]" /> შეკვეთები</span>
        </div>
      </div>
    </div>
  );
}
