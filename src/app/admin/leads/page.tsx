import { updateLeadStatus } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const statuses = ["new", "contacted", "quoted", "follow_up", "won", "lost", "spam"];

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="text-3xl font-black">ლიდები / CRM</h1>
      <p className="mt-2 text-sm text-slate-600">სტატუსი, follow-up თარიღი და შენიშვნა იცვლება პირდაპირ ცხრილიდან.</p>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#f0f9ff] text-[#0369a1]">
              <tr><th className="p-3">ლიდი</th><th>ინტერესი</th><th>წყარო</th><th>სტატუსი</th><th>Follow-up</th><th>შენიშვნა</th><th className="pr-3 text-right">შენახვა</th></tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-[#0ea5e9]/10 align-top">
                  <td className="p-3"><strong>{lead.name}</strong><p className="text-slate-600">{lead.phone}</p><p className="text-xs text-slate-500">{lead.createdAt.toLocaleString("ka-GE")}</p></td>
                  <td>{lead.productInterest || lead.roomSize || "-"}</td>
                  <td>{lead.source}</td>
                  <td>
                    <form id={`lead-${lead.id}`} action={updateLeadStatus.bind(null, lead.id)} />
                    <select form={`lead-${lead.id}`} name="status" defaultValue={lead.status} className="h-10 rounded-lg border border-[#0ea5e9]/24 px-2">
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td><input form={`lead-${lead.id}`} name="nextFollowUpAt" type="datetime-local" defaultValue={lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString().slice(0, 16) : ""} className="h-10 rounded-lg border border-[#0ea5e9]/24 px-2" /></td>
                  <td><input form={`lead-${lead.id}`} name="message" defaultValue={lead.message ?? ""} className="h-10 w-64 rounded-lg border border-[#0ea5e9]/24 px-2" /></td>
                  <td className="pr-3 text-right"><Button form={`lead-${lead.id}`} size="sm">შენახვა</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
