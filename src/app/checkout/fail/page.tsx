import Link from "next/link";
import { XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default async function CheckoutFailPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  return (
    <section className="section">
      <div className="container max-w-2xl">
        <Card className="p-8 text-center">
          <XCircle className="mx-auto text-rose-500" size={48} />
          <h1 className="mt-5 text-3xl font-black">გადახდა ვერ დასრულდა</h1>
          <p className="mt-3 leading-7 text-slate-600">
            შეკვეთა {params.order ? <strong>{params.order}</strong> : null} ჯერ არ არის გადახდილი. შეგიძლიათ სცადოთ თავიდან ან დაგვიკავშირდეთ.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton href="/products">ხელახლა ცდა</LinkButton>
            <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-bold text-[#0369a1] hover:bg-[#e0f2fe]">
              კონტაქტი
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
