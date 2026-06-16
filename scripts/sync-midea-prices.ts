import { linkMideaProducts, syncMideaPrices } from "../src/lib/integrations/midea";
import { prisma } from "../src/lib/db/prisma";

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const archiveUnavailable = args.has("--archive-unavailable") || process.env.MIDEA_SYNC_ARCHIVE_UNAVAILABLE === "true";

  if (args.has("--link")) {
    const result = await linkMideaProducts({ dryRun });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const result = await syncMideaPrices({ dryRun, archiveUnavailable });
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
