import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function CartPage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Please login to view your cart.</h1><Link href="/login" className="text-blue-600">Login</Link></main>;
  const user = await prisma.session.findUnique({ where: { id: session }, select: { userId: true } });
  if (!user) return <main className="p-8">Session expired.</main>;
  const items = await prisma.cartItem.findMany({ where: { userId: user.userId }, include: { product: true } });
  const total = items.reduce((s,i)=>s + Number(i.product.price)*i.quantity,0);
  return <main className="mx-auto max-w-3xl p-6"><h1 className="mb-6 text-3xl font-black">Your Cart</h1>{items.map(i=><div key={i.id} className="mb-3 flex justify-between rounded-xl bg-white p-4"><span>{i.product.name} × {i.quantity}</span><b>₹{(Number(i.product.price)*i.quantity).toFixed(0)}</b></div>)}<div className="mt-6 flex justify-between text-xl font-bold"><span>Total</span><span>₹{total.toFixed(0)}</span></div><Link href="/checkout" className="mt-6 block rounded-xl bg-slate-900 p-4 text-center font-bold text-white">Proceed to Checkout</Link></main>;
}