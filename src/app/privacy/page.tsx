import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "კონფიდენციალურობა",
  description: "როგორ იყენებს Gagrileba.ge საკონტაქტო, შეკვეთისა და კონსულტაციის მონაცემებს.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const { t } = await getI18n();
  return <PolicyPage title={t.policies.privacy.title} text={t.policies.privacy.text} />;
}
