"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MouseEvent } from "react";
import { useMemo, useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const galleryImages = useMemo(() => images.filter((image) => image.url), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  function showImage(index: number) {
    if (!galleryImages.length) return;
    setActiveIndex((index + galleryImages.length) % galleryImages.length);
  }

  function updateZoomOrigin(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  if (!activeImage) return null;

  return (
    <div className="grid gap-4">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#dbeafe] bg-white shadow-[0_24px_70px_rgba(14,165,233,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(14,165,233,0.18)]"
        onMouseMove={updateZoomOrigin}
        onMouseLeave={() => setOrigin("50% 50%")}
      >
        <Image
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt || productName}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-contain p-6 transition duration-500 ease-out group-hover:scale-125 md:p-10"
          style={{ transformOrigin: origin }}
        />
        {galleryImages.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={() => showImage(activeIndex - 1)}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0369a1] opacity-100 shadow-lg ring-1 ring-[#0ea5e9]/20 transition hover:bg-[#e0f2fe] md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={() => showImage(activeIndex + 1)}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0369a1] opacity-100 shadow-lg ring-1 ring-[#0ea5e9]/20 transition hover:bg-[#e0f2fe] md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {galleryImages.map((image, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                aria-label={`View product image ${index + 1}`}
                onClick={() => showImage(index)}
                className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  active ? "border-[#0ea5e9] shadow-[0_12px_30px_rgba(14,165,233,0.18)]" : "border-slate-200"
                }`}
              >
                <Image src={image.url} alt={image.alt || productName} fill sizes="112px" className="object-contain p-2" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
