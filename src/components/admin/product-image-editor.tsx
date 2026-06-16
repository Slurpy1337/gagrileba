"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageRow = {
  id: string;
  url: string;
  alt: string;
};

type Props = {
  productName?: string;
  mainImageUrl?: string | null;
  images?: { url: string; alt: string }[];
};

const input = "h-11 rounded-lg border border-[#0ea5e9]/24 bg-white px-3 text-sm outline-none focus:border-[#0ea5e9]";

function newRow(url = "", alt = ""): ImageRow {
  return { id: crypto.randomUUID(), url, alt };
}

export function ProductImageEditor({ productName = "", mainImageUrl, images = [] }: Props) {
  const initialRows = images.length ? images.map((image) => newRow(image.url, image.alt)) : [newRow("", productName)];
  const [rows, setRows] = useState<ImageRow[]>(initialRows);
  const [mainUrl, setMainUrl] = useState(mainImageUrl ?? images[0]?.url ?? "");

  const serializedImages = useMemo(
    () =>
      rows
        .map((row) => ({ url: row.url.trim(), alt: row.alt.trim() }))
        .filter((row) => row.url)
        .map((row) => `${row.url}${row.alt ? ` | ${row.alt}` : ""}`)
        .join("\n"),
    [rows],
  );

  function updateRow(id: string, patch: Partial<ImageRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setRows((current) => {
      const removed = current.find((row) => row.id === id);
      const next = current.filter((row) => row.id !== id);
      if (removed?.url === mainUrl) setMainUrl(next.find((row) => row.url)?.url ?? "");
      return next.length ? next : [newRow("", productName)];
    });
  }

  function moveRow(id: string, direction: -1 | 1) {
    setRows((current) => {
      const index = current.findIndex((row) => row.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name="images" value={serializedImages} />

      <label className="grid gap-1 text-sm font-bold text-slate-700">
        Main image URL
        <input name="mainImageUrl" value={mainUrl} onChange={(event) => setMainUrl(event.target.value)} className={input} placeholder="https://..." />
      </label>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-800">Product gallery</h3>
            <p className="text-xs font-semibold text-slate-500">Add URLs, edit alt text, reorder images, and mark one as the main image.</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => setRows((current) => [...current, newRow("", productName)])}>
            <ImagePlus size={16} /> Add image
          </Button>
        </div>

        {rows.map((row, index) => {
          const isMain = row.url && row.url === mainUrl;
          return (
            <div key={row.id} className="grid gap-3 rounded-xl border border-[#0ea5e9]/16 bg-[#f8fafc] p-3 md:grid-cols-[96px_1fr]">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white ring-1 ring-[#0ea5e9]/16">
                {row.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.url} alt={row.alt || productName || "Product image"} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">No image</div>
                )}
                {isMain ? <span className="absolute left-1 top-1 rounded-full bg-[#0ea5e9] px-2 py-1 text-[10px] font-black text-white">Main</span> : null}
              </div>

              <div className="grid gap-2">
                <input value={row.url} onChange={(event) => updateRow(row.id, { url: event.target.value })} className={input} placeholder="Image URL" />
                <input value={row.alt} onChange={(event) => updateRow(row.id, { alt: event.target.value })} className={input} placeholder="Alt text" />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="ghost" onClick={() => row.url && setMainUrl(row.url)} disabled={!row.url || Boolean(isMain)}>
                    <Star size={15} /> Main
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => moveRow(row.id, -1)} disabled={index === 0}>
                    <ArrowUp size={15} /> Up
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => moveRow(row.id, 1)} disabled={index === rows.length - 1}>
                    <ArrowDown size={15} /> Down
                  </Button>
                  <Button type="button" variant="ghost" className="text-red-700 hover:bg-red-50" onClick={() => removeRow(row.id)}>
                    <Trash2 size={15} /> Remove
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
