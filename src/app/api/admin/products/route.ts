import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { productSchema } from "@/lib/validators/products";

export async function POST(request: Request) {
  const user = await requireAdmin(["owner", "manager"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const parsed = productSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const p = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...p,
      oldPrice: p.oldPrice,
      costPrice: p.costPrice,
      recommendedAreaMin: p.recommendedAreaMin,
      recommendedAreaMax: p.recommendedAreaMax,
      btu: p.btu,
      kw: p.kw,
      mainImageUrl: p.mainImageUrl,
    },
  });
  await prisma.eventLog.create({ data: { type: "product_created", entityType: "product", entityId: product.id, payload: { name: product.name } } });
  return NextResponse.redirect(new URL(`/admin/products/${product.id}`, request.url), { status: 303 });
}
