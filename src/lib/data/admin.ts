import { prisma } from "@/lib/db/prisma";

export async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const since = new Date(today);
  since.setDate(since.getDate() - 13);
  const [todayLeads, todayOrders, pendingInstallations, revenue, lowStock, uncontacted, topProducts, productsTotal, publishedProducts, ordersSeries, leadsSeries] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.installationTask.count({ where: { status: { in: ["requested", "scheduled"] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: month }, status: { notIn: ["cancelled", "refunded"] } } }),
    prisma.product.findMany({ where: { stock: { lte: 3 }, status: "published" }, include: { brand: true }, take: 8 }),
    prisma.lead.findMany({ where: { status: "new" }, orderBy: { createdAt: "asc" }, take: 8 }),
    prisma.product.findMany({ where: { isBestSeller: true }, include: { brand: true }, take: 5 }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "published" } }),
    prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, total: true, status: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const chart = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { key, label: date.toLocaleDateString("ka-GE", { day: "2-digit", month: "2-digit" }), orders: 0, leads: 0, revenue: 0 };
  });
  const chartByKey = new Map(chart.map((point) => [point.key, point]));
  for (const lead of leadsSeries) {
    const point = chartByKey.get(lead.createdAt.toISOString().slice(0, 10));
    if (point) point.leads += 1;
  }
  for (const order of ordersSeries) {
    const point = chartByKey.get(order.createdAt.toISOString().slice(0, 10));
    if (!point) continue;
    point.orders += 1;
    if (!["cancelled", "refunded"].includes(order.status)) point.revenue += Number(order.total);
  }

  return { todayLeads, todayOrders, pendingInstallations, revenue: Number(revenue._sum.total ?? 0), lowStock, uncontacted, topProducts, productsTotal, publishedProducts, chart };
}
