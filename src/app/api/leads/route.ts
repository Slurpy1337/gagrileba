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
  await notify({ channel: "admin", subject: "ახალი ლიდი", message: `${lead.name} - ${lead.phone}` });
  return NextResponse.json({ leadId: lead.id });
}
