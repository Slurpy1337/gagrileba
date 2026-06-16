import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../env";

export function createPrismaAdapter() {
  return new PrismaPg(env.DATABASE_URL);
}
