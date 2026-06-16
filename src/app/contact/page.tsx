import type { Metadata } from "next";
import { MessageCircle, Phone, Send } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { site } from "@/lib/content";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "კონტაქტი",
  description: "დაგვიკავშირდით კონდიციონერის შერჩევის, მონტაჟის, მიწოდებისა და გარანტიის საკითხებზე. ტელეფონი, WhatsApp და Messenger.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { t } = await getI18n();
  return (
    <section className="section">
      <div className="container grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-black">{t.contactPage.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{t.contactPage.intro}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <LinkButton href={`tel:${site.phone}`}><Phone size={18} /> {t.common.call}</LinkButton>
            <LinkButton href={site.messenger} variant="outline"><MessageCircle size={18} /> Messenger</LinkButton>
            <LinkButton href={site.whatsapp} variant="accent"><Send size={18} /> WhatsApp</LinkButton>
          </div>
          <Card className="mt-8 p-5">
            <p><strong>{t.common.phone}:</strong> {site.phone}</p>
            <p><strong>{t.common.email}:</strong> {site.email}</p>
            <p><strong>{t.common.hours}:</strong> {t.contactPage.hours}</p>
            <p><strong>{t.common.serviceArea}:</strong> {t.contactPage.serviceArea}</p>
          </Card>
        </div>
        <Card className="p-6">
          <h2 className="text-2xl font-black">{t.contactPage.write}</h2>
          <div className="mt-5"><LeadForm source="contact" labels={t.lead} /></div>
        </Card>
      </div>
    </section>
  );
}
