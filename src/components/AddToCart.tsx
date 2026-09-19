 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCart({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function add() {
    setBusy(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ productId, quantity: 1 })
    });
    setBusy(false);
    if (res.status === 401) return router.push("/login");
    if (!res.ok) return alert("Could not add to cart.");
    router.push("/cart");
  }
  return <button disabled={disabled || busy} onClick={add} className="mt-8 w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Adding..." : "Add to Cart"}</button>;
}