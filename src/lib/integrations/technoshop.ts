import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

const TECHNOSHOP_ORIGIN = "https://technoshop.ge";
export const TECHNOSHOP_BRAND_SLUGS = ["beko", "millen", "vox", "aux"];

type TechnoshopStatus = "ok" | "out" | "404" | "error";

type ScrapedTechnoshopProduct = {
  url: string;
  status: TechnoshopStatus;
  title?: string;
  price?: number;
  oldPrice?: number;
  imageUrl?: string;
  error?: string;
};

type ProductForMatching = {
  id: string;
  name: string;
  model: string;
  sku: string;
  slug: string;
  brand: { slug: string; name: string };
};

function jsonPayload(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
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

function stripTags(input: string) {
  return decodeHtml(input.replace(/<[^>]+>/g, " "));
}

function normalize(input: string) {
  return slugify(input).replace(/-/g, " ");
}

const ignoredTokens = new Set([
  "air",
  "conditioner",
  "kondicioneri",
  "beko",
  "millen",
  "vox",
  "aux",
  "set",
  "full",
  "on",
  "off",
  "inverter",
  "product",
  "gatboba",
  "gagrileba",
]);

function tokens(input: string) {
  return normalize(input)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !ignoredTokens.has(token));
}

function significantTokens(input: string) {
  return [...new Set(tokens(input))];
}

function canonicalUrl(url: string) {
  const absolute = url.startsWith("http") ? url : new URL(url, TECHNOSHOP_ORIGIN).toString();
  return absolute.replace(/\/+$/, "");
}

