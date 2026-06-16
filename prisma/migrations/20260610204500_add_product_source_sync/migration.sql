ALTER TABLE "Product"
  ADD COLUMN "sourceProvider" TEXT,
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "sourcePriceStatus" TEXT,
  ADD COLUMN "sourceLastSyncedAt" TIMESTAMP(3),
  ADD COLUMN "sourceRawPayload" JSONB;

CREATE INDEX "Product_sourceProvider_sourceUrl_idx" ON "Product"("sourceProvider", "sourceUrl");
