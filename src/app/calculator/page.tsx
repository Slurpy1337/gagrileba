import { CalculatorClient } from "@/app/calculator/calculator-client";
import { getI18n } from "@/lib/i18n";

export default async function WizardPage() {
  const { t } = await getI18n();

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-black">{t.calculator.wizardTitle}</h1>
        <p className="mt-3 text-slate-600">{t.calculator.wizardText}</p>
        <CalculatorClient labels={t.calculator} />
      </div>
    </section>
  );
}