function priceFromText(input: string) {
  const value = Number(stripTags(input).replace(/GEL|\u20be/gi, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

function firstPrice(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const price = priceFromText(match?.[1] ?? "");
    if (price) return price;
  }
  return null;
}

function parsePrice(html: string) {
  return firstPrice(html, [
    /<span[^>]*id=["']sec_discounted_price_\d+["'][^>]*>([\s\S]*?)<\/span>/i,
    /<span[^>]*class=["'][^"']*ty-price-num[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
  ]);
}

function parseOldPrice(html: string) {
  return firstPrice(html, [
    /<span[^>]*id=["']sec_list_price_\d+["'][^>]*>([\s\S]*?)<\/span>/i,
    /<span[^>]*class=["'][^"']*ty-list-price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
  ]);
}

function parseTitle(html: string) {
  return stripTags(
    html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<a[^>]*class=["'][^"']*product-title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)?.[1] ??
      html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
      "",
  );
}

function parseImageUrl(html: string) {
  return (
    html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<img[^>]+class=["'][^"']*cm-image[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1]
  );
}

function parseSearchCards(html: string) {
  const results: ScrapedTechnoshopProduct[] = [];
  const seen = new Set<string>();
  const formPattern = /<form[\s\S]*?name=["']product_form_\d+["'][\s\S]*?<\/form>/gi;
  const forms = html.match(formPattern) ?? [];

  for (const form of forms) {
    const titleMatch = form.match(/<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*product-title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;
    const url = canonicalUrl(titleMatch[1]);
    if (seen.has(url)) continue;
    seen.add(url);
    const price = parsePrice(form);
    const oldPrice = parseOldPrice(form);
    results.push({
      url,
      status: price ? "ok" : "out",
      title: stripTags(titleMatch[2]),
      price: price ?? undefined,
      oldPrice: oldPrice && price && oldPrice > price ? oldPrice : undefined,
      imageUrl: parseImageUrl(form),
    });
  }

  return results;
}

async function fetchTechnoshopHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Gagrileba price sync (+https://gagrileba.ge)",
    },
  });
  if (response.status === 404) return { status: 404, html: "" };
  if (!response.ok) return { status: response.status, html: "" };
  return { status: response.status, html: await response.text() };
}

export async function searchTechnoshopProducts(query: string) {
  const url = `${TECHNOSHOP_ORIGIN}/index.php?dispatch=products.search&search_performed=Y&q=${encodeURIComponent(query)}`;
  const response = await fetchTechnoshopHtml(url);
  if (response.status === 404) return [];
  if (response.status !== 200) return [];
  return parseSearchCards(response.html);
}

export async function fetchTechnoshopProduct(url: string): Promise<ScrapedTechnoshopProduct> {
  try {
    const response = await fetchTechnoshopHtml(url);
    if (response.status === 404) return { url, status: "404" };
    if (response.status !== 200) return { url, status: "error", error: `HTTP ${response.status}` };

    const title = parseTitle(response.html);
    const imageUrl = parseImageUrl(response.html);
    const price = parsePrice(response.html);
    const oldPrice = parseOldPrice(response.html);
    if (!price) return { url, status: "out", title, imageUrl };

    return {
      url,
      status: "ok",
      title,
      price,
      oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined,
      imageUrl,
    };
  } catch (error) {
    return { url, status: "error", error: error instanceof Error ? error.message : String(error) };
  }
}

function searchQueries(product: ProductForMatching) {
  const brandPattern = new RegExp(`\\b(${product.brand.name}|${product.brand.slug})\\b`, "gi");
  const model = product.model.replace(brandPattern, "").trim();
  const compactModel = model.replace(/\s+/g, " ").trim();
  const modelTokens = significantTokens(model);
  const primaryToken = modelTokens.find((token) => /[a-z]/i.test(token) && /\d/.test(token)) ?? modelTokens[0];
  const familyToken = modelTokens.find((token) => /^[a-z]+$/i.test(token));
  return [...new Set([compactModel, primaryToken, familyToken].filter(Boolean) as string[])];
}

function scoreMatch(source: string, product: ProductForMatching) {
  const sourceTokens = new Set(significantTokens(source));
  const productTokens = significantTokens(`${product.model} ${product.sku}`);
  let score = 0;

  for (const token of productTokens) {
    if (sourceTokens.has(token)) score += token.length >= 4 ? 3 : 1;
  }
  if (productTokens.length > 0 && productTokens.every((token) => sourceTokens.has(token))) score += 8;
  if (sourceTokens.has(product.brand.slug)) score += 2;
  if (source.includes(product.slug.replace(/-/g, " "))) score += 2;

  return score;
}

async function findBestTechnoshopMatch(product: ProductForMatching) {
  const candidates = new Map<string, ScrapedTechnoshopProduct>();
  for (const query of searchQueries(product)) {
    const results = await searchTechnoshopProducts(query);
    for (const result of results) candidates.set(result.url, result);
    if (candidates.size) break;
  }

  const ranked = [...candidates.values()]
    .map((candidate) => ({
      candidate,
      score: scoreMatch(`${candidate.title ?? ""} ${candidate.url}`, product),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 6) return { matched: false as const, score: best?.score ?? 0, candidate: best?.candidate };
  return { matched: true as const, score: best.score, candidate: best.candidate };
}

export async function linkTechnoshopProducts({ dryRun = false } = {}) {
  const products = await prisma.product.findMany({
    where: { brand: { slug: { in: TECHNOSHOP_BRAND_SLUGS } } },
    select: { id: true, name: true, model: true, sku: true, slug: true, brand: { select: { slug: true, name: true } } },
    orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
  });
  const used = new Set<string>();
  const results = [];

  for (const product of products) {
    const best = await findBestTechnoshopMatch(product);
    if (!best.matched || used.has(best.candidate.url)) {
      results.push({ product: product.name, productSlug: product.slug, matched: false, score: best.score, title: best.candidate?.title });
      continue;
    }

    used.add(best.candidate.url);
    const scraped = await fetchTechnoshopProduct(best.candidate.url);
    if (!dryRun) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          sourceProvider: "technoshop",
          sourceUrl: best.candidate.url,
          sourcePriceStatus: scraped.status,
          sourceLastSyncedAt: new Date(),
          sourceRawPayload: jsonPayload(scraped),
          stock: scraped.status === "404" || scraped.status === "out" ? 0 : undefined,
        },
      });
    }
    results.push({
      product: product.name,
      productSlug: product.slug,
      matched: true,
      score: best.score,
      url: best.candidate.url,
      status: scraped.status,
      price: scraped.price,
      oldPrice: scraped.oldPrice,
      title: scraped.title,
    });
  }

  return {
    checked: products.length,
    linked: results.filter((result) => result.matched).length,
    unmatched: results.filter((result) => !result.matched).length,
    results,
  };
}

export async function syncTechnoshopPrices({ dryRun = false, archiveUnavailable = false } = {}) {
  const products = await prisma.product.findMany({
    where: { sourceProvider: "technoshop", sourceUrl: { not: null } },
    select: { id: true, name: true, price: true, oldPrice: true, stock: true, status: true, sourceUrl: true },
  });
  const results = [];

  for (const product of products) {
    if (!product.sourceUrl) continue;
    const scraped = await fetchTechnoshopProduct(product.sourceUrl);
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
