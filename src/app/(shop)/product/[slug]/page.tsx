import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product || !product.active) notFound();
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <img src={product.image} alt={product.name} className="w-full rounded-3xl bg-white object-cover" />
        <div>
          <h1 className="text-4xl font-black">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold">₹{Number(product.price).toFixed(0)}</p>
          <p className="mt-6 text-slate-600">{product.description}</p>
          <p className="mt-4">{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
          <AddToCart productId={product.id} disabled={product.stock <= 0} />
        </div>
      </div>
    </main>
  );
}