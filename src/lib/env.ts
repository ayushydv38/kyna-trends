import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ZAP_API_KEY: z.string().min(1),
  PAYMENT_MODE: z.enum(["test", "live"]).default("test")
});

export function getEnv() {
  return envSchema.parse(process.env);
}
