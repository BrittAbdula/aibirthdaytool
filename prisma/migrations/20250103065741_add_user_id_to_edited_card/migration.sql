-- AlterTable
ALTER TABLE "EditedCard" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "EditedCard_userId_idx" ON "EditedCard"("userId");

-- AddForeignKey
ALTER TABLE "EditedCard" ADD CONSTRAINT "EditedCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
