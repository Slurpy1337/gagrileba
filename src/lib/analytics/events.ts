import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type AnalyticsEvent =
  | "product_view"
  | "add_to_cart"
  | "lead_submit"
  | "checkout_started"
  | "purchase"
  | "phone_click"
  | "messenger_click"
  | "whatsapp_click";

export async function trackEvent(type: AnalyticsEvent, payload: Record<string, unknown>, entity?: { type: string; id: string }) {
  await prisma.eventLog.create({
    data: {
      type,
      entityType: entity?.type,
      entityId: entity?.id,
      payload: payload as Prisma.InputJsonValue,
    },
  }).catch(() => undefined);
}
