import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n";

export default async function CartPage() {
  const { t } = await getI18n();
  return (
    <section className="section">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-black">{t.cartPage.title}</h1>
        <Card className="mt-6 p-6">
          <p className="text-slate-600">{t.cartPage.text}</p>
          <LinkButton href="/products" className="mt-5">{t.cartPage.viewProducts}</LinkButton>
        </Card>
      </div>
    </section>
  );
}
