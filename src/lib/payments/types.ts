export type PaymentProviderName = "bog" | "cash" | "bank_transfer" | "installment";

export type CreatePaymentInput = {
  orderId: string;
  orderNumber: string;
  paymentMethod: string;
  installmentMonth?: number;
  amount: number;
  currency: string;
  customer: { name: string; phone: string; email?: string | null };
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
};

export type ProviderPayment = {
  provider: PaymentProviderName;
  providerPaymentId?: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "unknown";
  redirectUrl?: string;
  rawPayload?: unknown;
};

export interface PaymentProvider {
  name: PaymentProviderName;
  createPayment(input: CreatePaymentInput): Promise<ProviderPayment>;
  verifyPayment(providerPaymentId: string): Promise<ProviderPayment>;
  handleWebhook(payload: unknown, signature?: string | null): Promise<ProviderPayment>;
  refundPayment(providerPaymentId: string, amount: number): Promise<ProviderPayment>;
}
