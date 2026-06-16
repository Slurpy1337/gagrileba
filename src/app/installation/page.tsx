import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/lead-form";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n";
import { faqJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "კონდიციონერის პროფესიონალური მონტაჟი",
  description: "კონდიციონერის მონტაჟი პროფესიონალური გუნდით, გამჭვირვალე პირობებით, შემოწმებითა და გარანტიით თბილისში და საქართველოში.",
  alternates: { canonical: "/installation" },
};

export default async function InstallationPage() {
  const { t } = await getI18n();
  const page = t.installationPage;
  return (
    <section className="bg-white py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd()) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd([
            {
              question: "What does standard air conditioner installation include?",
              answer: "Standard installation includes mounting indoor and outdoor units, standard pipe routing, drainage connection, startup, inspection, and basic customer instructions.",
            },
            {
              question: "How is the final installation price confirmed?",
              answer: "The final price is confirmed according to the address, wall type, floor, pipe length, drainage conditions, and whether old equipment must be removed.",
            },
          ])),
        }}
      />
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_.98fr]">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black leading-[1.08] text-[#0f172a] md:text-5xl">{page.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-9 text-slate-600">{page.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="#request" size="lg">{page.request}</LinkButton>
              <LinkButton href="/products" variant="outline" size="lg">{page.chooseProduct}</LinkButton>
            </div>
          </div>
          <Card className="p-6 shadow-[0_26px_80px_rgba(14,165,233,0.14)] md:p-8">
            <h2 className="text-xl font-black leading-8 text-[#0f172a]">{page.standardTitle}</h2>
            <ul className="mt-5 grid gap-4 text-base font-medium leading-7 text-slate-600">
              {page.standard.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-6 rounded-lg bg-[#e0f2fe] px-4 py-3 font-black leading-7 text-[#0369a1]">{page.priceNote}</p>
          </Card>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {page.extras.map((extra) => (
            <Card key={extra} className="flex min-h-20 items-center p-5 text-sm font-black leading-6 text-[#0f172a] shadow-[0_18px_55px_rgba(14,165,233,0.10)]">
              {extra}
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[.9fr_1fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-black text-[#0f172a]">{page.processTitle}</h2>
            <ol className="mt-7 grid gap-7">
              {page.process.map((step, index) => (
                <li key={step} className="text-base font-black text-[#0f172a]">
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
          <Card id="request" className="p-6 shadow-[0_28px_90px_rgba(14,165,233,0.14)] md:p-8">
            <h2 className="text-2xl font-black text-[#0f172a] md:text-3xl">{page.formTitle}</h2>
            <div className="mt-6"><LeadForm source="installation" compact labels={t.lead} /></div>
          </Card>
        </div>
      </div>
    </section>
  );
}
