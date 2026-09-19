import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/db"; import {requireAdmin} from "@/lib/auth";
export async function GET(req:NextRequest){try{await requireAdmin(req)}catch(e){if(e instanceof Response)return e;throw e}
 const [products,customers,orders,revenue,pending,lowStock]=await Promise.all([
  prisma.product.count(), prisma.user.count({where:{role:"CUSTOMER"}}), prisma.order.count(),
  prisma.order.aggregate({where:{paymentStatus:"PAID"},_sum:{total:true}}),
  prisma.order.count({where:{status:{in:["PENDING","CONFIRMED","PROCESSING"]}}}),
  prisma.product.count({where:{active:true,stock:{lte:5}}})
 ]); return NextResponse.json({products,customers,orders,revenue:Number(revenue._sum.total||0),pending,lowStock});}
