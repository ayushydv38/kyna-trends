"use client";
import { useState } from "react";

export default function CheckoutPage() {
  const [method,setMethod]=useState<"ZAPPAY"|"COD">("ZAPPAY");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const f=new FormData(e.currentTarget);
    try {
      const order=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        email:f.get("email"),phone:f.get("phone"),shippingName:f.get("name"),shippingAddress:f.get("address"),
        shippingCity:f.get("city"),shippingState:f.get("state"),shippingZip:f.get("zip"),paymentMethod:method
      })});
      const od=await order.json(); if(!order.ok) throw new Error(od.error||"Could not create order");
      if(method==="COD"){location.href=`/order/${od.orderId}`;return;}
      const pay=await fetch("/api/payments/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:od.orderId})});
      const pd=await pay.json(); if(!pay.ok) throw new Error(pd.error||"Could not start payment");
      location.href=pd.paymentUrl;
    } catch(e){setError(e instanceof Error?e.message:"Checkout failed");setBusy(false);}
  }
  return <main className="mx-auto max-w-2xl p-6"><h1 className="mb-6 text-3xl font-black">Checkout</h1>{error&&<div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}<form onSubmit={submit} className="space-y-3">
    <input name="name" required placeholder="Full name" className="w-full rounded-xl border p-3"/>
    <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border p-3"/>
    <input name="phone" required pattern="[6-9][0-9]{9}" placeholder="10-digit mobile" className="w-full rounded-xl border p-3"/>
    <input name="address" required placeholder="Address" className="w-full rounded-xl border p-3"/>
    <input name="city" required placeholder="City" className="w-full rounded-xl border p-3"/>
    <input name="state" required placeholder="State" className="w-full rounded-xl border p-3"/>
    <input name="zip" required pattern="[0-9]{6}" placeholder="PIN code" className="w-full rounded-xl border p-3"/>
    <div className="rounded-xl border p-4"><label className="block"><input type="radio" checked={method==="ZAPPAY"} onChange={()=>setMethod("ZAPPAY")}/> Online payment (ZapPay)</label><label className="mt-2 block"><input type="radio" checked={method==="COD"} onChange={()=>setMethod("COD")}/> Cash on Delivery</label></div>
    <button disabled={busy} className="w-full rounded-xl bg-slate-900 p-4 font-bold text-white disabled:opacity-50">{busy?"Processing...":method==="ZAPPAY"?"Pay Online":"Place COD Order"}</button>
  </form></main>
}