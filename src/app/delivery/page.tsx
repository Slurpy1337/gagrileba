import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "მიწოდების პოლიტიკა",
  description: "გაიგეთ როგორ ხდება პროდუქციის მიწოდება, დროის შეთანხმება და მონტაჟთან დაკავშირებული ლოგისტიკა Gagrileba.ge-ზე.",
  alternates: { canonical: "/delivery" },
};

export default async function DeliveryPage() {
  const { t } = await getI18n();
  return <PolicyPage title={t.policies.delivery.title} text={t.policies.delivery.text} />;
}
