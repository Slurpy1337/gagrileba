"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { dictionary } from "@/lib/i18n";

type LeadLabels = (typeof dictionary)["ka"]["lead"];

const fallbackLabels: LeadLabels = {
  name: "Name",
  phone: "Phone",
  productInterest: "What do you need?",
  roomSize: "Area / rooms",
  urgency: "When do you need it?",
  today: "Today/tomorrow",
  week: "This week",
  checking: "Checking prices",
  message: "Comment",
  sending: "Sending...",
  submit: "Call me with an offer",
  success: "Received. We will contact you soon.",
  error: "Could not send. Try again or call us.",
};

export function LeadForm({ source = "contact", compact = false, labels = fallbackLabels }: { source?: string; compact?: boolean; labels?: LeadLabels }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const fieldClass = "h-11 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm font-semibold text-[#0f172a] outline-none transition placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10";
  const textareaClass = "min-h-28 rounded-lg border border-[#cbd5e1] bg-white p-3 text-sm font-semibold text-[#0f172a] outline-none transition placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 md:col-span-2";

  async function submit(formData: FormData) {
    setState("loading");
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source }),
    });
    setState(res.ok ? "success" : "error");
  }

  return (
    <form action={submit} className="grid gap-3">
      <div className={compact ? "grid gap-3 md:grid-cols-2" : "grid gap-3"}>
        <input name="name" required placeholder={labels.name} className={fieldClass} />
        <input name="phone" required inputMode="tel" placeholder={labels.phone} className={fieldClass} />
        <input name="productInterest" placeholder={labels.productInterest} className={fieldClass} />
        <input name="roomSize" placeholder={labels.roomSize} className={fieldClass} />
        <select name="urgency" className={fieldClass}>
          <option value="">{labels.urgency}</option>
          <option>{labels.today}</option>
          <option>{labels.week}</option>
          <option>{labels.checking}</option>
        </select>
        <textarea name="message" placeholder={labels.message} className={textareaClass} />
      </div>
      <Button disabled={state === "loading"} variant="accent" className="mt-1 w-full">{state === "loading" ? labels.sending : labels.submit}</Button>
      {state === "success" ? <p className="rounded-md bg-[#e0f2fe] p-3 text-sm font-semibold text-[#0369a1]">{labels.success}</p> : null}
      {state === "error" ? <p className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{labels.error}</p> : null}
    </form>
  );
}
