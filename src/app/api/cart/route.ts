import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) });

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart request" }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.active || product.stock < parsed.data.quantity) return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    create: { userId: user.id, productId: product.id, quantity: parsed.data.quantity },
    update: { quantity: { increment: parsed.data.quantity } }
  });
  return NextResponse.json(item);
}