import {PrismaClient} from "@prisma/client";
import crypto from "crypto";
const prisma=new PrismaClient();
const hash=(p:string)=>crypto.createHash("sha256").update(p).digest("hex");
async function main(){
 const adminEmail="admin@example.com";
 await prisma.user.upsert({where:{email:adminEmail},update:{},create:{email:adminEmail,name:"Admin",password:hash("CHANGE_THIS_PASSWORD"),role:"ADMIN"}});
 await prisma.category.upsert({where:{slug:"featured"},update:{},create:{name:"Featured",slug:"featured"}});
 const cat=await prisma.category.findUnique({where:{slug:"featured"}});
 if(cat) await prisma.product.upsert({where:{slug:"sample-product"},update:{},create:{name:"Sample Product",slug:"sample-product",description:"Replace this with your first product.",price:999,comparePrice:1299,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",stock:10,sku:"SAMPLE-001",categoryId:cat.id}});
 console.log("Seeded. Change the admin password before real use.");
}
main().finally(()=>prisma.$disconnect());