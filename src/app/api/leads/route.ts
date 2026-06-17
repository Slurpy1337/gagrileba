import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { trackEvent } from "@/lib/analytics/events";
import { notify } from "@/lib/notifications";
import { leadSchema } from "@/lib/validators/leads";

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      source: data.source,
      productInterest: data.productInterest,
      roomSize: data.roomSize,
      budget: data.budget,
      urgency: data.urgency,
      installationNeeded: data.installationNeeded,
      message: data.message,
    },
  });
  await trackEvent("lead_submit", { source: lead.source, phone: lead.phone }, { type: "lead", id: lead.id });
  await notify({
    channel: "admin",
    subject: "ახალი მოთხოვნა / შეთავაზება",
    message: `${lead.name} - ${lead.phone}`,
    fields: [
      { name: "სახელი", value: lead.name, inline: true },
      { name: "ტელეფონი", value: lead.phone, inline: true },
      { name: "ელფოსტა", value: lead.email, inline: true },
      { name: "წყარო", value: lead.source, inline: true },
      { name: "პროდუქტი", value: lead.productInterest, inline: true },
      { name: "ფართობი", value: lead.roomSize, inline: true },
      { name: "ბიუჯეტი", value: lead.budget, inline: true },
      { name: "სიჩქარე", value: lead.urgency, inline: true },
      { name: "მონტაჟი", value: lead.installationNeeded, inline: true },
      { name: "კომენტარი", value: lead.message },
    ],
  });
  return NextResponse.json({ leadId: lead.id });
}
