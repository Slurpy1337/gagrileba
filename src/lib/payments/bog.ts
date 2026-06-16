import { randomUUID } from "crypto";
import { env } from "@/lib/env";
import type { CreatePaymentInput, PaymentProvider, ProviderPayment } from "./types";

type BogOrderResponse = {
  id?: string;
  _links?: {
    redirect?: { href?: string };
    details?: { href?: string };
  };
};

type BogCallbackPayload = {
  event?: string;
  body?: {
    order_id?: string;
    external_order_id?: string;
    order_status?: { key?: string; value?: string };
    payment_detail?: { code?: string; code_description?: string };
  };
};

function isConfigured() {
  return Boolean(env.BOG_CLIENT_ID && env.BOG_CLIENT_SECRET);
}

async function getAccessToken() {
  if (!env.BOG_CLIENT_ID || !env.BOG_CLIENT_SECRET) {
    throw new Error("BOG credentials are not configured.");
  }

  const credentials = Buffer.from(`${env.BOG_CLIENT_ID}:${env.BOG_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(env.BOG_AUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.access_token !== "string") {
    throw new Error(`BOG auth failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload.access_token as string;
}

function mapBogStatus(payload: unknown): ProviderPayment["status"] {
  const serialized = JSON.stringify(payload).toLowerCase();
  if (serialized.includes("completed") || serialized.includes("success") || serialized.includes("paid")) return "paid";
  if (serialized.includes("rejected") || serialized.includes("failed") || serialized.includes("declined")) return "failed";
  if (serialized.includes("cancel")) return "cancelled";
  return "pending";
}

function createOrderPayload(input: CreatePaymentInput) {
  const installment = input.paymentMethod === "installment";

  return {
    callback_url: input.callbackUrl,
    external_order_id: input.orderNumber,
    buyer: {
      full_name: input.customer.name,
      masked_email: input.customer.email ?? undefined,
      masked_phone: input.customer.phone,
    },
    purchase_units: {
      currency: input.currency,
      total_amount: input.amount,
      basket: [
        {
          product_id: input.orderNumber,
          description: `Gagrileba.ge order ${input.orderNumber}`,
          quantity: 1,
          unit_price: input.amount,
          total_price: input.amount,
        },
      ],
    },
    redirect_urls: {
      success: input.successUrl,
      fail: input.failUrl,
    },
    payment_method: installment ? ["bog_loan"] : ["card"],
    ...(installment
      ? {
          config: {
            loan: {
              type: env.BOG_LOAN_TYPE,
              month: input.installmentMonth,
            },
          },
        }
      : {}),
  };
}

export const bogProvider: PaymentProvider = {
  name: "bog",
  async createPayment(input: CreatePaymentInput): Promise<ProviderPayment> {
    if (!isConfigured()) {
      return {
        provider: "bog",
        providerPaymentId: `bog_pending_${input.orderNumber}`,
        status: "pending",
        rawPayload: {
          ready: false,
          reason: "BOG_CLIENT_ID and BOG_CLIENT_SECRET are not configured.",
          paymentMethod: input.paymentMethod,
          amount: input.amount,
        },
      };
    }

    const token = await getAccessToken();
    const payload = createOrderPayload(input);
    const response = await fetch(`${env.BOG_API_URL}/payments/v1/ecommerce/orders`, {
      method: "POST",
      headers: {
        "Accept-Language": "ka",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json().catch(() => ({}))) as BogOrderResponse;
    if (!response.ok || !result.id) {
      throw new Error(`BOG order creation failed: ${response.status} ${JSON.stringify(result)}`);
    }

    return {
      provider: "bog",
      providerPaymentId: result.id,
      status: "pending",
      redirectUrl: result._links?.redirect?.href,
      rawPayload: { request: payload, response: result },
    };
  },
  async verifyPayment(providerPaymentId: string) {
    const token = await getAccessToken();
    const response = await fetch(`${env.BOG_API_URL}/payments/v1/receipt/${providerPaymentId}`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "ka" },
    });
    const payload = await response.json().catch(() => ({}));
    return {
      provider: "bog",
      providerPaymentId,
      status: response.ok ? mapBogStatus(payload) : "unknown",
      rawPayload: payload,
    };
  },
  async handleWebhook(payload: unknown, signature?: string | null) {
    const typed = payload as BogCallbackPayload;
    const body = typed.body ?? {};
    return {
      provider: "bog",
      providerPaymentId: body.order_id,
      status: mapBogStatus(payload),
      rawPayload: { payload, signaturePresent: Boolean(signature) },
    };
  },
  async refundPayment(providerPaymentId: string, amount: number) {
    return {
      provider: "bog",
      providerPaymentId,
      status: "unknown",
      rawPayload: { amount, mode: "manual_refund_from_business_manager" },
    };
  },
};
