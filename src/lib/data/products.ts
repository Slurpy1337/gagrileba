import { prisma } from "@/lib/db/prisma";

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  area?: string;
  btu?: string;
  inverter?: string;
  stock?: string;
  installation?: string;
  sort?: string;
};

export async function getProducts(filters: ProductFilters = {}) {
  const [areaMin, areaMax] = filters.area?.split("-").map(Number) ?? [];
  return prisma.product.findMany({
    where: {
      status: "published",
      AND: [
        filters.q
          ? {
              OR: [
                { name: { contains: filters.q, mode: "insensitive" } },
                { model: { contains: filters.q, mode: "insensitive" } },
                { sku: { contains: filters.q, mode: "insensitive" } },
                { brand: { name: { contains: filters.q, mode: "insensitive" } } },
              ],
            }
          : {},
        filters.category ? { category: { slug: filters.category } } : {},
        filters.brand ? { brand: { slug: filters.brand } } : {},
        filters.minPrice ? { price: { gte: filters.minPrice } } : {},
        filters.maxPrice ? { price: { lte: filters.maxPrice } } : {},
        areaMin ? { recommendedAreaMax: { gte: areaMin }, recommendedAreaMin: { lte: areaMax || 999 } } : {},
        filters.btu ? { btu: Number(filters.btu) } : {},
        filters.inverter ? { inverter: filters.inverter === "true" } : {},
        filters.stock === "in" ? { stock: { gt: 0 } } : {},
        filters.installation === "true" ? { installationAvailable: true } : {},
      ],
    },
    include: { brand: true, category: true },
    orderBy:
      filters.sort === "price-asc"
        ? { price: "asc" }
        : filters.sort === "price-desc"
          ? { price: "desc" }
          : filters.sort === "newest"
            ? { createdAt: "desc" }
            : filters.sort === "best"
              ? { isBestSeller: "desc" }
              : [{ isFeatured: "desc" }, { isBestSeller: "desc" }, { createdAt: "desc" }],
  });
}

export async function getProductBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return prisma.product.findFirst({
    where: { OR: [{ slug: decodedSlug }, { slug }] },
    include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specs: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getStorefrontFacets() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { slug: { not: "gas-boilers" } }, orderBy: { name: "asc" } }),
  ]);
  return { brands, categories };
}

export async function getBestSellers() {
  return prisma.product.findMany({
    where: { status: "published", isBestSeller: true },
    include: { brand: true, category: true },
    take: 6,
  });
}
