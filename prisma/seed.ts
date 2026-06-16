import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createPrismaAdapter } from "../src/lib/db/adapter";

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

const img = "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@gagrileba.ge" },
    update: {},
    create: { name: "Gagrileba Owner", email: "admin@gagrileba.ge", role: "owner", passwordHash: await bcrypt.hash("ChangeMe123!", 12) },
  });

  const categoryData = [
    ["კონდიციონერები", "air-conditioners"],
    ["გაზის ქვაბები", "gas-boilers"],
    ["გამათბობლები", "heaters"],
    ["წყლის გამაცხელებლები", "water-heaters"],
    ["აქსესუარები", "accessories"],
    ["მონტაჟი", "installation"],
  ];
  const brandNames = ["Midea", "GREE", "Millen", "VOX", "BEKO", "Ariston", "Demirdöküm", "Celsiusi"];

  for (const [name, slug] of categoryData) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description: `${name} სწრაფი მიწოდებით და გარანტიით`, seoTitle: `${name} | Gagrileba.ge`, seoDescription: `${name} პროფესიონალური კონსულტაციით და მონტაჟით.` },
    });
  }
  for (const name of brandNames) {
    await prisma.brand.upsert({ where: { slug: name.toLowerCase().replace("ö", "o") }, update: {}, create: { name, slug: name.toLowerCase().replace("ö", "o"), warrantyNotes: "გარანტია მოქმედებს ოფიციალური პირობებით." } });
  }

  const cat = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c]));
  const brands = Object.fromEntries((await prisma.brand.findMany()).map((b) => [b.name, b]));
  const products = [
    { brand: "Midea", category: "air-conditioners", name: "Midea AF-12 ინვერტორული კონდიციონერი", slug: "midea-af-12", model: "AF-12", sku: "MID-AF12", price: 1299, oldPrice: 1499, stock: 12, areaMin: 20, areaMax: 35, btu: 12000, inverter: true, best: true },
    { brand: "Midea", category: "air-conditioners", name: "Midea AF-18 ინვერტორული კონდიციონერი", slug: "midea-af-18", model: "AF-18", sku: "MID-AF18", price: 1899, oldPrice: 2099, stock: 8, areaMin: 35, areaMax: 55, btu: 18000, inverter: true, best: true },
    { brand: "GREE", category: "heaters", name: "GREE ERSEL გაზის გამათბობელი", slug: "gree-ersel-gas-heater", model: "ERSEL", sku: "GRE-ERS", price: 799, stock: 6, areaMin: 25, areaMax: 45, kw: 4.2, inverter: false, best: true },
    { brand: "Midea", category: "gas-boilers", name: "Midea გაზის ქვაბი 24 kW", slug: "midea-gas-boiler-24kw", model: "Boiler 24", sku: "MID-BOI24", price: 2199, stock: 4, areaMin: 70, areaMax: 140, kw: 24, inverter: null, best: false },
    { brand: "Ariston", category: "water-heaters", name: "Ariston წყლის გამაცხელებელი 80L", slug: "ariston-water-heater-80l", model: "80L", sku: "ARI-WH80", price: 649, stock: 9, areaMin: null, areaMax: null, kw: 1.8, inverter: null, best: false },
    { brand: "Celsiusi", category: "accessories", name: "სპილენძის მილი კონდიციონერისთვის", slug: "copper-pipe-air-conditioner", model: "Copper Tube", sku: "ACC-COPPER", price: 35, stock: 80, areaMin: null, areaMax: null, kw: null, inverter: null, best: false },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        brandId: brands[p.brand].id,
        categoryId: cat[p.category].id,
        name: p.name,
        slug: p.slug,
        model: p.model,
        sku: p.sku,
        shortDescription: "სანდო მოდელი სწრაფი მიწოდებით, პროფესიონალური მონტაჟით და გარანტიით.",
        description: "ეს პროდუქტი შერჩეულია Gagrileba.ge-ის კატალოგისთვის როგორც პრაქტიკული, მოთხოვნადი და მარტივად ასახსნელი არჩევანი. შეძენისას შეგიძლიათ მოითხოვოთ მონტაჟი, კონსულტაცია და გადახდის მოქნილი მეთოდი.",
        price: p.price,
        oldPrice: p.oldPrice,
        costPrice: Math.round(p.price * 0.78),
        stock: p.stock,
        status: "published",
        isFeatured: true,
        isBestSeller: p.best,
        warrantyMonths: 24,
        installationAvailable: true,
        recommendedAreaMin: p.areaMin,
        recommendedAreaMax: p.areaMax,
        btu: p.btu,
        kw: p.kw,
        energyClass: "A++",
        inverter: p.inverter,
        mainImageUrl: img,
        seoTitle: `${p.name} ფასი და მონტაჟი`,
        seoDescription: `${p.name} სწრაფი მიწოდებით, პროფესიონალური მონტაჟით და გარანტიით.`,
        specs: { create: [{ key: "მოდელი", value: p.model }, { key: "გარანტია", value: "24 თვე" }, { key: "მონტაჟი", value: "ხელმისაწვდომია" }] },
        images: { create: [{ url: img, alt: p.name, sortOrder: 1 }] },
      },
    });
    console.log("seeded", product.slug);
  }

  const guideTitles = [
    "როგორ შევარჩიოთ კონდიციონერი ოთახის ფართობის მიხედვით",
    "ინვერტორული თუ ჩვეულებრივი კონდიციონერი?",
    "რა ღირს კონდიციონერის მონტაჟი საქართველოში?",
    "გაზის ქვაბი თუ ელექტრო გამათბობელი?",
    "როგორ მოვამზადოთ კონდიციონერი ზაფხულისთვის?",
  ];
  const guideSlugs = [
    "how-to-choose-air-conditioner-by-room-size",
    "inverter-vs-regular-air-conditioner",
    "air-conditioner-installation-cost-georgia",
    "gas-boiler-vs-electric-heater",
    "prepare-air-conditioner-for-summer",
  ];
  for (const [index, title] of guideTitles.entries()) {
    const slug = guideSlugs[index];
    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: { title, slug, excerpt: "მოკლე და პრაქტიკული გზამკვლევი სწორ არჩევანზე.", body: `${title}\n\nსწორი არჩევა იწყება ფართობით, ბიუჯეტით, მონტაჟის პირობებით და გარანტიით. თუ არ ხართ დარწმუნებული, დაგვიტოვეთ ნომერი და შეგირჩევთ 2-3 ვარიანტს.`, status: "published", category: "გიდი", author: "Gagrileba.ge", publishedAt: new Date(), seoTitle: title, seoDescription: "HVAC გიდი Gagrileba.ge-ისგან." },
    });
  }

  await prisma.fAQ.createMany({
    data: [
      { question: "რამდენად სწრაფად ხდება მონტაჟი?", answer: "დრო დამოკიდებულია მარაგსა და მისამართზე, ხშირად შესაძლებელია უახლოეს დღეებში." },
      { question: "შეიძლება პროდუქტი მონტაჟით შევიძინო?", answer: "დიახ, შეკვეთაში შეგიძლიათ მიუთითოთ მონტაჟის საჭიროება." },
    ],
    skipDuplicates: true,
  });

  await prisma.setting.upsert({ where: { key: "company" }, update: {}, create: { key: "company", value: { phone: "+995 599 00 00 00", email: "info@gagrileba.ge", installationBasePrice: 150 } } });
  await prisma.lead.create({ data: { name: "საცდელი ლიდი", phone: "+995 555 11 22 33", source: "seed", status: "new", productInterest: "Midea AF-12", assignedToId: admin.id } });
}

main().finally(async () => prisma.$disconnect());
