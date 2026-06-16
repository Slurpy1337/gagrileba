import { updateInstallationTask } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const statuses = ["requested", "scheduled", "completed", "cancelled"];

export default async function InstallationsPage() {
  const tasks = await prisma.installationTask.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100 });
  return (
    <div>
      <h1 className="text-3xl font-black">მონტაჟის კალენდარი</h1>
      <p className="mt-2 text-sm text-slate-600">დანიშნე დრო, გუნდი, სტატუსი და დამატებითი ხარჯის ჩანაწერები.</p>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-[#f0f9ff] text-[#0369a1]">
              <tr><th className="p-3">კლიენტი</th><th>მისამართი</th><th>დრო</th><th>გუნდი</th><th>სტატუსი</th><th>შენიშვნა</th><th>ხარჯი</th><th className="pr-3 text-right">შენახვა</th></tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t border-[#0ea5e9]/10 align-top">
                  <td className="p-3"><strong>{task.customerName}</strong><p>{task.phone}</p></td>
                  <td>{task.address}</td>
                  <td>
                    <form id={`task-${task.id}`} action={updateInstallationTask.bind(null, task.id)} />
                    <input form={`task-${task.id}`} name="scheduledAt" type="datetime-local" defaultValue={task.scheduledAt ? task.scheduledAt.toISOString().slice(0, 16) : ""} className="h-10 rounded-lg border border-[#0ea5e9]/24 px-2" />
                  </td>
                  <td><input form={`task-${task.id}`} name="assignedTeam" defaultValue={task.assignedTeam ?? ""} className="h-10 w-36 rounded-lg border border-[#0ea5e9]/24 px-2" /></td>
                  <td><select form={`task-${task.id}`} name="status" defaultValue={task.status} className="h-10 rounded-lg border border-[#0ea5e9]/24 px-2">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                  <td><input form={`task-${task.id}`} name="notes" defaultValue={task.notes ?? ""} className="h-10 w-52 rounded-lg border border-[#0ea5e9]/24 px-2" /></td>
                  <td><input form={`task-${task.id}`} name="extraCostNotes" defaultValue={task.extraCostNotes ?? ""} className="h-10 w-44 rounded-lg border border-[#0ea5e9]/24 px-2" /></td>
                  <td className="pr-3 text-right"><Button form={`task-${task.id}`} size="sm">შენახვა</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
