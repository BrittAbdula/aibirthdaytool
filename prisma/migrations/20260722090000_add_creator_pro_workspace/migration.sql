-- Creator Pro keeps recurring recipient data separate from one-off card history.
CREATE TABLE "CreatorRecipient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occasionType" TEXT NOT NULL,
    "occasionDate" DATE NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorBrandPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#B4375F',
    "tone" TEXT NOT NULL DEFAULT 'warm-professional',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorBrandPreset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandPresetId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorBatchItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientName" TEXT NOT NULL,
    "occasionType" TEXT NOT NULL,
    "occasionDate" DATE NOT NULL,
    "cardId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorBatchItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreatorRecipient_userId_name_occasionType_occasionDate_key"
ON "CreatorRecipient"("userId", "name", "occasionType", "occasionDate");
CREATE INDEX "CreatorRecipient_userId_occasionDate_idx"
ON "CreatorRecipient"("userId", "occasionDate");

CREATE UNIQUE INDEX "CreatorBrandPreset_userId_key" ON "CreatorBrandPreset"("userId");

CREATE INDEX "CreatorBatch_userId_createdAt_idx" ON "CreatorBatch"("userId", "createdAt");
CREATE INDEX "CreatorBatch_userId_isPreview_idx" ON "CreatorBatch"("userId", "isPreview");

CREATE UNIQUE INDEX "CreatorBatchItem_batchId_recipientId_key"
ON "CreatorBatchItem"("batchId", "recipientId");
CREATE INDEX "CreatorBatchItem_batchId_status_idx" ON "CreatorBatchItem"("batchId", "status");
CREATE INDEX "CreatorBatchItem_cardId_idx" ON "CreatorBatchItem"("cardId");

ALTER TABLE "CreatorRecipient"
ADD CONSTRAINT "CreatorRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorBrandPreset"
ADD CONSTRAINT "CreatorBrandPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorBatch"
ADD CONSTRAINT "CreatorBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorBatch"
ADD CONSTRAINT "CreatorBatch_brandPresetId_fkey" FOREIGN KEY ("brandPresetId") REFERENCES "CreatorBrandPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CreatorBatchItem"
ADD CONSTRAINT "CreatorBatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CreatorBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorBatchItem"
ADD CONSTRAINT "CreatorBatchItem_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "CreatorRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CreatorBatchItem"
ADD CONSTRAINT "CreatorBatchItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "ApiLog"("cardId") ON DELETE SET NULL ON UPDATE CASCADE;
