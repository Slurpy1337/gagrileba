import type { Metadata } from "next";
import ProductsPage from "../products/page";

export const metadata: Metadata = {
  title: "გაზის ქვაბები და გათბობის სისტემები",
  description: "გაზის ქვაბები და გათბობის მოწყობილობები ოფიციალური გარანტიით, კონსულტაციითა და მიწოდებით.",
  alternates: { canonical: "/gas-boilers" },
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return ProductsPage({ searchParams: searchParams.then((p) => ({ ...p, category: p.category ?? "gas-boilers" })) });
}
