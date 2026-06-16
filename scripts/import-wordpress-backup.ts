import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "../src/lib/db/adapter";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

type OldProduct = {
  id: number;
  title: string;
  slug: string;
  status: "publish" | "draft";
  content: string | null;
  excerpt: string | null;
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  stockStatus: string | null;
  stock: string | null;
  thumbnailId: string | null;
  galleryIds: string | null;
  brand: string | null;
  categories: string | null;
  btu: string | null;
  sku: string | null;
};

type OldAttachment = {
  id: number;
  title: string;
  guid: string;
  file: string | null;
};

const oldUploadsRoot = path.resolve("old/domains/gagrileba.ge/public_html/wp-content/uploads");
const publicUploadsRoot = path.resolve("public/wp-content/uploads");

function queryOldDb<T>(sql: string): T[] {
  const output = execFileSync(
    "docker",
    ["exec", "-i", "gagrileba-old-db", "mariadb", "-uroot", "-proot", "oldwp", "--batch", "--raw", "--skip-column-names"],
    { input: sql, encoding: "utf8", maxBuffer: 200 * 1024 * 1024 },
  );

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(Buffer.from(line, "base64").toString("utf8")) as T);
}

function cleanText(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/Â/g, "")
    .replace(/ გ/g, " გ")
    .replace(/ დ/g, " დ")
    .replace(/ წ/g, " წ")
    .replace(/ ს/g, " ს")
    .replace(/ შ/g, " შ")
    .replace(/ მ/g, " მ")
    .replace(/ კ/g, " კ")
    .replace(/ ფ/g, " ფ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtml(html: string) {
  return cleanText(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/[ \t]{2,}/g, " "),
  );
}

function decodeSlug(value: string, fallback: string) {
  try {
    const decoded = decodeURIComponent(value || "");
    return slugify(decoded || fallback) || `product-${Date.now()}`;
  } catch {
    return slugify(value || fallback) || `product-${Date.now()}`;
  }
}

