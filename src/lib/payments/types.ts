export type ProviderStatus = "paid" | "pending" | "failed";

export interface CreatePaymentParams {
  amount: number;
  orderId: string;
  title: string;
  customerMobile?: string;
}

export interface CreatePaymentResult {
  providerOrderId: string;
  paymentUrl: string;
}

export interface PaymentStatusResult {
  status: ProviderStatus;
  providerOrderId: string;
  rawStatus: string;
}

export interface PaymentProvider {
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  getPaymentStatus(providerOrderId: string): Promise<PaymentStatusResult>;
}