import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {getCurrentUser} from "@/lib/auth";
import {paymentProvider} from "@/lib/payments";
import {reconcilePaidPayment} from "@/lib/orders";

export async function POST(req:NextRequest){
 const user=await getCurrentUser(req); if(!user)return NextResponse.json({error:"Login required"},{status:401});
 const body=await req.json().catch(()=>null); const orderId=typeof body?.orderId==="string"?body.orderId:"";
 const order=await prisma.order.findFirst({where:{id:orderId,userId:user.id},include:{payment:true}});
 if(!order||!order.payment?.providerOrderId)return NextResponse.json({status:"pending"});
 if(order.payment.status==="PAID")return NextResponse.json({status:"paid"});
 try{
  const result=await paymentProvider().getPaymentStatus(order.payment.providerOrderId);
  if(result.status==="paid"){
    await reconcilePaidPayment(order.id);
    return NextResponse.json({status:"paid"});
  }
  if(result.status==="failed"){
    await prisma.payment.update({where:{id:order.payment.id},data:{status:"FAILED",failureReason:"Provider reported failure"}});
    return NextResponse.json({status:"failed"});
  }
  return NextResponse.json({status:"pending"});
 }catch{return NextResponse.json({status:"pending"});}
}