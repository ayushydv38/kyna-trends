import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

const schema=z.object({
 email:z.string().email(), phone:z.string().regex(/^[6-9]\d{9}$/),
 shippingName:z.string().min(2).max(100), shippingAddress:z.string().min(5).max(300),
 shippingCity:z.string().min(2).max(100), shippingState:z.string().min(2).max(100),
 shippingZip:z.string().regex(/^\d{6}$/), paymentMethod:z.enum(["ZAPPAY","COD"])
});

export async function POST(req:NextRequest){
 const user=await getCurrentUser(req);
 if(!user) return NextResponse.json({error:"Login required"},{status:401});
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Please check your checkout details."},{status:400});
 const cart=await prisma.cartItem.findMany({where:{userId:user.id},include:{product:true}});
 if(!cart.length) return NextResponse.json({error:"Your cart is empty."},{status:400});
 const subtotal=cart.reduce((s,i)=>s+Number(i.product.price)*i.quantity,0);
 const shipping=subtotal>=500?0:40;
 const tax=0;
 const total=subtotal+shipping+tax;
 if(parsed.data.paymentMethod==="ZAPPAY" && (total<1 || total>5000)) return NextResponse.json({error:"Online payment orders must be between ₹1 and ₹5,000."},{status:400});
 if(parsed.data.paymentMethod==="COD" && total<=0) return NextResponse.json({error:"Invalid order total."},{status:400});
 const order=await prisma.$transaction(async tx=>{
   for(const item of cart){const p=await tx.product.findUnique({where:{id:item.productId}}); if(!p||!p.active||p.stock<item.quantity) throw new Error("A product became unavailable.");}
   const o=await tx.order.create({data:{orderNumber:`ORD-${Date.now()}-${crypto.randomInt(1000,9999)}`,userId:user.id,...parsed.data,shippingCountry:"India",subtotal,discount:0,tax,shippingCost:shipping,total}});
   await tx.orderItem.createMany({data:cart.map(i=>({orderId:o.id,productId:i.productId,productName:i.product.name,price:i.product.price,quantity:i.quantity,total:Number(i.product.price)*i.quantity}))});
   if(parsed.data.paymentMethod==="ZAPPAY") await tx.payment.create({data:{orderId:o.id,amount:total,method:"ZAPPAY",status:"PENDING"}});
   else await tx.order.update({where:{id:o.id},data:{status:"CONFIRMED"}});
   await tx.cartItem.deleteMany({where:{userId:user.id}});
   return o;
 });
 return NextResponse.json({orderId:order.id,orderNumber:order.orderNumber,total:Number(order.total)});
}