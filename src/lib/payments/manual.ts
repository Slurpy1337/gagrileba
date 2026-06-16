import type { CreatePaymentInput, PaymentProvider, PaymentProviderName, ProviderPayment } from "./types";

function manualProvider(name: Extract<PaymentProviderName, "cash" | "bank_transfer" | "installment">): PaymentProvider {
  return {
    name,
    async createPayment(input: CreatePaymentInput): Promise<ProviderPayment> {
      return {
        provider: name,
        providerPaymentId: `${name}_${input.orderNumber}`,
        status: "pending",
        rawPayload: {
          orderNumber: input.orderNumber,
          amount: input.amount,
          mode: "manual_review",
        },
      };
    },
    async verifyPayment(providerPaymentId: string) {
      return { provider: name, providerPaymentId, status: "pending", rawPayload: { mode: "manual_review" } };
    },
    async handleWebhook(payload: unknown) {
      return { provider: name, status: "unknown", rawPayload: { payload, ignored: true } };
    },
    async refundPayment(providerPaymentId: string, amount: number) {
      return { provider: name, providerPaymentId, status: "unknown", rawPayload: { amount, mode: "manual_refund" } };
    },
  };
}

export const cashProvider = manualProvider("cash");
export const bankTransferProvider = manualProvider("bank_transfer");
export const installmentProvider = manualProvider("installment");
