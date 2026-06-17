import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { createVerify } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { notify } from "@/lib/notifications";
import { paymentProviders } from "@/lib/payments";

function normalizePublicKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function verifyBogSignature(rawBody: string, signature: string | null) {
  if (!env.BOG_CALLBACK_PUBLIC_KEY) return true;
  if (!signature) return false;

  const publicKey = normalizePublicKey(env.BOG_CALLBACK_PUBLIC_KEY);
  const verifyWithEncoding = (encoding: "base64" | "hex") => {
    try {
      const verifier = createVerify("RSA-SHA256");
      verifier.update(rawBody);
      verifier.end();
      return verifier.verify(publicKey, signature, encoding);
    } catch {
      return false;
    }
  };

  return verifyWithEncoding("base64") || verifyWithEncoding("hex");
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("callback-signature") ?? request.headers.get("x-bog-signature");
  if (!verifyBogSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid BOG callback signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const result = await paymentProviders.bog.handleWebhook(payload, signature);
  const payment = result.providerPaymentId
    ? await prisma.payment.findFirst({ where: { provider: "bog", providerPaymentId: result.providerPaymentId }, include: { order: true } })
    : null;

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status,
        rawPayload: result.rawPayload as Prisma.InputJsonValue,
      },
    });

    if (result.status === "paid") {
      await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "paid", status: "paid" } });
    } else if (result.status === "failed" || result.status === "cancelled") {
      await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: result.status, status: "payment_failed" } });
    }

    await notify({
      channel: "admin",
      subject: `BOG გადახდა: ${result.status}`,
      message: `${payment.order.orderNumber} - ${payment.order.customerName}`,
      fields: [
        { name: "შეკვეთა", value: payment.order.orderNumber, inline: true },
        { name: "სტატუსი", value: result.status, inline: true },
        { name: "თანხა", value: `${Number(payment.amount)} ${payment.currency}`, inline: true },
        { name: "კლიენტი", value: payment.order.customerName, inline: true },
        { name: "ტელეფონი", value: payment.order.phone, inline: true },
        { name: "BOG ID", value: result.providerPaymentId, inline: true },
      ],
      color: result.status === "paid" ? 0x22c55e : 0xf97316,
    });
  }

  await prisma.eventLog.create({
    data: {
      type: "payment_webhook",
      entityType: "payment",
      entityId: payment?.id,
      payload: result.rawPayload as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json({ ok: true, status: result.status });
}
