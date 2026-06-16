"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import type { InstallationStatus, LeadStatus, OrderStatus, PaymentStatus, Prisma, ProductStatus } from "@prisma/client";

async function requireMutationAdmin(roles = ["owner", "manager", "sales"]) {
  const user = await requireAdmin(roles);
  if (!user) redirect("/admin/login");
  return user;
}

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length ? value : null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key);
  if (!raw) return fallback;
  const normalized = raw.replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : fallback;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function productPayload(formData: FormData): Prisma.ProductUncheckedCreateInput {
  const name = text(formData, "name");
  const model = text(formData, "model");
  const sku = text(formData, "sku");
  const slug = text(formData, "slug") || slugify(`${name}-${model}`);
  const oldPrice = optionalNumber(formData, "oldPrice");
  const costPrice = optionalNumber(formData, "costPrice");
  const kw = optionalNumber(formData, "kw");
  const areaMin = optionalNumber(formData, "recommendedAreaMin");
  const areaMax = optionalNumber(formData, "recommendedAreaMax");
  const btu = optionalNumber(formData, "btu");
  const sourceUrl = optionalText(formData, "sourceUrl");

  return {
    brandId: text(formData, "brandId"),
    categoryId: text(formData, "categoryId"),
    name,
    slug,
    model,
    sku,
    shortDescription: text(formData, "shortDescription"),
    description: text(formData, "description"),
    price: numberValue(formData, "price"),
    oldPrice,
    costPrice,
    stock: Math.trunc(numberValue(formData, "stock")),
    status: text(formData, "status", "draft") as ProductStatus,
    isFeatured: checked(formData, "isFeatured"),
    isBestSeller: checked(formData, "isBestSeller"),
    warrantyMonths: Math.trunc(numberValue(formData, "warrantyMonths", 24)),
    installationAvailable: checked(formData, "installationAvailable"),
    recommendedAreaMin: areaMin ? Math.trunc(areaMin) : null,
    recommendedAreaMax: areaMax ? Math.trunc(areaMax) : null,
    btu: btu ? Math.trunc(btu) : null,
    kw,
    energyClass: optionalText(formData, "energyClass"),
    inverter: text(formData, "inverter") ? text(formData, "inverter") === "true" : null,
    mainImageUrl: optionalText(formData, "mainImageUrl"),
    sourceProvider: sourceUrl ? optionalText(formData, "sourceProvider") ?? "manual" : null,
    sourceUrl,
    seoTitle: optionalText(formData, "seoTitle"),
    seoDescription: optionalText(formData, "seoDescription"),
  };
}

function parseLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function imagePayload(formData: FormData) {
  return parseLines(text(formData, "images"))
    .map((line, sortOrder) => {
      const [url, alt] = line.split("|").map((part) => part.trim());
      return url ? { url, alt: alt || text(formData, "name"), sortOrder } : null;
    })
    .filter(Boolean) as Prisma.ProductImageCreateManyProductInput[];
}

function specPayload(formData: FormData) {
  return parseLines(text(formData, "specs"))
    .map((line, sortOrder) => {
      const [key, value, group] = line.split("|").map((part) => part.trim());
      return key && value ? { key, value, group: group || null, sortOrder } : null;
    })
    .filter(Boolean) as Prisma.ProductSpecCreateManyProductInput[];
}

