import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "დაბრუნება და ანაზღაურება",
  description: "დაბრუნებისა და ანაზღაურების პირობები კონდიციონერების, აქსესუარებისა და მონტაჟთან დაკავშირებული შეკვეთებისთვის.",
  alternates: { canonical: "/returns" },
};

export default async function ReturnsPage() {
  const { t } = await getI18n();
  return <PolicyPage title={t.policies.returns.title} text={t.policies.returns.text} />;
}
