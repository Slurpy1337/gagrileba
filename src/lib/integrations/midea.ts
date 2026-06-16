import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

export const MIDEA_PRODUCT_URLS = [
  "https://www.midea.ge/ka/product/kondicioneri-mscb-09hrfn8-breezeless/680",
  "https://www.midea.ge/ka/product/kondicioneri-af-12n8d1-forest/672",
  "https://www.midea.ge/ka/product/kondicioneri-af-12n8do-forest/673",
  "https://www.midea.ge/ka/product/kondicioneri-mscb-12hrfn8-breezeless/681",
  "https://www.midea.ge/ka/product/kondicioneri-ag-12n8d1-ioniser-xtreme/677",
  "https://www.midea.ge/ka/product/kondicioneri-midea-msagbu-12hrfnx/701",
  "https://www.midea.ge/ka/product/kondicioneri-ag2eco-12nxd0/714",
  "https://www.midea.ge/ka/product/kondicioneri-xt-09n8d6-gold-penrose-xt/610",
  "https://www.midea.ge/ka/product/kondicioneri-xt-09n8d6-silver-penrose-xt/612",
  "https://www.midea.ge/ka/product/kondicioneri-midea-ag-12n8d1-ioniserblack-xtreme/771",
  "https://www.midea.ge/ka/product/kondicioneri-xt-09n8d6-black-penrose-xt/608",
  "https://www.midea.ge/ka/product/kondicioneri-xt-12n8d6-gold-penrose-xt/611",
  "https://www.midea.ge/ka/product/kondicioneri-xt-12n8d6-silver-penrose-xt/613",
  "https://www.midea.ge/ka/product/kondicioneri-xt-12n8d6-black-penrose-xt/609",
  "https://www.midea.ge/ka/product/kondicioneri-af-18n8d0-forest/594",
  "https://www.midea.ge/ka/product/kondicioneri-mae-12n8d6-all-easy-pro/481",
  "https://www.midea.ge/ka/product/kondicioneri-ag-18n8do-ioniser-xtreme/399",
  "https://www.midea.ge/ka/product/kondicioneri-mscb-18hrfn8-breezeless/668",
  "https://www.midea.ge/ka/product/kondicioneri-gaia-09hrfn8/519",
  "https://www.midea.ge/ka/product/kondicioneri-ag-18n8do-ioniser-black-xtreme/606",
  "https://www.midea.ge/ka/product/kondicioneri-xt-18n8d6-gold-penrose-xt/654",
  "https://www.midea.ge/ka/product/kondicioneri--xt-18n8d6-silver-penrose-xt/655",
  "https://www.midea.ge/ka/product/kondicioneri-mae-18n8d6-all-easy-pro/485",
  "https://www.midea.ge/ka/product/kondicioneri-gaia-12hrfn8/528",
  "https://www.midea.ge/ka/product/kondicioneri-af-24n8d0-forest/595",
  "https://www.midea.ge/ka/product/kondicioneri-vp-12n8d6-vertu/489",
  "https://www.midea.ge/ka/product/kondicioneri-gaia-18hrfn8/657",
  "https://www.midea.ge/ka/product/kondicioneri-ag-24n8do-ioniser-xtreme/400",
  "https://www.midea.ge/ka/product/kondicioneri-ag-24n8do-ioniser-black-xtreme/607",
  "https://www.midea.ge/ka/product/kondicioneri-gaia-24hrfn8/658",
  "https://www.midea.ge/ka/product/kondicioneri-mae-24n8d6-all-easy-pro/486",
  "https://www.midea.ge/ka/product/kondicioneri--msag-12hrn1/602",
  "https://www.midea.ge/ka/product/kondicioneri---msag-12hrn1-black/599",
  "https://www.midea.ge/ka/product/kondicioneri-msag-18hrn1/603",
  "https://www.midea.ge/ka/product/kondicioneri--msag-18hrn1-black/600",
  "https://www.midea.ge/ka/product/kondicioneri-msaf-24hrn8-w/309",
  "https://www.midea.ge/ka/product/kondicioneri--msag-24hrn1-/604",
  "https://www.midea.ge/ka/product/kondicioneri--msag-24hrn1-black/601",
  "https://www.midea.ge/en/product/conditioner-mscb-12hrfn8-breezeless/681",
  "https://www.midea.ge/en/product/floor-standing-conditioner-mfj2-48arn1-rb6/202",
  "https://www.midea.ge/en/product/floor-standing-conditioner-mfm-60arn1-rb6/135",
  "https://www.midea.ge/en/product/portable-mppd-09crn7-cooling/535",
  "https://www.midea.ge/en/product/portable-mppx-12crn7-cooling/786",
  "https://www.midea.ge/ka/product/kondicioneri-msaf-07hrn8-w-/305",
  "https://www.midea.ge/ka/product/kondicioneri-msaf-09hrn8-w-/306",
  "https://www.midea.ge/ka/product/kondicioneri-msaf-12hrn8-w-/307",
];

