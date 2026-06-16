import type { Metadata } from "next";
import ProductsPage from "../products/page";

export const metadata: Metadata = {
  title: "კონდიციონერები თბილისში და საქართველოში",
  description: "შეარჩიეთ კონდიციონერი ოთახის ფართობის, BTU სიმძლავრის, ბრენდისა და ფასის მიხედვით. ხელმისაწვდომია მონტაჟი, მიწოდება და BOG განვადება.",
  alternates: { canonical: "/air-conditioners" },
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return ProductsPage({ searchParams: searchParams.then((p) => ({ ...p, category: p.category ?? "air-conditioners" })) });
}
