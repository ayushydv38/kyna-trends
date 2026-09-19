"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const nav=[
  ["Dashboard","/admin"],["Products","/admin/products"],["Orders","/admin/orders"],
  ["Categories","/admin/categories"],["Customers","/admin/customers"],["Settings","/admin/settings"]
];
export default function AdminShell({children}:{children:ReactNode}){
 const path=usePathname();
 return <div className="min-h-screen bg-slate-50"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block"><div className="p-6"><Link href="/admin" className="text-2xl font-black">MyStore<span className="text-blue-600">.</span></Link><p className="mt-1 text-xs text-slate-500">Admin Console</p></div><nav className="space-y-1 px-3">{nav.map(([label,href])=><Link key={href} href={href} className={`block rounded-xl px-4 py-3 text-sm font-semibold ${path===href||path.startsWith(href+"/")?"bg-slate-900 text-white":"text-slate-600 hover:bg-slate-100"}`}>{label}</Link>)}</nav></aside><main className="lg:ml-64"><div className="border-b bg-white p-4 lg:hidden"><div className="flex gap-2 overflow-auto">{nav.map(([label,href])=><Link key={href} href={href} className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">{label}</Link>)}</div></div>{children}</main></div>
}
