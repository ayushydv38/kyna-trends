import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 24
  });
  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="text-2xl font-black">MyStore</Link>
          <nav className="flex gap-4"><Link href="/cart">Cart</Link><Link href="/checkout">Checkout</Link></nav>
        </div>
      </header>
      <section className="mx-auto max-w-6xl p-6">
        <div className="mb-8 rounded-3xl bg-slate-900 p-8 text-white">
          <p className="mb-2 text-sm uppercase tracking-widest">Welcome</p>
          <h1 className="text-4xl font-black">Shop smart. Shop simple.</h1>
        </div>
        <h2 className="mb-4 text-2xl font-bold">Products</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map(p => (
            <Link key={p.id} href={`/product/${p.slug}`} className="rounded-2xl bg-white p-3 shadow-sm hover:shadow-md">
              <img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
              <h3 className="mt-3 font-semibold">{p.name}</h3>
              <p className="mt-1 font-bold">₹{Number(p.price).toFixed(0)}</p>
              <p className="text-sm text-slate-500">{p.stock > 0 ? "In stock" : "Out of stock"}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}