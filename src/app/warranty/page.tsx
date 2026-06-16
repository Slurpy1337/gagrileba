import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "გარანტია",
  description: "ინფორმაცია პროდუქციის მწარმოებლის გარანტიასა და მონტაჟის სამუშაოს პირობებზე.",
  alternates: { canonical: "/warranty" },
};

export default async function WarrantyPage() {
  const { t } = await getI18n();
  return <PolicyPage title={t.policies.warranty.title} text={t.policies.warranty.text} />;
}
