import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {createSession,setSessionCookie} from "@/lib/auth";
import {z} from "zod";
import crypto from "crypto";
const schema=z.object({email:z.string().email(),password:z.string().min(8).max(200)});
function hash(p:string){return crypto.createHash("sha256").update(p).digest("hex");}
export async function POST(req:NextRequest){const x=schema.safeParse(await req.json().catch(()=>null));if(!x.success)return NextResponse.json({error:"Invalid credentials"},{status:400});const u=await prisma.user.findUnique({where:{email:x.data.email.toLowerCase()}});if(!u||u.password!==hash(x.data.password))return NextResponse.json({error:"Invalid email or password"},{status:401});const s=await createSession(u.id);const r=NextResponse.json({success:true});await setSessionCookie(r,s.id,s.expiresAt);return r;}