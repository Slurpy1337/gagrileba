import { updateSetting } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-black">პარამეტრები</h1>
      <p className="mt-2 text-sm text-slate-600">შეინახე კომპანიის, გადახდის, tracking-ის და სხვა JSON პარამეტრები.</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card className="p-5">
          <h2 className="font-black">პარამეტრის შენახვა</h2>
          <form action={updateSetting} className="mt-4 grid gap-3">
            <input name="key" required placeholder="key, მაგ: company" className="h-11 rounded-lg border border-[#0ea5e9]/24 px-3 text-sm" />
            <textarea name="value" required placeholder='{"phone":"+995...","email":"..."}' className="min-h-44 rounded-lg border border-[#0ea5e9]/24 p-3 font-mono text-sm" />
            <Button>შენახვა</Button>
          </form>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-[#0ea5e9]/12 p-4 font-black">არსებული პარამეტრები</div>
          <div className="grid divide-y divide-[#0ea5e9]/10">
            {settings.map((setting) => (
              <div key={setting.key} className="grid gap-2 p-4">
                <strong className="text-[#0369a1]">{setting.key}</strong>
                <pre className="overflow-x-auto rounded-xl bg-[#f0f9ff] p-3 text-xs">{JSON.stringify(setting.value, null, 2)}</pre>
              </div>
            ))}
            {!settings.length ? <p className="p-4 text-sm text-slate-500">პარამეტრები ჯერ არ არის.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
