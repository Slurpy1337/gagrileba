import type { Metadata } from "next";
import ProductsPage from "../products/page";

export const metadata: Metadata = {
  title: "წყლის გამაცხელებლები",
  description: "წყლის გამაცხელებლები სახლისა და კომერციული სივრცეებისთვის. შეარჩიეთ მოდელი ფასით, ბრენდითა და გარანტიით.",
  alternates: { canonical: "/water-heaters" },
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return ProductsPage({ searchParams: searchParams.then((p) => ({ ...p, category: p.category ?? "water-heaters" })) });
}
