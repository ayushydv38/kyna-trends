 "use client";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
export default function ReturnPage(){
 const p=useSearchParams(), orderId=p.get("orderId"); const [s,setS]=useState("checking");
 useEffect(()=>{if(!orderId)return;let tries=0;const check=async()=>{tries++;try{const r=await fetch("/api/payments/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId})});const d=await r.json();setS(d.status);if(d.status==="pending"&&tries<6)setTimeout(check,3000)}catch{setS("pending")}};check()},[orderId]);
 return <main className="mx-auto max-w-lg p-10 text-center">{s==="checking"&&<p>Verifying payment...</p>}{s==="paid"&&<><h1 className="text-3xl font-black text-green-600">Payment Successful</h1><p className="mt-3">Your order is confirmed.</p></>}{s==="failed"&&<><h1 className="text-3xl font-black text-red-600">Payment Failed</h1><p className="mt-3">Please try again.</p></>}{s==="pending"&&<><h1 className="text-3xl font-black">Payment Pending</h1><p className="mt-3">We are still verifying your payment. Please check your orders shortly.</p></>}</main>
}