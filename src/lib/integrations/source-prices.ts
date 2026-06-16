import { linkMideaProducts, syncMideaPrices } from "@/lib/integrations/midea";
import { linkTechnoshopProducts, syncTechnoshopPrices } from "@/lib/integrations/technoshop";

export async function linkSourceProducts({ dryRun = false } = {}) {
  return {
    midea: await linkMideaProducts({ dryRun }),
    technoshop: await linkTechnoshopProducts({ dryRun }),
  };
}

export async function syncSourcePrices({ dryRun = false, archiveUnavailable = false } = {}) {
  return {
    midea: await syncMideaPrices({ dryRun, archiveUnavailable }),
    technoshop: await syncTechnoshopPrices({ dryRun, archiveUnavailable }),
  };
}