function numberOrNull(value: string | null | undefined) {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function inferModel(title: string, slug: string) {
  const modelMatch = title.match(/[A-Z0-9]{2,}(?:[-/ ][A-Z0-9]+){1,}/i);
  return cleanText(modelMatch?.[0] || slug).slice(0, 80);
}

const canonicalCategories: Record<string, string> = {
  "gas-boilers": "გაზის ქვაბები",
  accessories: "აქსესუარები",
  "air-conditioners": "კონდიციონერები",
};

function inferCategory(product: OldProduct) {
  const combined = `${product.categories || ""} ${product.title}`.toLowerCase();
  if (combined.includes("ქვაბ") || combined.includes("boiler") || combined.includes("heating")) {
    return { name: canonicalCategories["gas-boilers"], slug: "gas-boilers" };
  }
  if (combined.includes("მილ") || combined.includes("tube") || combined.includes("accessor")) {
    return { name: canonicalCategories.accessories, slug: "accessories" };
  }
  return { name: canonicalCategories["air-conditioners"], slug: "air-conditioners" };
}

function inferBrand(product: OldProduct) {
  const brand = cleanText((product.brand || "").split("|").find(Boolean));
  if (brand) return brand.toUpperCase() === "GREE" ? "Gree" : brand;
  const title = product.title.toLowerCase();
  for (const candidate of ["Midea", "Gree", "Beko", "Millen", "Vox", "Ariston"]) {
    if (title.includes(candidate.toLowerCase())) return candidate;
  }
  return "Gagrileba";
}

function parseBtu(product: OldProduct) {
  const source = `${product.btu || ""}\n${product.content || ""}\n${product.excerpt || ""}`;
  const btu = source.match(/(\d{4,5})\s*(?:BTU|btu)/)?.[1] || source.match(/^(\d{4,5})\s*\|/)?.[1];
  return btu ? Number(btu) : null;
}

function parseArea(product: OldProduct) {
  const source = `${product.btu || ""}\n${stripHtml(product.content || "")}`;
  const range = source.match(/(\d{1,3})\s*[-–]\s*(\d{1,3})\s*(?:მ²|მ2|კვ\.?მ|m²)/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = source.match(/(\d{1,3})\s*(?:მ²|მ2|კვ\.?მ|m²)/i);
  if (single) {
    const max = Number(single[1]);
    return { min: Math.max(0, max - 10), max };
  }
  const btu = parseBtu(product);
  if (!btu) return { min: null, max: null };
  const max = Math.round(btu / 350);
  return { min: Math.max(10, max - 10), max };
}

function extractSpecs(product: OldProduct) {
  const specs: { key: string; value: string; group?: string }[] = [];
  const html = product.content || "";
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => stripHtml(match[1])).filter(Boolean);
    if (cells.length >= 2) {
      const key = cells[0];
      const value = cells[cells.length - 1];
      if (key && value && key !== value) specs.push({ key, value, group: "ტექნიკური" });
    }
  }

  for (const line of stripHtml(html).split(/\r?\n/)) {
    const match = line.match(/^([^:：]{2,80})[:：]\s*(.{1,180})$/);
    if (match) specs.push({ key: cleanText(match[1]), value: cleanText(match[2]), group: "ძირითადი" });
  }

  const seen = new Set<string>();
  return specs
    .filter((spec) => {
      const id = `${spec.key}:${spec.value}`.toLowerCase();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 40);
}

function imageIds(product: OldProduct) {
  return [...new Set([product.thumbnailId, ...(product.galleryIds || "").split(",")].map((id) => Number(id)).filter(Boolean))];
}

function publicImageUrl(attachment: OldAttachment | undefined) {
  if (!attachment?.file) return null;
  const source = path.join(oldUploadsRoot, attachment.file.replace(/\//g, path.sep));
  if (!fs.existsSync(source)) return null;
  const target = path.join(publicUploadsRoot, attachment.file.replace(/\//g, path.sep));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  return `/wp-content/uploads/${attachment.file.replace(/\\/g, "/")}`;
}

async function main() {
  const products = queryOldDb<OldProduct>(`
    SELECT REPLACE(TO_BASE64(JSON_OBJECT(
      'id', p.ID,
      'title', p.post_title,
      'slug', p.post_name,
      'status', p.post_status,
      'content', p.post_content,
      'excerpt', p.post_excerpt,
      'price', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_price' ORDER BY meta_id DESC LIMIT 1),
      'regularPrice', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_regular_price' ORDER BY meta_id DESC LIMIT 1),
      'salePrice', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_sale_price' ORDER BY meta_id DESC LIMIT 1),
      'stockStatus', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_stock_status' ORDER BY meta_id DESC LIMIT 1),
      'stock', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_stock' ORDER BY meta_id DESC LIMIT 1),
      'thumbnailId', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_thumbnail_id' ORDER BY meta_id DESC LIMIT 1),
      'galleryIds', (SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_product_image_gallery' ORDER BY meta_id DESC LIMIT 1),
      'brand', COALESCE((SELECT GROUP_CONCAT(DISTINCT t.name SEPARATOR '|') FROM wp_term_relationships tr JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id=tr.term_taxonomy_id JOIN wp_terms t ON t.term_id=tt.term_id WHERE tr.object_id=p.ID AND tt.taxonomy IN ('product_brand','pa_brand')), ''),
      'categories', COALESCE((SELECT GROUP_CONCAT(DISTINCT t.name SEPARATOR '|') FROM wp_term_relationships tr JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id=tr.term_taxonomy_id JOIN wp_terms t ON t.term_id=tt.term_id WHERE tr.object_id=p.ID AND tt.taxonomy='product_cat'), ''),
      'btu', COALESCE((SELECT GROUP_CONCAT(DISTINCT t.name SEPARATOR '|') FROM wp_term_relationships tr JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id=tr.term_taxonomy_id JOIN wp_terms t ON t.term_id=tt.term_id WHERE tr.object_id=p.ID AND tt.taxonomy='pa_btu'), ''),
      'sku', COALESCE((SELECT meta_value FROM wp_postmeta WHERE post_id=p.ID AND meta_key='_sku' ORDER BY meta_id DESC LIMIT 1), '')
    )), '\\n', '')
    FROM wp_posts p
    WHERE p.post_type='product' AND p.post_status IN ('publish','draft')
    ORDER BY p.ID;
  `);

  const attachments = queryOldDb<OldAttachment>(`
    SELECT REPLACE(TO_BASE64(JSON_OBJECT(
      'id', p.ID,
      'title', p.post_title,
      'guid', p.guid,
      'file', file.meta_value
    )), '\\n', '')
    FROM wp_posts p
    LEFT JOIN wp_postmeta file ON file.post_id=p.ID AND file.meta_key='_wp_attached_file'
    WHERE p.post_type='attachment';
  `);
  const attachmentsById = new Map(attachments.map((item) => [Number(item.id), item]));

  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  let imported = 0;
  let copiedImages = 0;
  const usedSlugs = new Set<string>();
  const usedSkus = new Set<string>();

  for (const oldProduct of products) {
    const price = numberOrNull(oldProduct.price || oldProduct.salePrice || oldProduct.regularPrice);
    if (!price) continue;

    const brandName = inferBrand(oldProduct);
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(brandName) },
      update: { name: brandName },
      create: { name: brandName, slug: slugify(brandName) },
    });

    const categoryInfo = inferCategory(oldProduct);
    const category = await prisma.category.upsert({
      where: { slug: categoryInfo.slug },
      update: { name: categoryInfo.name },
      create: { name: categoryInfo.name, slug: categoryInfo.slug },
    });

    const baseSlug = decodeSlug(oldProduct.slug, oldProduct.title);
    let slug = baseSlug;
    for (let i = 2; usedSlugs.has(slug); i++) slug = `${baseSlug}-${i}`;
    usedSlugs.add(slug);

    const model = inferModel(oldProduct.title, slug);
    const baseSku = cleanText(oldProduct.sku) || model || slug;
    let sku = baseSku;
    for (let i = 2; usedSkus.has(sku); i++) sku = `${baseSku}-${i}`;
    usedSkus.add(sku);

    const area = parseArea(oldProduct);
    const btu = parseBtu(oldProduct);
    const specs = extractSpecs(oldProduct);
    const images = imageIds(oldProduct)
      .map((id) => publicImageUrl(attachmentsById.get(id)))
      .filter((url): url is string => Boolean(url));
    copiedImages += images.length;

    const shortDescription = stripHtml(oldProduct.excerpt || oldProduct.content || oldProduct.title).slice(0, 280) || oldProduct.title;
    const description = stripHtml(oldProduct.content || oldProduct.excerpt || oldProduct.title);
    const regularPrice = numberOrNull(oldProduct.regularPrice);
    const salePrice = numberOrNull(oldProduct.salePrice);

    await prisma.product.create({
      data: {
        brandId: brand.id,
        categoryId: category.id,
        name: cleanText(oldProduct.title),
        slug,
        model,
        sku,
        shortDescription,
        description,
        price,
        oldPrice: salePrice && regularPrice && regularPrice > salePrice ? regularPrice : null,
        stock: oldProduct.stockStatus === "instock" ? Number(oldProduct.stock || 5) || 5 : 0,
        status: oldProduct.status === "publish" ? "published" : "draft",
        isFeatured: oldProduct.status === "publish" && imported < 12,
        isBestSeller: oldProduct.status === "publish" && imported < 6,
        warrantyMonths: description.includes("5 წელი") || description.includes("5 year") ? 60 : 24,
        installationAvailable: categoryInfo.slug !== "accessories",
        recommendedAreaMin: area.min,
        recommendedAreaMax: area.max,
        btu,
        inverter: /ინვერტ|inverter/i.test(`${oldProduct.categories || ""}\n${description}`),
        mainImageUrl: images[0] || null,
        seoTitle: cleanText(oldProduct.title),
        seoDescription: shortDescription,
        images: {
          create: images.map((url, index) => ({
            url,
            alt: cleanText(oldProduct.title),
            sortOrder: index,
          })),
        },
        specs: {
          create: specs.map((spec, index) => ({ ...spec, sortOrder: index })),
        },
      },
    });
    imported++;
  }

  await prisma.setting.upsert({
    where: { key: "wordpress_import" },
    update: { value: { importedAt: new Date().toISOString(), products: imported, images: copiedImages } },
    create: { key: "wordpress_import", value: { importedAt: new Date().toISOString(), products: imported, images: copiedImages } },
  });

  console.log(`Imported ${imported} products and copied ${copiedImages} product images.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