export async function createProduct(formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  const data = productPayload(formData);
  const product = await prisma.product.create({
    data: {
      ...data,
      images: { createMany: { data: imagePayload(formData) } },
      specs: { createMany: { data: specPayload(formData) } },
    },
  });
  await prisma.eventLog.create({ data: { type: "product_created", entityType: "product", entityId: product.id, payload: { name: product.name } } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  await prisma.product.update({
    where: { id },
    data: {
      ...productPayload(formData),
      images: { deleteMany: {}, createMany: { data: imagePayload(formData) } },
      specs: { deleteMany: {}, createMany: { data: specPayload(formData) } },
    },
  });
  await prisma.eventLog.create({ data: { type: "product_updated", entityType: "product", entityId: id } });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  redirect(`/admin/products/${id}`);
}

export async function deleteProduct(id: string) {
  await requireMutationAdmin(["owner"]);
  await prisma.product.delete({ where: { id } });
  await prisma.eventLog.create({ data: { type: "product_deleted", entityType: "product", entityId: id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateLeadStatus(id: string, formData: FormData) {
  await requireMutationAdmin();
  const nextFollowUp = text(formData, "nextFollowUpAt");
  await prisma.lead.update({
    where: { id },
    data: {
      status: text(formData, "status") as LeadStatus,
      nextFollowUpAt: nextFollowUp ? new Date(nextFollowUp) : null,
      message: optionalText(formData, "message"),
    },
  });
  revalidatePath("/admin/leads");
}

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireMutationAdmin();
  await prisma.order.update({
    where: { id },
    data: {
      status: text(formData, "status") as OrderStatus,
      paymentStatus: text(formData, "paymentStatus") as PaymentStatus,
      notes: optionalText(formData, "notes"),
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateInstallationTask(id: string, formData: FormData) {
  await requireMutationAdmin(["owner", "manager", "installer"]);
  const scheduledAt = text(formData, "scheduledAt");
  await prisma.installationTask.update({
    where: { id },
    data: {
      status: text(formData, "status") as InstallationStatus,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      assignedTeam: optionalText(formData, "assignedTeam"),
      notes: optionalText(formData, "notes"),
      extraCostNotes: optionalText(formData, "extraCostNotes"),
    },
  });
  revalidatePath("/admin/installations");
  revalidatePath("/admin");
}

export async function createBrand(formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  const name = text(formData, "name");
  await prisma.brand.create({
    data: {
      name,
      slug: text(formData, "slug") || slugify(name),
      logoUrl: optionalText(formData, "logoUrl"),
      description: optionalText(formData, "description"),
      warrantyNotes: optionalText(formData, "warrantyNotes"),
    },
  });
  revalidatePath("/admin/brands");
}

export async function createCategory(formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  const name = text(formData, "name");
  await prisma.category.create({
    data: {
      name,
      slug: text(formData, "slug") || slugify(name),
      description: optionalText(formData, "description"),
      imageUrl: optionalText(formData, "imageUrl"),
      seoTitle: optionalText(formData, "seoTitle"),
      seoDescription: optionalText(formData, "seoDescription"),
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
}

export async function createBlogPost(formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  const title = text(formData, "title");
  const status = text(formData, "status", "draft") as "draft" | "published" | "archived";
  await prisma.blogPost.create({
    data: {
      title,
      slug: text(formData, "slug") || slugify(title),
      excerpt: text(formData, "excerpt"),
      body: text(formData, "body"),
      coverImageUrl: optionalText(formData, "coverImageUrl"),
      status,
      category: optionalText(formData, "category"),
      author: optionalText(formData, "author"),
      seoTitle: optionalText(formData, "seoTitle"),
      seoDescription: optionalText(formData, "seoDescription"),
      publishedAt: status === "published" ? new Date() : null,
    },
  });
  revalidatePath("/admin/cms");
  revalidatePath("/blog");
}

export async function createFAQ(formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  await prisma.fAQ.create({
    data: {
      question: text(formData, "question"),
      answer: text(formData, "answer"),
      category: optionalText(formData, "category"),
      sortOrder: Math.trunc(numberValue(formData, "sortOrder")),
      isPublished: checked(formData, "isPublished"),
    },
  });
  revalidatePath("/admin/cms");
}

export async function updateSetting(formData: FormData) {
  await requireMutationAdmin(["owner", "manager"]);
  const key = text(formData, "key");
  const raw = text(formData, "value");
  let value: Prisma.InputJsonValue;
  try {
    value = JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    value = raw;
  }
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/admin/settings");
}
