import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "ჩვენ შესახებ",
  description: "Gagrileba.ge არის HVAC კომპანია კონდიციონერის მონტაჟის, სერვისისა და პროდუქციის შერჩევის გამოცდილებით საქართველოში.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { t } = await getI18n();
  return (
    <section className="section bg-white">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-black">{t.aboutPage.title}</h1>
        {t.aboutPage.paragraphs.map((paragraph, index) => (
          <p key={paragraph} className={`${index === 0 ? "mt-5 text-lg" : "mt-4"} leading-8 text-slate-700`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
