import { prisma } from "../src/lib/db/prisma";
import { linkMideaProducts, syncMideaPrices } from "../src/lib/integrations/midea";
import { linkTechnoshopProducts, syncTechnoshopPrices } from "../src/lib/integrations/technoshop";

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const link = args.has("--link");
  const archiveUnavailable =
    args.has("--archive-unavailable") ||
    process.env.SOURCE_SYNC_ARCHIVE_UNAVAILABLE === "true" ||
    process.env.MIDEA_SYNC_ARCHIVE_UNAVAILABLE === "true";

  const result = link
    ? {
        midea: await linkMideaProducts({ dryRun }),
        technoshop: await linkTechnoshopProducts({ dryRun }),
      }
    : {
        midea: await syncMideaPrices({ dryRun, archiveUnavailable }),
        technoshop: await syncTechnoshopPrices({ dryRun, archiveUnavailable }),
      };

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
