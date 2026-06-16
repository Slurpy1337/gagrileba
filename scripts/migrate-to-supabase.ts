import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const args = new Set(process.argv.slice(2));
const localUrl = process.env.LOCAL_DATABASE_URL ?? process.env.DATABASE_URL;
const targetUrl = process.env.SUPABASE_DATABASE_URL ?? process.env.TARGET_DATABASE_URL;

if (!localUrl) {
  throw new Error("Missing LOCAL_DATABASE_URL or DATABASE_URL for the source database.");
}

if (!targetUrl) {
  throw new Error("Missing SUPABASE_DATABASE_URL or TARGET_DATABASE_URL for the Supabase target database.");
}

if (localUrl === targetUrl) {
  throw new Error("Source and target database URLs are identical. Refusing to continue.");
}

if (!args.has("--yes")) {
  throw new Error("Refusing to run without --yes. This script copies local data into the target database.");
}

const source = new PrismaClient({ adapter: new PrismaPg(localUrl), log: ["error"] });
const target = new PrismaClient({ adapter: new PrismaPg(targetUrl), log: ["error"] });

async function copyModel<T>(
  name: string,
  read: () => Promise<T[]>,
  write: (rows: T[]) => Promise<unknown>,
) {
  const rows = await read();
  if (rows.length > 0) {
    await write(rows);
  }
  console.log(`${name}: ${rows.length}`);
}

async function truncateTarget() {
  console.log("Clearing target database...");
  await target.eventLog.deleteMany();
  await target.setting.deleteMany();
  await target.fAQ.deleteMany();
  await target.blogPost.deleteMany();
  await target.installationTask.deleteMany();
  await target.leadNote.deleteMany();
  await target.lead.deleteMany();
  await target.payment.deleteMany();
  await target.orderItem.deleteMany();
  await target.order.deleteMany();
  await target.cart.deleteMany();
  await target.productSpec.deleteMany();
  await target.productImage.deleteMany();
  await target.product.deleteMany();
  await target.category.deleteMany();
  await target.brand.deleteMany();
  await target.user.deleteMany();
}

async function copyCategories() {
  const rows = await source.category.findMany({ orderBy: { createdAt: "asc" } });
  const withoutParents = rows.map((category) => ({ ...category, parentId: null }));
  if (withoutParents.length > 0) {
    await target.category.createMany({ data: withoutParents });
  }

  const children = rows.filter((category) => category.parentId);
  for (const category of children) {
    await target.category.update({
      where: { id: category.id },
      data: { parentId: category.parentId },
    });
  }

  console.log(`categories: ${rows.length}`);
}

async function main() {
  if (args.has("--truncate")) {
    await truncateTarget();
  }

  console.log("Copying local data to Supabase...");
  await copyModel("users", () => source.user.findMany(), (data) => target.user.createMany({ data }));
  await copyModel("brands", () => source.brand.findMany(), (data) => target.brand.createMany({ data }));
  await copyCategories();
  await copyModel("products", () => source.product.findMany(), (data) =>
    target.product.createMany({
      data: data.map((product) => ({
        ...product,
        sourceRawPayload: product.sourceRawPayload === null ? Prisma.JsonNull : product.sourceRawPayload,
      })),
    }),
  );
  await copyModel("productImages", () => source.productImage.findMany(), (data) => target.productImage.createMany({ data }));
  await copyModel("productSpecs", () => source.productSpec.findMany(), (data) => target.productSpec.createMany({ data }));
  await copyModel("carts", () => source.cart.findMany(), (data) =>
    target.cart.createMany({
      data: data.map((cart) => ({ ...cart, payload: cart.payload === null ? Prisma.JsonNull : cart.payload })),
    }),
  );
  await copyModel("orders", () => source.order.findMany(), (data) => target.order.createMany({ data }));
  await copyModel("orderItems", () => source.orderItem.findMany(), (data) => target.orderItem.createMany({ data }));
  await copyModel("payments", () => source.payment.findMany(), (data) =>
    target.payment.createMany({
      data: data.map((payment) => ({ ...payment, rawPayload: payment.rawPayload === null ? Prisma.JsonNull : payment.rawPayload })),
    }),
  );
  await copyModel("leads", () => source.lead.findMany(), (data) => target.lead.createMany({ data }));
  await copyModel("leadNotes", () => source.leadNote.findMany(), (data) => target.leadNote.createMany({ data }));
  await copyModel("installations", () => source.installationTask.findMany(), (data) => target.installationTask.createMany({ data }));
  await copyModel("blogPosts", () => source.blogPost.findMany(), (data) => target.blogPost.createMany({ data }));
  await copyModel("faqs", () => source.fAQ.findMany(), (data) => target.fAQ.createMany({ data }));
  await copyModel("settings", () => source.setting.findMany(), (data) =>
    target.setting.createMany({
      data: data.map((setting) => ({ ...setting, value: setting.value === null ? Prisma.JsonNull : setting.value })),
    }),
  );
  await copyModel("eventLogs", () => source.eventLog.findMany(), (data) =>
    target.eventLog.createMany({
      data: data.map((eventLog) => ({ ...eventLog, payload: eventLog.payload === null ? Prisma.JsonNull : eventLog.payload })),
    }),
  );

  console.log("Done.");
}

main()
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
