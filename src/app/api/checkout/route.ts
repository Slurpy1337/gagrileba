import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { trackEvent } from "@/lib/analytics/events";
import { notify } from "@/lib/notifications";
import { providerForPaymentMethod } from "@/lib/payments";
import { checkoutSchema } from "@/lib/validators/orders";

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      status: "published",
      OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
    },
  });
  if (!products.length) return NextResponse.json({ error: "No products available" }, { status: 400 });
  const quantityByProduct = new Map(data.items.map((item) => [item.productId, item.quantity]));
  const subtotal = products.reduce((sum, product) => {
    const quantity = quantityByProduct.get(product.id) ?? quantityByProduct.get(product.slug) ?? 1;
    return sum + Number(product.price) * quantity;
  }, 0);
  const installationTotal = data.installationRequired ? 150 : 0;
  const orderNumber = `GAG-${Date.now()}`;
  const onlinePayment = data.paymentMethod === "card" || data.paymentMethod === "installment";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gagrileba.ge";
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      city: data.city,
      district: data.district,
      address: data.address,
      paymentMethod: data.paymentMethod,
      status: onlinePayment ? "awaiting_payment" : "pending",
      subtotal,
      installationTotal,
      deliveryTotal: 0,
      discountTotal: 0,
      total: subtotal + installationTotal,
      notes: data.notes,
      items: {
        create: products.map((product) => {
          const quantity = quantityByProduct.get(product.id) ?? quantityByProduct.get(product.slug) ?? 1;
          return {
            productId: product.id,
            nameSnapshot: product.name,
            skuSnapshot: product.sku,
            quantity,
            unitPrice: product.price,
            totalPrice: Number(product.price) * quantity,
            installationIncluded: data.installationRequired,
          };
        }),
      },
    },
  });
  if (data.installationRequired) {
    await prisma.installationTask.create({ data: { orderId: order.id, customerName: order.customerName, phone: order.phone, address: order.address, notes: "Checkout installation request" } });
  }
  const provider = providerForPaymentMethod(data.paymentMethod);
  const providerPayment = await provider.createPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    installmentMonth: data.installmentMonth,
    amount: Number(order.total),
    currency: "GEL",
    customer: { name: order.customerName, phone: order.phone, email: order.email },
    callbackUrl: `${siteUrl}/api/payments/bog/webhook`,
    successUrl: `${siteUrl}/checkout/success?order=${order.orderNumber}`,
    failUrl: `${siteUrl}/checkout/fail?order=${order.orderNumber}`,
  });
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: providerPayment.provider,
      providerPaymentId: providerPayment.providerPaymentId,
      amount: order.total,
      status: providerPayment.status,
      rawPayload: providerPayment.rawPayload as Prisma.InputJsonValue,
    },
  });
  await trackEvent("purchase", { total: Number(order.total), paymentMethod: order.paymentMethod }, { type: "order", id: order.id });
  await notify({
    channel: "admin",
    subject: `ახალი შეკვეთა ${order.orderNumber}`,
    message: `${order.customerName} - ${order.phone}`,
    url: `${siteUrl}/admin/orders`,
    fields: [
      { name: "სახელი", value: order.customerName, inline: true },
      { name: "ტელეფონი", value: order.phone, inline: true },
      { name: "ელფოსტა", value: order.email, inline: true },
      { name: "ჯამი", value: `${Number(order.total)} GEL`, inline: true },
      { name: "გადახდა", value: order.paymentMethod, inline: true },
      { name: "გადახდის სტატუსი", value: providerPayment.status, inline: true },
      { name: "განვადების თვე", value: data.installmentMonth, inline: true },
      { name: "მონტაჟი", value: data.installationRequired, inline: true },
      { name: "მისამართი", value: [order.city, order.district, order.address].filter(Boolean).join(", ") },
      {
        name: "პროდუქტები",
        value: products
          .map((product) => {
            const quantity = quantityByProduct.get(product.id) ?? quantityByProduct.get(product.slug) ?? 1;
            return `${quantity} x ${product.name} (${product.sku})`;
          })
          .join("\n"),
      },
      { name: "კომენტარი", value: order.notes },
    ],
  });
  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, paymentStatus: providerPayment.status, redirectUrl: providerPayment.redirectUrl });
}
