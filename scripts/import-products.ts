import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";
import { createPrismaAdapter } from "../src/lib/db/adapter";

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

type WooRow = {
  Name?: string;
  Slug?: string;
  SKU?: string;
  "Regular price"?: string;
  "Sale price"?: string;
  Stock?: string;
  Categories?: string;
  Images?: string;
  Description?: string;
  "Short description"?: string;
};

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: npm run import:products -- path/to/woocommerce.csv");
  const rows = parse(fs.readFileSync(file), { columns: true, skip_empty_lines: true }) as WooRow[];
  const fallbackBrand = await prisma.brand.upsert({ where: { slug: "imported" }, update: {}, create: { name: "Imported", slug: "imported" } });
  for (const row of rows) {
    const categoryName = row.Categories?.split(",")[0]?.trim() || "Imported";
    const category = await prisma.category.upsert({ where: { slug: slugify(categoryName) }, update: {}, create: { name: categoryName, slug: slugify(categoryName) } });
    const price = Number(row["Sale price"] || row["Regular price"] || 0);
    if (!row.Name || !row.SKU || !price) continue;
    await prisma.product.upsert({
      where: { sku: row.SKU },
      update: { price, stock: Number(row.Stock || 0), description: row.Description || "" },
      create: {
        brandId: fallbackBrand.id,
        categoryId: category.id,
        name: row.Name,
        slug: row.Slug || slugify(row.Name),
        model: row.SKU,
        sku: row.SKU,
        shortDescription: row["Short description"] || row.Name,
        description: row.Description || row.Name,
        price,
        oldPrice: row["Sale price"] ? Number(row["Regular price"] || price) : null,
        stock: Number(row.Stock || 0),
        status: "draft",
        mainImageUrl: row.Images?.split(",")[0]?.trim(),
      },
    });
  }
  console.log(`Imported ${rows.length} WooCommerce rows`);
}

main().finally(async () => prisma.$disconnect());
