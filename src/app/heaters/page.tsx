import type { Metadata } from "next";
import ProductsPage from "../products/page";

export const metadata: Metadata = {
  title: "გამათბობლები და გათბობის მოწყობილობები",
  description: "შეარჩიეთ გამათბობლები და გათბობის მოწყობილობები ფასით, ბრენდითა და მიწოდების პირობებით.",
  alternates: { canonical: "/heaters" },
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return ProductsPage({ searchParams: searchParams.then((p) => ({ ...p, category: p.category ?? "heaters" })) });
}
