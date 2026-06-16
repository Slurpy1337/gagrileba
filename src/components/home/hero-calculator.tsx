"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Snowflake } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const btuBands = [
  { maxArea: 25, btu: 9000 },
  { maxArea: 40, btu: 12000 },
  { maxArea: 60, btu: 18000 },
  { maxArea: 80, btu: 24000 },
];

function recommendedBtu(area: number, height: number) {
  const normalizedArea = area * Math.max(1, height / 3);
  const band = btuBands.find((item) => normalizedArea <= item.maxArea);
  if (band) return band.btu;
  return Math.ceil(normalizedArea / 20) * 6000;
}

type Labels = {
  title: string;
  area: string;
  height: string;
  recommendation: string;
  approx: string;
  models: string;
};

export function HeroCalculator({ labels }: { labels: Labels }) {
  const [area, setArea] = useState(25);
  const [height, setHeight] = useState(3);

  const result = useMemo(() => {
    const btu = recommendedBtu(area, height);
    return { btu, kw: Math.round((btu / 3412) * 10) / 10 };
  }, [area, height]);

  return (
    <div className="w-full max-w-[360px] rounded-[22px] bg-white p-5 shadow-[0_24px_80px_rgba(3,105,161,0.22)] ring-1 ring-[#0ea5e9]/12">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0ea5e9]">
          <Snowflake size={20} />
        </span>
        <h2 className="text-lg font-black text-[#0f172a]">{labels.title}</h2>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <label className="grid min-w-0 gap-2 text-xs font-bold text-slate-500">
          {labels.area}
          <input value={area} onChange={(event) => setArea(Math.max(1, Number(event.target.value) || 1))} inputMode="numeric" className="h-11 min-w-0 rounded-xl border-0 bg-[#f1f5f9] px-3 text-sm font-black text-[#0f172a] outline-none ring-1 ring-transparent focus:ring-[#0ea5e9]" />
        </label>
        <label className="grid min-w-0 gap-2 text-xs font-bold text-slate-500">
          {labels.height}
          <input value={height} onChange={(event) => setHeight(Math.max(2, Number(event.target.value) || 3))} inputMode="decimal" className="h-11 min-w-0 rounded-xl border-0 bg-[#f1f5f9] px-3 text-sm font-black text-[#0f172a] outline-none ring-1 ring-transparent focus:ring-[#0ea5e9]" />
        </label>
      </div>

      <div className="mt-5 rounded-2xl bg-[#e0f2fe] p-5">
        <p className="text-xs font-black uppercase text-[#0369a1]">{labels.recommendation}</p>
        <p className="mt-2 text-3xl font-black text-[#0f172a]">{result.btu} BTU</p>
        <p className="mt-2 text-sm font-bold text-[#075985]">{labels.approx.replace("{kw}", String(result.kw))}</p>
      </div>

      <LinkButton href={`/products?btu=${result.btu}`} className="mt-5 w-full">
        {labels.models} <ArrowRight size={17} />
      </LinkButton>
    </div>
  );
}
