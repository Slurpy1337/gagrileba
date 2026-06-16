import { CheckoutClient } from "@/app/checkout/checkout-client";
import { getI18n } from "@/lib/i18n";

export default async function CheckoutPage() {
  const { t } = await getI18n();

  return (
    <section className="section">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-black">{t.checkout.title}</h1>
        <CheckoutClient labels={t.checkout} />
      </div>
    </section>
  );
}
