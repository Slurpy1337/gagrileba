"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { dictionary } from "@/lib/i18n";

type CheckoutLabels = (typeof dictionary)["ka"]["checkout"];

type CheckoutResponse = {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  redirectUrl?: string;
};

const installmentMonths = [3, 6, 9, 12, 18, 24, 36];

export function CheckoutClient({ labels }: { labels: CheckoutLabels }) {
  const searchParams = useSearchParams();
  const selectedProduct = searchParams.get("product") || "";
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  async function submit(formData: FormData) {
    setState("loading");
    setMessage("");
    const productId = String(formData.get("productId") || selectedProduct);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: formData.get("customerName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        city: formData.get("city"),
        district: formData.get("district"),
        address: formData.get("address"),
        installationRequired: formData.get("installationRequired") === "on",
        paymentMethod: formData.get("paymentMethod"),
        installmentMonth: formData.get("paymentMethod") === "installment" ? Number(formData.get("installmentMonth")) : undefined,
        notes: formData.get("notes"),
        items: [{ productId, quantity: 1, installationIncluded: formData.get("installationRequired") === "on" }],
      }),
    });

    if (!res.ok) {
      setState("error");
      setMessage(labels.error);
      return;
    }

    const data = (await res.json()) as CheckoutResponse;
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    setState("success");
    setMessage(labels.success.replace("{orderNumber}", data.orderNumber));
  }

  return (
    <Card className="mt-6 p-6">
      <form action={submit} className="grid gap-3 md:grid-cols-2">
        <input name="customerName" required placeholder={labels.fullName} className="h-11 rounded-md border border-slate-300 px-3" />
        <input name="phone" required inputMode="tel" placeholder={labels.phone} className="h-11 rounded-md border border-slate-300 px-3" />
        <input name="email" type="email" placeholder={labels.email} className="h-11 rounded-md border border-slate-300 px-3" />
        <input name="city" required placeholder={labels.city} className="h-11 rounded-md border border-slate-300 px-3" />
        <input name="district" placeholder={labels.district} className="h-11 rounded-md border border-slate-300 px-3" />
        <input name="address" required placeholder={labels.address} className="h-11 rounded-md border border-slate-300 px-3" />
        <select
          name="paymentMethod"
          required
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
          className="h-11 rounded-md border border-slate-300 px-3"
        >
          <option value="card">{labels.card}</option>
          <option value="installment">{labels.installment}</option>
          <option value="bank_transfer">{labels.bankTransfer}</option>
          <option value="pay_on_delivery">{labels.payOnDelivery}</option>
        </select>
        {paymentMethod === "installment" ? (
          <select name="installmentMonth" required defaultValue="12" className="h-11 rounded-md border border-slate-300 px-3">
            {installmentMonths.map((month) => (
              <option key={month} value={month}>
                {month} თვე
              </option>
            ))}
          </select>
        ) : null}
        <label className="flex h-11 items-center gap-2 rounded-md border border-slate-300 px-3"><input name="installationRequired" type="checkbox" /> {labels.installationNeeded}</label>
        <textarea name="notes" placeholder={labels.comment} className="min-h-24 rounded-md border border-slate-300 p-3 md:col-span-2" />
        <input type="hidden" name="productId" value={selectedProduct} />
        <Button className="md:col-span-2" disabled={state === "loading"}>{state === "loading" ? labels.creating : labels.create}</Button>
      </form>
      {state === "success" ? <p className="mt-4 rounded-md bg-[#e0f2fe] p-3 font-bold text-[#0369a1]">{message}</p> : null}
      {state === "error" ? <p className="mt-4 rounded-md bg-rose-50 p-3 font-bold text-rose-700">{message}</p> : null}
    </Card>
  );
}
