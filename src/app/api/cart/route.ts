import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const payload = await request.json();
  const cart = await prisma.cart.create({ data: { sessionId: payload.sessionId, payload } });
  return NextResponse.json({ cartId: cart.id });
}
