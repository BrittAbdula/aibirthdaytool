-- CreateTable
CREATE TABLE "MissingGenerator" (
  "id" TEXT NOT NULL,
  "searchTerm" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isProcessed" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,

  CONSTRAINT "MissingGenerator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissingGenerator_searchTerm_key" ON "MissingGenerator"("searchTerm");

-- CreateIndex
CREATE INDEX "MissingGenerator_count_idx" ON "MissingGenerator"("count");

-- CreateIndex
CREATE INDEX "MissingGenerator_createdAt_idx" ON "MissingGenerator"("createdAt"); 