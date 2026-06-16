import { updateOrderStatus } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { formatGel } from "@/lib/utils";

export const dynamic = "force-dynamic";

const orderStatuses = ["pending", "awaiting_payment", "paid", "payment_failed", "confirmed", "preparing", "delivery_scheduled", "installation_scheduled", "installed", "completed", "cancelled", "refunded"];
const paymentStatuses = ["pending", "paid", "failed", "cancelled", "refunded", "unknown"];

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 });
  return (
    <div>
      <h1 className="text-3xl font-black">შეკვეთები</h1>
      <p className="mt-2 text-sm text-slate-600">მართე შეკვეთის და გადახდის სტატუსები, ნახე შემადგენლობა და ჯამები.</p>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-[#f0f9ff] text-[#0369a1]">
              <tr><th className="p-3">შეკვეთა</th><th>კლიენტი</th><th>პროდუქტები</th><th>სტატუსი</th><th>გადახდა</th><th>ჯამი</th><th>შენიშვნა</th><th className="pr-3 text-right">შენახვა</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-[#0ea5e9]/10 align-top">
                  <td className="p-3"><strong>{order.orderNumber}</strong><p className="text-xs text-slate-500">{order.createdAt.toLocaleString("ka-GE")}</p></td>
                  <td><strong>{order.customerName}</strong><p>{order.phone}</p><p className="text-xs text-slate-500">{order.city}, {order.address}</p></td>
                  <td>{order.items.map((item) => <p key={item.id}>{item.quantity} x {item.nameSnapshot}</p>)}</td>
                  <td>
                    <form id={`order-${order.id}`} action={updateOrderStatus.bind(null, order.id)} />
                    <select form={`order-${order.id}`} name="status" defaultValue={order.status} className="h-10 rounded-lg border border-[#0ea5e9]/24 px-2">{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                  </td>
                  <td><select form={`order-${order.id}`} name="paymentStatus" defaultValue={order.paymentStatus} className="h-10 rounded-lg border border-[#0ea5e9]/24 px-2">{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                  <td className="font-black">{formatGel(order.total)}</td>
                  <td><input form={`order-${order.id}`} name="notes" defaultValue={order.notes ?? ""} className="h-10 w-56 rounded-lg border border-[#0ea5e9]/24 px-2" /></td>
                  <td className="pr-3 text-right"><Button form={`order-${order.id}`} size="sm">შენახვა</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
