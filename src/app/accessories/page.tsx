import type { Metadata } from "next";
import ProductsPage from "../products/page";

export const metadata: Metadata = {
  title: "კონდიციონერის აქსესუარები და სპილენძის მილები",
  description: "HVAC აქსესუარები, სპილენძის მილები და კონდიციონერის მონტაჟისთვის საჭირო კომპონენტები მიწოდებით საქართველოში.",
  alternates: { canonical: "/accessories" },
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return ProductsPage({ searchParams: searchParams.then((p) => ({ ...p, category: p.category ?? "accessories" })) });
}