type MideaStatus = "ok" | "out" | "404" | "error";

type ScrapedMideaProduct = {
  url: string;
  status: MideaStatus;
  title?: string;
  price?: number;
  oldPrice?: number;
  imageUrl?: string;
  error?: string;
};

function jsonPayload(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

const ignoredTokens = new Set([
  "air",
  "conditioner",
  "conditioning",
  "conditioner",
  "cooling",
  "floor",
  "standing",
  "kondicioneri",
  "midea",
  "ka",
  "en",
  "product",
]);

function canonicalUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function decodeHtml(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(input: string) {
  return slugify(input).replace(/-/g, " ");
}

function tokens(input: string) {
  return new Set(
    normalize(input)
      .split(/\s+/)
      .filter((token) => token.length > 1 && !ignoredTokens.has(token)),
  );
}

function urlName(url: string) {
  const match = canonicalUrl(url).match(/\/product\/([^/]+)\/\d+$/);
  return match ? match[1].replace(/-+/g, " ") : url;
}

function productCodeTokens(input: string) {
  return new Set((input.toUpperCase().match(/[A-Z0-9]+(?:[-/][A-Z0-9]+)+/g) ?? []).map((value) => value.replace(/\//g, "-")));
}

function scoreMatch(source: string, product: { name: string; model: string; sku: string; slug: string }) {
  const sourceTokens = tokens(source);
  const productTokens = tokens(`${product.name} ${product.model} ${product.sku} ${product.slug}`);
  const sourceCodes = productCodeTokens(source);
  const productCodes = productCodeTokens(`${product.name} ${product.model} ${product.sku}`);
  let score = 0;

  for (const token of sourceTokens) {
    if (productTokens.has(token)) score += token.length >= 4 ? 2 : 1;
  }
  for (const code of sourceCodes) {
    if (productCodes.has(code)) score += 8;
  }
  if (sourceTokens.has("black") && productTokens.has("black")) score += 4;
  if (sourceTokens.has("black") && !productTokens.has("black")) score -= 3;
  if (!sourceTokens.has("black") && productTokens.has("black")) score -= 1;
  if (sourceTokens.has("silver") && productTokens.has("silver")) score += 3;
  if (sourceTokens.has("gold") && productTokens.has("gold")) score += 3;

  return score;
}

function priceFromHtml(html: string, className: string) {
  const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<span[^>]*class=["'][^"']*${escapedClass}[^"']*["'][\\s\\S]*?<b[^>]*>([\\s\\S]*?)<\\/b>`, "i"));
  const raw = decodeHtml(match?.[1] ?? "");
  const price = Number(raw.replace(/GEL|₾/gi, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(price) && price > 0 ? Math.round(price) : null;
}

export async function fetchMideaProduct(url: string): Promise<ScrapedMideaProduct> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Gagrileba price sync (+https://gagrileba.ge)",
      },
    });
    if (response.status === 404) return { url, status: "404" };
    if (!response.ok) return { url, status: "error", error: `HTTP ${response.status}` };

    const html = await response.text();
    const title = decodeHtml(html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
    const price = priceFromHtml(html, "products-item-price-value");
    const oldPrice = priceFromHtml(html, "products-item-price-old");

    if (!price) return { url, status: "out", title, imageUrl };
    return { url, status: "ok", title, price, oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined, imageUrl };
  } catch (error) {
    return { url, status: "error", error: error instanceof Error ? error.message : String(error) };
  }
}

export async function linkMideaProducts({ dryRun = false } = {}) {
  const products = await prisma.product.findMany({
    where: { brand: { slug: "midea" } },
    select: { id: true, name: true, model: true, sku: true, slug: true },
  });
  const used = new Set<string>();
  const results = [];

  for (const url of [...new Set(MIDEA_PRODUCT_URLS.map(canonicalUrl))]) {
    const scraped = await fetchMideaProduct(url);
    const source = `${urlName(url)} ${scraped.title ?? ""}`;
    const ranked = products
      .filter((product) => !used.has(product.id))
      .map((product) => ({ product, score: scoreMatch(source, product) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];

    const minimumScore = scraped.status === "404" || scraped.status === "out" ? 4 : 5;
    if (!best || best.score < minimumScore) {
      results.push({ url, status: scraped.status, matched: false, score: best?.score ?? 0, title: scraped.title });
      continue;
    }

    used.add(best.product.id);
    if (!dryRun) {
      await prisma.product.update({
        where: { id: best.product.id },
        data: {
          sourceProvider: "midea",
          sourceUrl: url,
          sourcePriceStatus: scraped.status,
          sourceLastSyncedAt: new Date(),
          sourceRawPayload: jsonPayload(scraped),
          stock: scraped.status === "404" || scraped.status === "out" ? 0 : undefined,
        },
      });
    }
    results.push({ url, status: scraped.status, matched: true, score: best.score, product: best.product.name, productSlug: best.product.slug });
  }

  return {
    linked: results.filter((result) => result.matched).length,
    unmatched: results.filter((result) => !result.matched).length,
    results,
  };
}

export async function syncMideaPrices({ dryRun = false, archiveUnavailable = false } = {}) {
  const products = await prisma.product.findMany({
    where: { sourceProvider: "midea", sourceUrl: { not: null } },
    select: { id: true, name: true, price: true, oldPrice: true, stock: true, status: true, sourceUrl: true },
  });
  const results = [];

  for (const product of products) {
    if (!product.sourceUrl) continue;
    const scraped = await fetchMideaProduct(product.sourceUrl);
    const update =
      scraped.status === "ok" && scraped.price
        ? {
            price: scraped.price,
            oldPrice: scraped.oldPrice ?? null,
            stock: product.stock > 0 ? product.stock : 5,
            sourcePriceStatus: "ok",
            sourceLastSyncedAt: new Date(),
            sourceRawPayload: jsonPayload(scraped),
          }
        : {
            stock: 0,
            status: archiveUnavailable ? ("archived" as const) : product.status,
            sourcePriceStatus: scraped.status,
            sourceLastSyncedAt: new Date(),
            sourceRawPayload: jsonPayload(scraped),
          };

    if (!dryRun) {
      await prisma.product.update({ where: { id: product.id }, data: update });
    }
    results.push({
      product: product.name,
      url: product.sourceUrl,
      status: scraped.status,
      price: scraped.price,
      oldPrice: scraped.oldPrice,
      changed: scraped.status === "ok" ? Number(product.price) !== scraped.price || Number(product.oldPrice ?? 0) !== Number(scraped.oldPrice ?? 0) : product.stock !== 0,
    });
  }

  return {
    checked: results.length,
    updated: results.filter((result) => result.changed).length,
    ok: results.filter((result) => result.status === "ok").length,
    unavailable: results.filter((result) => result.status === "out" || result.status === "404").length,
    errors: results.filter((result) => result.status === "error").length,
    results,
  };
}
