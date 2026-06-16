"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { dictionary } from "@/lib/i18n";

type CalculatorLabels = (typeof dictionary)["ka"]["calculator"];

export function CalculatorClient({ labels }: { labels: CalculatorLabels }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const complete = labels.questions.every((q) => answers[q.key]) && phone.length > 5;
  const recommendations = useMemo(() => {
    if (answers.size?.includes("50-70") || answers.size?.includes("70+")) return ["Midea AF-18", "GREE 18 BTU", "Midea AF-24"];
    return ["Midea AF-12", "GREE 12 BTU", "Millen 12 BTU"];
  }, [answers]);

  async function submit() {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Wizard lead",
        phone,
        source: "quote_wizard",
        productInterest: answers.need,
        roomSize: answers.size,
        budget: answers.budget,
        urgency: answers.urgency,
        installationNeeded: /კი|yes|да/i.test(answers.installation ?? ""),
        message: JSON.stringify(answers),
      }),
    });
    setSent(true);
  }

  return (
    <div className="mt-8 grid gap-5">
      {labels.questions.map((q) => (
        <Card key={q.key} className="p-5">
          <h2 className="font-black">{q.label}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {q.options.map((option) => <Button key={option} variant={answers[q.key] === option ? "primary" : "outline"} onClick={() => setAnswers({ ...answers, [q.key]: option })}>{option}</Button>)}
          </div>
        </Card>
      ))}
      <Card className="p-5">
        <label className="font-black" htmlFor="phone">{labels.phone}</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="mt-3 h-11 w-full rounded-md border border-slate-300 px-3" placeholder="+995" />
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-black">{labels.recommendation}</h2>
        <div className="mt-3 grid gap-2">{recommendations.map((item) => <div key={item} className="rounded-md bg-slate-100 p-3 font-bold">{item}</div>)}</div>
        <Button disabled={!complete || sent} onClick={submit} className="mt-5" variant="accent">{sent ? labels.sent : labels.submit}</Button>
      </Card>
    </div>
  );
}
