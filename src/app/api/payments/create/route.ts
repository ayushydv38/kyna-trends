import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { paymentProvider } from "@/lib/payments";
import { z } from "zod";

const schema=z.object({orderId:z.string().min(1)});
export async function POST(req:NextRequest){
 const user=await getCurrentUser(req); if(!user)return NextResponse.json({error:"Login required"},{status:401});
 const parsed=schema.safeParse(await req.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({error:"Invalid payment request"},{status:400});
 const order=await prisma.order.findFirst({where:{id:parsed.data.orderId,userId:user.id},include:{payment:true}});
 if(!order||order.paymentMethod!=="ZAPPAY"||!order.payment)return NextResponse.json({error:"Order not available for online payment"},{status:400});
 if(order.payment.status==="PAID")return NextResponse.json({error:"Order already paid"},{status:400});
 if(Number(order.total)<1||Number(order.total)>5000)return NextResponse.json({error:"Invalid payment amount"},{status:400});
 if(order.payment.providerOrderId){
   try{
     const status=await paymentProvider().getPaymentStatus(order.payment.providerOrderId);
     if(status.status==="paid"){await prisma.payment.update({where:{id:order.payment.id},data:{status:"PAID",verifiedAt:new Date()}});await prisma.order.update({where:{id:order.id},data:{paymentStatus:"PAID",status:"CONFIRMED"}});return NextResponse.json({alreadyPaid:true});}
   }catch{}
 }
 const result=await paymentProvider().createPayment({amount:Number(order.total),orderId:order.id,title:`Order ${order.orderNumber}`,customerMobile:order.phone});
 await prisma.payment.update({where:{id:order.payment.id},data:{providerOrderId:result.providerOrderId,status:"PROCESSING"}});
 return NextResponse.json({paymentUrl:result.paymentUrl,providerOrderId:result.providerOrderId});
}