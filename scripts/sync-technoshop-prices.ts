import { prisma } from "../src/lib/db/prisma";
import { linkTechnoshopProducts, syncTechnoshopPrices } from "../src/lib/integrations/technoshop";

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const archiveUnavailable = args.has("--archive-unavailable") || process.env.SOURCE_SYNC_ARCHIVE_UNAVAILABLE === "true";

  if (args.has("--link")) {
    const result = await linkTechnoshopProducts({ dryRun });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const result = await syncTechnoshopPrices({ dryRun, archiveUnavailable });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
