import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "წესები და პირობები",
  description: "Gagrileba.ge-ის შეკვეთის, გადახდის, მიწოდებისა და მონტაჟის ზოგადი წესები და პირობები.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const { t } = await getI18n();
  return <PolicyPage title={t.policies.terms.title} text={t.policies.terms.text} />;
}
