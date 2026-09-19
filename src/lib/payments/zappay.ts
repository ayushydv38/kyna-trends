import { getEnv } from "../env";
import type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, PaymentStatusResult } from "./types";

const BASE_URL = "https://zappay-beta.vercel.app";

export class ZapPayProvider implements PaymentProvider {
  private key: string;
  constructor() {
    this.key = getEnv().ZAP_API_KEY;
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      "X-ZapAPI-Key": this.key
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    if (params.amount < 1 || params.amount > 5000) {
      throw new Error("ZapPay amount must be between ₹1 and ₹5,000.");
    }
    const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
    const response = await fetch(`${BASE_URL}/api/developer/create-order`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        amount: params.amount,
        title: params.title,
        redirect_url: `${appUrl}/payment/return?orderId=${encodeURIComponent(params.orderId)}`,
        useEmbedded: false,
        ...(params.customerMobile ? { customer_mobile: params.customerMobile } : {})
      }),
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Payment provider unavailable.");
    const data = await response.json();
    if (!data?.payment_url || !data?.order_id) throw new Error("Invalid payment provider response.");
    return { providerOrderId: String(data.order_id), paymentUrl: String(data.payment_url) };
  }

  async getPaymentStatus(providerOrderId: string): Promise<PaymentStatusResult> {
    const response = await fetch(
      `${BASE_URL}/api/developer/order-status/${encodeURIComponent(providerOrderId)}`,
      { headers: this.headers(), cache: "no-store" }
    );
    if (!response.ok) throw new Error("Payment verification unavailable.");
    const data = await response.json();
    const raw = String(data?.status ?? "").toLowerCase();
    const status = raw === "success" ? "paid" : raw === "failed" || raw === "cancelled" ? "failed" : "pending";
    return { status, providerOrderId, rawStatus: raw };
  }
}