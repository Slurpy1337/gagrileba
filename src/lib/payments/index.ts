import { bogProvider } from "./bog";
import { bankTransferProvider, cashProvider } from "./manual";

export const paymentProviders = {
  bog: bogProvider,
  bank_transfer: bankTransferProvider,
  cash: cashProvider,
};

export function providerForPaymentMethod(paymentMethod: string) {
  if (paymentMethod === "card" || paymentMethod === "installment") return paymentProviders.bog;
  if (paymentMethod === "bank_transfer") return paymentProviders.bank_transfer;
  return paymentProviders.cash;
}
